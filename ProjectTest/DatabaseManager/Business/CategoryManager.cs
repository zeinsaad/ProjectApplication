using ProjectTest.DatabaseManager.Data;
using ProjectTest.DatabaseManager.Entities;
using ProjectTest.DatabaseManager.Entities.Reports;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Business
{
	public class CategoryManager
	{
		private readonly CategoryDataManager _categoryDataManager;
		public CategoryManager()
		{
			_categoryDataManager = new CategoryDataManager();
		}

		public void AddCategory(Category category)
		{
			_categoryDataManager.AddCategory(category);
		}

		public void UpdateCategory(int id, Category category)
		{
			_categoryDataManager.UpdateCategory(category);
		}

		public void DeleteCategory(int id)
		{
			_categoryDataManager.DeleteCategory(id);
		}

		public List<Category> GetCategories(string name)
		{
			return _categoryDataManager.GetCategories(name);
		}

		public Category GetCategoryById(int id)
		{
			return _categoryDataManager.GetCategoryById(id);
		}

		public List<Category> GetCategoriesInfo()
		{
			return _categoryDataManager.GetCategoriesInfo();
		}

		public List<CategoryAttributes> GetCategoriesAttributes(int categoryId)
		{
			return _categoryDataManager.getCategoryAttributes(categoryId);
		}

		public CategoryAttributes GetCategoriesAttributesById (int Id)
		{
			return _categoryDataManager.getCategoryAttributesById(Id);
		}

		public List<TotalSalesByCategory> getSalesByCategories()
		{
			return _categoryDataManager.getSalesByCategories();
		}
	}
}