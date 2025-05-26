using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities.Reports
{
	public class SalesSummary
	{
        public decimal TotalSales { get; set; }

        public int TotalOrders { get; set; }

        public int ProductsSold { get; set; }
    }
}