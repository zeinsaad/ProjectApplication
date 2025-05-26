using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities.Reports
{
	public class TotalSalesByCategory
	{
        public int CategoryId { get; set; }

		public String Name { get; set; }

		public decimal TotalSales { get; set; }

		public int TotalQuantity { get; set; }
	}
}