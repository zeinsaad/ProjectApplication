using ProjectTest.DatabaseManager.Business;
using ProjectTest.DatabaseManager.Entities;
using ProjectTest.DatabaseManager.Entities.Reports;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace ProjectTest.Controllers
{
	[RoutePrefix("product")]
	public class ProductAPIController : ApiController
    {
		private readonly ProductManager _productManager;

		public ProductAPIController()
		{
			_productManager = new ProductManager();
		}


		[HttpGet]
		[Route("GetProducts")]
		public List<ProductDetails> GetProducts(string name = null , int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null , bool? isActive = null , int? stockStatus = null, bool? discountStatus = null)
		{
			return _productManager.GetProducts(name,categoryId, minPrice, maxPrice, isActive,stockStatus,discountStatus);
		}

		[HttpPost]
		[Route("AddProduct")]
		public void AddProduct(Product product)
		{
			if (product.ProductImages == null || product.ProductImages.Count == 0)
			{
				throw new ArgumentException("No files uploaded.");
			}
		

			List<ProductImage> savedFilePaths = new List<ProductImage>();

			// Process the uploaded image(s)
			foreach (var productImage in product.ProductImages)
			{
				if (string.IsNullOrEmpty(productImage.ImagePath))
				{
					continue; // Skip if no base64 string is provided
				}

				byte[] fileBytes = Convert.FromBase64String(productImage.ImagePath);
				string uniqueFileName = Guid.NewGuid().ToString() + ".jpg";
				string relativePath = "~/Uploads/Products/" + uniqueFileName;
				string absolutePath = HttpContext.Current.Server.MapPath(relativePath);

				string directoryPath = Path.GetDirectoryName(absolutePath);
				if (!Directory.Exists(directoryPath))
				{
					Directory.CreateDirectory(directoryPath);
				}

				// Save the file to the server
				File.WriteAllBytes(absolutePath, fileBytes);
				savedFilePaths.Add(new ProductImage { ImagePath = "/Uploads/Products/" + uniqueFileName }); // Relative path
			}

			// Join all file paths into a single string to pass to the stored procedure
			product.ProductImages = savedFilePaths;

			// Assuming you have a method to call the stored procedure for adding products with images
			_productManager.AddProduct(
				product
			);
		}


		[HttpPost]
		[Route("EditProduct/{ProductId}")]
		public void EditProduct(int ProductId, Product product)
		{
			try
			{
				// Get existing product from DB
				var existingProduct = _productManager.GetProductById(ProductId);
				var updatedImagePaths = new List<string>();

				foreach (ProductImage photo in product.ProductImages)
				{
					bool isExistingImage = existingProduct.ProductImages
						.Any(img => img.ImagePath.Trim().Equals(photo.ImagePath.Trim(), StringComparison.OrdinalIgnoreCase));

					if (!string.IsNullOrEmpty(photo.ImagePath) && !isExistingImage)
					{
						// It's a new base64 image
					//	string base64Data = photo.ImagePath.Split(',')[1];
						byte[] fileBytes = Convert.FromBase64String(photo.ImagePath);
						string uniqueFileName = Guid.NewGuid().ToString() + ".jpg";
						string relativePath = "~/Uploads/Products/" + uniqueFileName;
						string absolutePath = HttpContext.Current.Server.MapPath(relativePath);

						// Ensure the directory exists
						string directoryPath = Path.GetDirectoryName(absolutePath);
						if (!Directory.Exists(directoryPath))
						{
							Directory.CreateDirectory(directoryPath);
						}

						// Save the new image
						File.WriteAllBytes(absolutePath, fileBytes);

						// Add the new saved path
						updatedImagePaths.Add("/Uploads/Products/" + uniqueFileName);
					}
					else if (isExistingImage)
					{
						// It's already saved; retain it
						string cleanedPath = photo.ImagePath.Trim().Trim('"');
						updatedImagePaths.Add(cleanedPath);
					}
					// else: ignore unknown format or mismatched paths (optional logic)
				}

				// Assign updated paths to ProductImages list
				product.ProductImages = updatedImagePaths
					.Select(path => new ProductImage { ImagePath = path })
					.ToList();

				// Save updates
				_productManager.EditProduct(ProductId, product);
			}
			catch (Exception ex)
			{
				System.IO.File.AppendAllText(HttpContext.Current.Server.MapPath("~/Logs/ErrorLog.txt"),
					DateTime.Now + " - EditProduct Error: " + ex.Message + Environment.NewLine);
				throw;
			}
		}

		[HttpPost]
		[Route("deleteProduct/{id}")]
		public void DeleteProduct(int id)
		{
			_productManager.DeleteProduct(id);
		}


		[HttpGet]
		[Route("getProductById/{id}")]
		public Product GetProductById(int id)
		{
			return _productManager.GetProductById(id);
		}

		[HttpGet]
		[Route("getProductSalesReport/{topN}")]
		public ProductReportSalesDetails GetProductSalesReport(int topN)
		{
			return _productManager.GetProductSalesReport(topN);
		}

		[HttpGet]
		[Route("getSalesSummary")]
		public SalesSummary GetSalesSummary()
		{
			return _productManager.GetSalesSummary();
		}

		[HttpGet]
		[Route("getMonthlySalesRevenue")]
		public List<MonthlySalesRevenue> GetMonthlySalesRevenue()
		{
			return _productManager.GetMonthlySalesRevenue();
		}
	}
}
