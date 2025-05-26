using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities
{
	public class ProductReview
	{
		public int ReviewId { get; set; }        // The ID of the review
		public int UserId { get; set; }          // The ID of the user who wrote the review
		public int ProductId { get; set; }       // The ID of the reviewed product
		public int Rating { get; set; }          // Rating (1–5 stars)
		public string Comment { get; set; }      // The review comment
		public DateTime CreatedAt { get; set; }  // When the review was posted
	}

}