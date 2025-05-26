using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities
{
	public class ProductSalesInfo
	{
		public int ProductId { get; set; }
		public string ProductName { get; set; }
		public int TotalQuantitySold { get; set; }

		public decimal TotalRevenue { get; set; }
	}
}