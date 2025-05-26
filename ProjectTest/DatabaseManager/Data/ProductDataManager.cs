using Newtonsoft.Json;
using ProjectTest.DatabaseManager.Entities;
using ProjectTest.DatabaseManager.Entities.Reports;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web.Http;

namespace ProjectTest.DatabaseManager.Data
{
	public class ProductDataManager
	{
		private readonly BaseDataManager _baseDataManager;

		public ProductDataManager()
		{
			_baseDataManager = new BaseDataManager();
		}

		public void AddProduct(Product product)
		{
			string procedureName = "AddProductWithImages";

			// Create DataTable matching ProductImageTableType
			DataTable imageTable = new DataTable();
			imageTable.Columns.Add("ImagePath", typeof(string));

			foreach (var image in product.ProductImages)
			{
				imageTable.Rows.Add(image.ImagePath);
			}
			DataTable attributeTable = new DataTable();
			attributeTable.Columns.Add("ProductId", typeof(int));  // Add ProductId column
			attributeTable.Columns.Add("AttributeId", typeof(int));
			attributeTable.Columns.Add("Value", typeof(string));

			// Insert ProductId for each attribute
			foreach (var attribute in product.ProductAttributes)
			{
				attributeTable.Rows.Add(attribute.ProductId, attribute.CategoryAttributeId, attribute.Value); // Pass ProductId here
			}

			// Check if discount information exists
			SqlParameter discountTypeParam = new SqlParameter("@DiscountType", SqlDbType.Int);
			SqlParameter discountValueParam = new SqlParameter("@DiscountValue", SqlDbType.Int);
			SqlParameter startDateParam = new SqlParameter("@StartDate", SqlDbType.DateTime);
			SqlParameter endDateParam = new SqlParameter("@EndDate", SqlDbType.DateTime);

			if (product.Discount.DiscountType != 0)
			{
				discountTypeParam.Value = product.Discount.DiscountType;
				discountValueParam.Value = product.Discount.DiscountValue;
				startDateParam.Value = product.Discount.StartDate;
				endDateParam.Value = product.Discount.EndDate;
			}
			else
			{
				// If no discount, set to DBNull
				discountTypeParam.Value = DBNull.Value;
				discountValueParam.Value = DBNull.Value;
				startDateParam.Value = DBNull.Value;
				endDateParam.Value = DBNull.Value;
			}

			var parameters = new[]
			{
		new SqlParameter("@Name", product.Name),
		new SqlParameter("@Description", product.Description),
		new SqlParameter("@Quantity", product.Quantity),
		new SqlParameter("@Price", product.Price),
		new SqlParameter("@CategoryId", product.CategoryId),
		new SqlParameter("@IsActive", product.IsActive),
		new SqlParameter("@ProductImages", SqlDbType.Structured)
		{
			TypeName = "ProductImageTableType",
			Value = imageTable
		},
		new SqlParameter("@ProductAttributes", SqlDbType.Structured)
		{
			TypeName = "ProductAttributeTableType",
			Value = attributeTable
		},
		discountTypeParam,
		discountValueParam,
		startDateParam,
		endDateParam
	};

			// Execute the stored procedure to insert the product and images
			_baseDataManager.ExecuteNonQuery(procedureName, parameters);
		}




		public void EditProduct(int id, Product product)
		{
			string procedureName = "EditProduct";

			// Prepare image and attribute data
			DataTable imageTable = new DataTable();
			imageTable.Columns.Add("ImagePath", typeof(string));
			foreach (var image in product.ProductImages) imageTable.Rows.Add(image.ImagePath);

			DataTable attributeTable = new DataTable();
			attributeTable.Columns.Add("ProductId", typeof(int));
			attributeTable.Columns.Add("AttributeId", typeof(int));
			attributeTable.Columns.Add("Value", typeof(string));
			foreach (var attribute in product.ProductAttributes)
				attributeTable.Rows.Add(attribute.ProductId, attribute.CategoryAttributeId, attribute.Value);

			// Handle discount data with validation
			SqlParameter discountTypeParam = new SqlParameter("@DiscountType", SqlDbType.Int) { Value = DBNull.Value };
			SqlParameter discountValueParam = new SqlParameter("@DiscountValue", SqlDbType.Decimal) { Value = DBNull.Value };
			SqlParameter startDateParam = new SqlParameter("@StartDate", SqlDbType.DateTime) { Value = DBNull.Value };
			SqlParameter endDateParam = new SqlParameter("@EndDate", SqlDbType.DateTime) { Value = DBNull.Value };

			if (product.Discount.DiscountType != 0)
			{
				startDateParam.Value = product.Discount.StartDate ;
				endDateParam.Value = product.Discount.EndDate;
				discountTypeParam.Value = product.Discount.DiscountType;
				discountValueParam.Value = product.Discount.DiscountValue;
			}

			// Execute stored procedure
			var parameters = new[] {
		new SqlParameter("@ProductId", id),
		new SqlParameter("@Name", product.Name),
		new SqlParameter("@Description", product.Description),
		new SqlParameter("@Quantity", product.Quantity),
		new SqlParameter("@Price", product.Price),
		new SqlParameter("@CategoryId", product.CategoryId),
		new SqlParameter("@IsActive", product.IsActive),
		new SqlParameter("@ProductImages", SqlDbType.Structured) { TypeName = "ProductImageTableType", Value = imageTable },
		new SqlParameter("@ProductAttributes", SqlDbType.Structured) { TypeName = "ProductAttributeTableType", Value = attributeTable },
		discountTypeParam,
		discountValueParam,
		startDateParam,
		endDateParam
	};

			_baseDataManager.ExecuteNonQuery(procedureName, parameters);
		}


