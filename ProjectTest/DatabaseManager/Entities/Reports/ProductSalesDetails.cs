using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities.Reports
{
	public class ProductSalesDetails
	{
		public int ProductId { get; set; }

		public String CategoryName { get; set; }

		public List<ProductImage> ImagePath {get;set;}
        public string ProductName { get; set; }
		public int TotalQuantitySold { get; set; }

		public decimal TotalRevenue { get; set; }
	}
}