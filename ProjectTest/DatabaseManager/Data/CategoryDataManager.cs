using Newtonsoft.Json;
using ProjectTest.DatabaseManager.Entities;
using ProjectTest.DatabaseManager.Entities.Reports;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Xml.Linq;

namespace ProjectTest.DatabaseManager.Data
{
	public class CategoryDataManager
	{
		private readonly BaseDataManager _baseDataManager;
		public CategoryDataManager()
		{
			_baseDataManager = new BaseDataManager();
		}
		public List<Category> GetCategories(string name)
		{
			var parameters = new object[] { name };

			Func<IDataReader, Category> mapCategory = reader =>
			{
				var category = new Category
				{
					Id = reader.GetInt32(0),
					Name = reader.IsDBNull(1) ? null : reader.GetString(1), // Handle null Name
					Description = reader.IsDBNull(2) ? null : reader.GetString(2), // Handle null Description
					CreatedAt = reader.GetDateTime(3),
					FilePath = reader.IsDBNull(4) ? null : reader.GetString(4) // Handle null FilePath
				};

				// Handle CategoryAttributes serialization if serializedAttributes is not null
				string serializedAttributes = reader.IsDBNull(5) ? null : reader.GetString(5);
				if (!string.IsNullOrEmpty(serializedAttributes))
				{
					category.CategoryAttributes = JsonConvert.DeserializeObject<List<CategoryAttributes>>(
						serializedAttributes,
						GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings);
				}

				return category;
			};

			var result = _baseDataManager.GetSPItems("GetCategories", mapCategory, parameters.ToArray());

			return result;
		}


		public void AddCategory(Category category)
		{
			string procedureName = "AddCategory";

			// Create DataTable for attributes
			var attributeTable = new DataTable();
			attributeTable.Columns.Add("Id", typeof(int));
			attributeTable.Columns.Add("Name", typeof(string));
			attributeTable.Columns.Add("DataType", typeof(string));
			attributeTable.Columns.Add("Unit", typeof(string));
			attributeTable.Columns.Add("CategoryId", typeof(int)); // This column will be ignored by SQL

			foreach (var attr in category.CategoryAttributes)
			{
				attributeTable.Rows.Add(
					DBNull.Value,
		attr.Name,
		attr.DataType,
		string.IsNullOrEmpty(attr.Unit) ? DBNull.Value : (object)attr.Unit,
		0
	);
			}

			// Define parameters
			var parameters = new List<SqlParameter>
	{
		new SqlParameter("@Name", category.Name),
		new SqlParameter("@Description", category.Description),
		new SqlParameter("@CreatedAt", category.CreatedAt),
		new SqlParameter("@FilePath", (object)category.FilePath ?? DBNull.Value),
		new SqlParameter
		{
			ParameterName = "@CategoryAttributes",
			SqlDbType = SqlDbType.Structured,
			TypeName = "CategoryAttributeTableType",
			Value = attributeTable
		}
	};

			_baseDataManager.ExecuteNonQuery(procedureName, parameters.ToArray());
		}


		public void UpdateCategory(Category category)
		{
			string procedureName = "UpdateCategory";

			var attributeTable = new DataTable();
			attributeTable.Columns.Add("Id", typeof(int));
			attributeTable.Columns.Add("Name", typeof(string));
			attributeTable.Columns.Add("DataType", typeof(string));
			attributeTable.Columns.Add("Unit", typeof(string));
			attributeTable.Columns.Add("CategoryId", typeof(int)); // This column will be ignored by SQL

			foreach (var attr in category.CategoryAttributes)
			{
				attributeTable.Rows.Add(
					attr.Id,
		attr.Name,
		attr.DataType,
		string.IsNullOrEmpty(attr.Unit) ? DBNull.Value : (object)attr.Unit,
		0
	);
			}

			var parameters = new[]
			{
				new SqlParameter("@Name",category.Name),
				new SqlParameter("@Description",category.Description),
				new SqlParameter("@FilePath", (object)category.FilePath ?? DBNull.Value),
				new SqlParameter
		{
			ParameterName = "@CategoryAttributes",
			SqlDbType = SqlDbType.Structured,
			TypeName = "CategoryAttributeTableType",
			Value = attributeTable
		},
				new SqlParameter("Id",category.Id)
			};

			_baseDataManager.ExecuteNonQuery(procedureName, parameters);
		}

