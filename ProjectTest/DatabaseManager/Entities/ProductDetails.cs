using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities
{
	public class ProductDetails
	{
		public int ProductId { get; set; }
		public string Name { get; set; }
		public string Description { get; set; }
		public int Quantity { get; set; }
		public decimal Price { get; set; }
		public String CategoryName { get; set; }
		public bool IsActive { get; set; }
		public List<ProductImage> ProductImages { get; set; }

		public List<ProductAttributesDetails> ProductAttributes { get; set; }
		public List<ProductReview> ProductReviews { get; set; }

		public Discount Discount { get; set; }
	}
}