		public List<Product> GetProducts(string name, int? categoryId, decimal? minPrice, decimal? maxPrice, bool? isActive, int? stockStatus, bool? discountStatus)
		{
			// Prepare parameters to pass to the stored procedure, using NULL for optional parameters
			var parameters = new object[]
			{
		name ?? (object)DBNull.Value,           // If name is null, pass DBNull.Value
        categoryId ?? (object)DBNull.Value,     // If categoryId is null, pass DBNull.Value
        minPrice ?? (object)DBNull.Value,       // If minPrice is null, pass DBNull.Value
        maxPrice ?? (object)DBNull.Value,       // If maxPrice is null, pass DBNull.Value
        isActive ?? (object)DBNull.Value,       // If isActive is null, pass DBNull.Value
        stockStatus ?? (object)DBNull.Value,    // If stockStatus is null, pass DBNull.Value
        discountStatus ?? (object)DBNull.Value  // If discountStatus is null, pass DBNull.Value
			};

			// Mapping function to map data from the reader to a Product object
			Func<IDataReader, Product> mapProduct = reader =>
			{
				Discount productDiscount = null;

				// Check if there is discount data in the reader and map it
				if (!reader.IsDBNull(7))  // Index 7 for discount type
				{
					productDiscount = new Discount
					{
						DiscountType = reader.GetInt32(7),
						DiscountValue = reader.GetDecimal(8), // Discount value
						StartDate = (DateTime)(reader.IsDBNull(9) ? (DateTime?)null : reader.GetDateTime(9)), // Start Date
						EndDate = (DateTime)(reader.IsDBNull(10) ? (DateTime?)null : reader.GetDateTime(10))   // End Date
					};
				}

				// Map the product data from the reader
				var product = new Product
				{
					ProductId = reader.GetInt32(0),  // ProductId
					Name = reader.GetString(1),      // Name
					Description = reader.GetString(2),  // Description
					Quantity = reader.GetInt32(3),   // Quantity
					Price = reader.GetDecimal(4),    // Price
					CategoryId = reader.GetInt32(5),  // CategoryId
					IsActive = reader.GetBoolean(6),  // IsActive
					ProductImages = new List<ProductImage>(),  // List for images
					ProductReviews = JsonConvert.DeserializeObject<List<ProductReview>>(reader["ReviewsJson"].ToString()),  // Product Reviews
					Discount = productDiscount  // Associated Discount if any
				};

				// Deserialize ProductAttributes from JSON
				string serializedProductAttributes = reader.GetString(13);  // Assuming ProductAttributes is at index 13
				if (!string.IsNullOrEmpty(serializedProductAttributes))
				{
					product.ProductAttributes = JsonConvert.DeserializeObject<List<ProductAttributes>>(
						serializedProductAttributes,
						GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings);
				}

				// Process images and add them to the product
				int imageIndex = 11;  // Assuming image paths are at index 11
				if (!reader.IsDBNull(imageIndex))
				{
					var imagePaths = reader.GetString(imageIndex).Split(',').ToList();

					foreach (var path in imagePaths)
					{
						product.ProductImages.Add(new ProductImage
						{
							ImagePath = path,
							IsMain = product.ProductImages.Count == 0 // First image is marked as main
						});
					}
				}

				return product;
			};

			// Call the base data manager method to execute the stored procedure and map results
			var result = _baseDataManager.GetSPItems("GetProducts", mapProduct, parameters.ToArray());

			return result;
		}




