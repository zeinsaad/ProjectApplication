using ProjectTest.DatabaseManager.Entities;
using ProjectTest.DatabaseManager.Entities.Order;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Data
{
	public class ReviewDataManager
	{
		private readonly BaseDataManager _baseDataManager;

		public ReviewDataManager()
		{
			_baseDataManager = new BaseDataManager();
		}

		public void SubmitReview(ProductReview productReview)
		{
			string procedureName = "AddOrUpdateReview";
			var parameters = new List<SqlParameter>
	{
		new SqlParameter("@UserId", productReview.UserId),
		new SqlParameter("@ProductId", productReview.ProductId),
		new SqlParameter("@Rating", productReview.Rating),
		new SqlParameter("@Comment", productReview.Comment)
	};
			_baseDataManager.ExecuteNonQuery(procedureName, parameters.ToArray());
		}

		public ProductReview GetReview(int UserId , int ProductId)
		{
			// Hash the password for comparison
			var parameters = new object[] { UserId, ProductId };

			Func<IDataReader, ProductReview> mapUser = reader =>
			{
				if (!reader.IsDBNull(0))
				{
					return new ProductReview
					{
						ReviewId = reader.GetInt32(0),
						UserId = reader.GetInt32(1),
						ProductId = reader.GetInt32(2),
						Rating = reader.GetInt32(3),
						Comment = reader.GetString(4),
						CreatedAt = reader.GetDateTime(5)
					};
				}
				return null;
			};

			var result = _baseDataManager.GetSPItems("GetReview", mapUser, parameters);

			return result.FirstOrDefault();
		}

		public List<ProductReview> GetProductReviews(int ProductId)
		{
			// Hash the password for comparison
			var parameters = new object[] {ProductId };

			Func<IDataReader, ProductReview> mapUser = reader =>
			{
				if (!reader.IsDBNull(0))
				{
					return new ProductReview
					{
						ReviewId = reader.GetInt32(0),
						UserId = reader.GetInt32(1),
						ProductId = reader.GetInt32(2),
						Rating = reader.GetInt32(3),
						Comment = reader.GetString(4),
						CreatedAt = reader.GetDateTime(5)
					};
				}
				return null;
			};

			var result = _baseDataManager.GetSPItems("GetProductReviews", mapUser, parameters);

			return result.ToList();
		}
		


	}
}