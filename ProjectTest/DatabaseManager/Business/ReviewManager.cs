using ProjectTest.DatabaseManager.Data;
using ProjectTest.DatabaseManager.Entities;
using ProjectTest.DatabaseManager.Entities.Reviews;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Business
{
	public class ReviewManager
	{
		private readonly ReviewDataManager _reviewDataManager;
		private readonly UserManager _userManager;
		public ReviewManager() 
		{
		   _reviewDataManager = new ReviewDataManager();
			_userManager = new UserManager();
		}
		public void AddReview(ProductReview productReview)
		{
			_reviewDataManager.SubmitReview(productReview);
		}

		public ProductReview GetReview(int UserId , int ProductId) 
		{
			return _reviewDataManager.GetReview(UserId, ProductId);
		}

		public List<ProductReviewsDetails> GetProductReviews (int productId)
		{
			var results =  _reviewDataManager.GetProductReviews(productId);
			var mappedReviews = results.Select(p => new ProductReviewsDetails
			{
				ProductId = p.ProductId,
				Name = _userManager.GetUserById(p.UserId).FullName,
				Comment = p.Comment,
				Rating = p.Rating,
				CreatedAt = p.CreatedAt,
				ReviewId = p.ReviewId
			}).ToList();
			return mappedReviews;
		}

	}
}