		public Category GetCategoryById(int id)
		{
			var parameters = new object[]
			{
			 id
			 };

			Func<IDataReader, Category> mapCategory = reader =>
			{
				var category = new Category
				{
					Id = reader.GetInt32(0),
					Name = reader.GetString(1),
					Description = reader.GetString(2),
					CreatedAt = reader.GetDateTime(3),
					FilePath = reader.IsDBNull(4) ? null : reader.GetString(4)
				};
				string serializedAttributes = reader.IsDBNull(5) ? null : reader.GetString(5);
				if (!string.IsNullOrEmpty(serializedAttributes))
				{
					category.CategoryAttributes = JsonConvert.DeserializeObject<List<CategoryAttributes>>(
						serializedAttributes,
						GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings);
				}
				return category;
			};

			var categories = _baseDataManager.GetSPItems("GetCategoryById", mapCategory, parameters.ToArray());



			return categories.FirstOrDefault();

		}

		public List<Category> GetCategoriesInfo()
		{
			var parameters = new object[]
	{
	};


			Func<IDataReader, Category> mapCategory = reader =>
			{
				var category = new Category
				{

					Id = reader.GetInt32(0),
					Name = reader.GetString(1),

				};
				return category;
			};

			var result = _baseDataManager.GetSPItems("GetCategoryInfo", mapCategory, parameters.ToArray());

			return result;


		}

		public List<CategoryAttributes> getCategoryAttributes(int CategoryId)
		{
			var parameters = new object[] { CategoryId };

			Func<IDataReader, CategoryAttributes> mapCategoryAttributes = reader =>
			{
				var categoryAttribute = new CategoryAttributes
				{
					Id = reader.IsDBNull(0) ? 0 : reader.GetInt32(0),  // Id (Attribute ID)
					CategoryId = reader.IsDBNull(1) ? 0 : reader.GetInt32(1),  // Category ID
					Name = reader.IsDBNull(2) ? string.Empty : reader.GetString(2), // Attribute Name
					DataType = reader.IsDBNull(3) ? 0 : reader.GetInt32(3),  // DataType (numeric type)
					Unit = reader.IsDBNull(4) ? null : reader.GetString(4)   // Unit (e.g., "mAh", "V", "g")
				};
				return categoryAttribute;
			};

			var attributes = _baseDataManager.GetSPItems("GetCategoryAttributesByCategoryId", mapCategoryAttributes, parameters.ToArray());
			return attributes;
		}

		public CategoryAttributes getCategoryAttributesById(int Id)
		{
			var parameters = new object[] { Id };

			Func<IDataReader, CategoryAttributes> mapCategoryAttributes = reader =>
			{
				var categoryAttribute = new CategoryAttributes
				{
					Id = reader.IsDBNull(0) ? 0 : reader.GetInt32(0),  // Id (Attribute ID)
					CategoryId = reader.IsDBNull(1) ? 0 : reader.GetInt32(1),  // Category ID
					Name = reader.IsDBNull(2) ? string.Empty : reader.GetString(2), // Attribute Name
					DataType = reader.IsDBNull(3) ? 0 : reader.GetInt32(3),  // DataType (numeric type)
					Unit = reader.IsDBNull(4) ? null : reader.GetString(4)   // Unit (e.g., "mAh", "V", "g")
				};
				return categoryAttribute;
			};

			var attributes = _baseDataManager.GetSPItems("getCategoryAttributeById", mapCategoryAttributes, parameters.ToArray());
			return attributes.FirstOrDefault();
		}

		public void DeleteCategory(int CategoryId)
		{
			string procedureName = "DeleteCategory";
			var parameters = new[]
			{
				new SqlParameter("@CategoryId", CategoryId)
			};
			_baseDataManager.ExecuteNonQuery(procedureName, parameters);

		}

		public List<TotalSalesByCategory> getSalesByCategories()
		{
			var parameters = new object[] { };

			Func<IDataReader, TotalSalesByCategory> mapCategory = reader =>
			{
				var report = new TotalSalesByCategory
				{
					CategoryId = reader.IsDBNull(0) ? 0 : reader.GetInt32(0),
					Name = reader.IsDBNull(1) ? string.Empty : reader.GetString(1),
					TotalSales = reader.IsDBNull(2) ? 0 : reader.GetDecimal(2),
					TotalQuantity = reader.IsDBNull(3) ? 0 : reader.GetInt32(3)
				};
				return report;
			};

			var result = _baseDataManager.GetSPItems("GetTotalSalesByCategory", mapCategory, parameters.ToArray());
			return result;
		}
	}
}