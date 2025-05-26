using ProjectTest.DatabaseManager.Business;
using ProjectTest.DatabaseManager.Data;
using ProjectTest.DatabaseManager.Entities;
using ProjectTest.DatabaseManager.Entities.Reports;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace ProjectTest.Controllers
{
	[RoutePrefix("category")]
	
	public class CategoryAPIController : ApiController
    {
		private readonly CategoryManager _categoryManager;

		public CategoryAPIController()
		{
			_categoryManager = new CategoryManager();
		}

		[HttpGet]
		[Route("GetCategories")]
		public List<Category> GetCategories(string name = null)
		{
			return _categoryManager.GetCategories(name);
		}

		/*	[HttpPost]
			[Route("AddCategory")]
			public void AddCategory(Category category)
			{
					_categoryManager.AddCategory(category);	

			}
		*/
		[HttpPost]
		[Route("AddCategory")]
		public void AddCategory(Category category)
		{
			try
			{
				// Ensure that the uploaded file is not empty
				if (string.IsNullOrEmpty(category.FilePath))
				{
					throw new ArgumentException("No file uploaded.");
				}

				// Decode Base64 string to byte array
				byte[] fileBytes = Convert.FromBase64String(category.FilePath);

				// Generate a unique file name using GUID
				string uniqueFileName = Guid.NewGuid().ToString() + ".jpg";

				// Define relative and absolute paths
				string relativePath = "~/Uploads/" + uniqueFileName;
				string absolutePath = HttpContext.Current.Server.MapPath(relativePath);

				// Log the generated path for debugging
				System.IO.File.AppendAllText(HttpContext.Current.Server.MapPath("~/Logs/UploadLog.txt"),
					DateTime.Now + " - Absolute Path: " + absolutePath + Environment.NewLine);

				// Ensure the directory exists, create if not
				string directoryPath = Path.GetDirectoryName(absolutePath);
				if (!Directory.Exists(directoryPath))
				{
					Directory.CreateDirectory(directoryPath);
					System.IO.File.AppendAllText(HttpContext.Current.Server.MapPath("~/Logs/UploadLog.txt"),
						DateTime.Now + " - Created directory: " + directoryPath + Environment.NewLine);
				}

				// Save the file on the server
				File.WriteAllBytes(absolutePath, fileBytes);

				// Log success
				System.IO.File.AppendAllText(HttpContext.Current.Server.MapPath("~/Logs/UploadLog.txt"),
					DateTime.Now + " - File saved successfully: " + absolutePath + Environment.NewLine);

				// Store only the relative path in the database
				category.FilePath = "/Uploads/" + uniqueFileName;

				// Save the category with file path
				_categoryManager.AddCategory(category);
			}
			catch (Exception ex)
			{
				// Log the error for debugging
				System.IO.File.AppendAllText(HttpContext.Current.Server.MapPath("~/Logs/ErrorLog.txt"),
					DateTime.Now + " - Error: " + ex.Message + Environment.NewLine);
				throw;
			}
		}






		[HttpPost]
		[Route("UpdateCategory/{id}")]
		public void UpdateCategory(int id, Category category)
		{
			try
			{
				// Retrieve the existing category from the database
				var existingCategory = _categoryManager.GetCategoryById(id);

				// Check if a new image is provided (i.e., if a new file path is not null or empty)
				if (!string.IsNullOrEmpty(category.FilePath) && category.FilePath != existingCategory.FilePath)
				{
					// Decode Base64 string to byte array
					byte[] fileBytes = Convert.FromBase64String(category.FilePath);

					// Generate a unique file name using GUID
					string uniqueFileName = Guid.NewGuid().ToString() + ".jpg";

					// Define relative and absolute paths
					string relativePath = "~/Uploads/" + uniqueFileName;
					string absolutePath = HttpContext.Current.Server.MapPath(relativePath);

					// Ensure the directory exists, create if not
					string directoryPath = Path.GetDirectoryName(absolutePath);
					if (!Directory.Exists(directoryPath))
					{
						Directory.CreateDirectory(directoryPath);
					}

					// Save the file on the server
					File.WriteAllBytes(absolutePath, fileBytes);

					// Update the FilePath with the new relative path
					category.FilePath = "/Uploads/" + uniqueFileName;
				}
				else
				{
					// If no new image is provided, retain the existing file path
					category.FilePath = existingCategory.FilePath;
				}

				_categoryManager.UpdateCategory(id, category);

				
			}
			catch (Exception ex)
			{
				// Log the error for debugging
				System.IO.File.AppendAllText(HttpContext.Current.Server.MapPath("~/Logs/ErrorLog.txt"),
					DateTime.Now + " - Error: " + ex.Message + Environment.NewLine);
				throw;
			}
		}


		[HttpPost]
		[Route("deleteCategory/{id}")]
		public void DeleteCategory(int id)
		{
			_categoryManager.DeleteCategory(id);
		}

		[HttpGet]
		[Route("getCategoryById/{id}")]
		public Category GetCategoryById(int id)
		{
			return _categoryManager.GetCategoryById(id);
		}

		[HttpGet]
		[Route("getCategoriesInfo")]
		public List<Category> GetCategoriesInfo()
		{
			return _categoryManager.GetCategoriesInfo();
		}

		[HttpGet]
		[Route("getCategoriesAttributes/{categoryId}")]
		public List<CategoryAttributes> GetCategoryAttributes(int categoryId)
		{
			return _categoryManager.GetCategoriesAttributes(categoryId);
		}

		[HttpGet]
		[Route("getCategoryAttributesById/{Id}")]
		public CategoryAttributes GetCategoryAttributesById(int Id)
		{
			return _categoryManager.GetCategoriesAttributesById(Id);
		}

		[HttpGet]
		[Route("getSalesByCategories")]
		public List<TotalSalesByCategory> getSalesByCategories()
		{
			return _categoryManager.getSalesByCategories();
		}
	}
}