		public Product GetProductById(int id)
		{
			var parameters = new object[]
			{
			 id
			 };

			Func<IDataReader, Product> mapProduct = reader =>
			{
				Discount productDiscount = null;

				if (!reader.IsDBNull(7))
				{
					productDiscount = new Discount
					{
						DiscountType = reader.GetInt32(7),
						DiscountValue = reader.GetDecimal(8), // ✅ Now matches DB type
						StartDate = (DateTime)(reader.IsDBNull(9) ? (DateTime?)null : reader.GetDateTime(9)),
						EndDate = (DateTime)(reader.IsDBNull(10) ? (DateTime?)null : reader.GetDateTime(10))
					};
				}
				var product =  new Product
				{
					ProductId = reader.GetInt32(0),
					Name = reader.GetString(1),
					Description = reader.GetString(2),
					Quantity = reader.GetInt32(3),
					Price = reader.GetDecimal(4),
					CategoryId = reader.GetInt32(5),
					IsActive = reader.GetBoolean(6),
					ProductImages = new List<ProductImage>(),
					ProductReviews = JsonConvert.DeserializeObject<List<ProductReview>>(reader["ReviewsJson"].ToString()),
					Discount = productDiscount
				};
				string serializedProductAttributes = reader.GetString(13);
				if (!string.IsNullOrEmpty(serializedProductAttributes))
				{
					product.ProductAttributes = JsonConvert.DeserializeObject<List<ProductAttributes>>(
						serializedProductAttributes,
						GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings);
				}

				int imageIndex = 11; // Assuming Image data starts at index 7
				if (!reader.IsDBNull(imageIndex))
				{
					var imagePaths = reader.GetString(imageIndex).Split(',').ToList();

					foreach (var path in imagePaths)
					{
						product.ProductImages.Add(new ProductImage
						{
							ImagePath = path,
							IsMain = product.ProductImages.Count == 0 // Mark first image as main
						});
					}
				}

				return product;
			};

			var products = _baseDataManager.GetSPItems("GetProductById", mapProduct, parameters.ToArray());



			return products.FirstOrDefault();

		}

		public ProductSalesReport GetProductSalesReport(int topN)
		{
			var report = new ProductSalesReport
			{
				TopSelling = new List<ProductSalesInfo>(),
				LowestSelling = new List<ProductSalesInfo>(),
				Unsold = new List<ProductSalesInfo>()
			};

			var parameters = new object[] { topN };

			Func<IDataReader, ProductSalesInfo> mapProductSales = reader => new ProductSalesInfo
			{
				ProductId = reader.GetInt32(0),
				ProductName = reader.GetString(1),
				TotalQuantitySold = reader.FieldCount > 2 && !reader.IsDBNull(2) ? reader.GetInt32(2) : 0,
				TotalRevenue = reader.FieldCount > 3 && !reader.IsDBNull(3) ? reader.GetDecimal(3):0
			};

			// Top Selling Products
			report.TopSelling = _baseDataManager.GetSPItems("GetTopSellingProducts", mapProductSales, parameters);

			// Lowest Selling Products
			report.LowestSelling = _baseDataManager.GetSPItems("GetLowestSellingProducts", mapProductSales, parameters);

			// Unsold Products
			report.Unsold = _baseDataManager.GetSPItems("GetUnsoldProducts", mapProductSales);

			return report;
		}


		public SalesSummary GetSalesSummary()
		{
			var parameters = new object[] { };

			Func<IDataReader, SalesSummary> mapSales = reader => new SalesSummary
			{
				TotalSales = reader.GetDecimal(0),
				TotalOrders = reader.GetInt32(1),
				ProductsSold = reader.GetInt32(2)
			};

			var result = _baseDataManager.GetSPItems("GetSalesSummary", mapSales, parameters);

			return result.FirstOrDefault(); // or result.SingleOrDefault() if only one row is expected
		}

		public List<MonthlySalesRevenue> GetMonthlySalesRevenue()
		{
			var parameters = new object[] { };

			Func<IDataReader, MonthlySalesRevenue> mapSales = reader => new MonthlySalesRevenue
			{
				Month = reader.GetString(0),
				TotalRevenue = reader.GetDecimal(1)
			};

			var result = _baseDataManager.GetSPItems("GetMonthlySalesRevenue", mapSales, parameters);

			return result;
		}

		public void DeleteProduct(int productId)
		{
			// Define the stored procedure name
			string procedureName = "DeleteProduct";

			// Create the parameter for ProductId
			var parameters = new[]
			{
		new SqlParameter("@ProductId", SqlDbType.Int) { Value = productId }
	};

			// Execute the stored procedure to delete the product
			_baseDataManager.ExecuteNonQuery(procedureName, parameters);
		}


	}
}