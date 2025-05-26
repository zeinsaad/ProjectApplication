using ProjectTest.DatabaseManager.Data;
using ProjectTest.DatabaseManager.Entities;
using ProjectTest.DatabaseManager.Entities.Reports;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Business
{
	public class ProductManager
	{
		private readonly ProductDataManager _productDataManager;
		private readonly CategoryManager _categoryManager;
		

		public ProductManager()
		{
			_productDataManager = new ProductDataManager();
			_categoryManager = new CategoryManager();
			
		}

		public void AddProduct(Product product)
		{
			_productDataManager.AddProduct(product);
		}

		public void EditProduct(int id, Product product)
		{
			_productDataManager.EditProduct(id , product);
		}

		public void DeleteProduct(int productId)
		{
			_productDataManager.DeleteProduct(productId);
		}

		public List<ProductDetails> GetProducts(string name, int? categoryId, decimal? minPrice, decimal? maxPrice, bool? isActive, int? stockStatus, bool? discountStatus)
		{
			var results =  _productDataManager.GetProducts(name,categoryId,minPrice,maxPrice,isActive,stockStatus,discountStatus);
			var mappedProducts = results.Select(p => new ProductDetails
			{
				ProductId = p.ProductId,
				Name = p.Name,
				Description = p.Description,
				Price = p.Price,
				Quantity = p.Quantity,
				IsActive = p.IsActive,
				ProductImages = p.ProductImages,
				ProductReviews = p.ProductReviews,
				ProductAttributes = p.ProductAttributes.Select(attr => new ProductAttributesDetails
				{
					Id = attr.Id,
					ProductId = attr.ProductId,
					Unit = attr.Unit,
					Value = attr.Value,
					CategoryAttribute = _categoryManager.GetCategoriesAttributesById(attr.CategoryAttributeId).Name
				}).ToList(),

				CategoryName = _categoryManager.GetCategoryById(p.CategoryId).Name,
				Discount = p.Discount
			}).ToList();

			return mappedProducts;
		}

		public Product GetProductById(int id)
		{
			return _productDataManager.GetProductById(id);
		}

		public ProductReportSalesDetails GetProductSalesReport(int topN)
		{
			// Fetch the product sales data from your data manager
			var results = _productDataManager.GetProductSalesReport(topN);

			// Map to ProductSalesDetails (TopSelling, LowestSelling, Unsold)
			var mappedProducts = results.TopSelling.Select(p => new ProductSalesDetails
			{
				ProductId = p.ProductId,
				TotalQuantitySold = p.TotalQuantitySold,
				ProductName = GetProductById(p.ProductId).Name,
				TotalRevenue = p.TotalRevenue,
				CategoryName = _categoryManager.GetCategoryById(GetProductById(p.ProductId).CategoryId).Name,
				ImagePath = GetProductById(p.ProductId).ProductImages
			}).ToList();

			// Now categorize the products into TopSelling, LowestSelling, and Unsold
			var topSelling = mappedProducts.OrderByDescending(p => p.TotalQuantitySold).Take(topN).ToList();
			var lowestSelling = mappedProducts.OrderBy(p => p.TotalQuantitySold).Take(topN).ToList();
			var unsold = mappedProducts.Where(p => p.TotalQuantitySold == 0).ToList();

			// Return the result wrapped in a ProductSalesReport
			return new ProductReportSalesDetails
			{
				TopSelling = topSelling,
				LowestSelling = lowestSelling,
				Unsold = unsold
			};
		}



		public SalesSummary GetSalesSummary()
		{
			return _productDataManager.GetSalesSummary();
		}

		public List<MonthlySalesRevenue> GetMonthlySalesRevenue()
		{
			return _productDataManager.GetMonthlySalesRevenue();
		}
	}

}