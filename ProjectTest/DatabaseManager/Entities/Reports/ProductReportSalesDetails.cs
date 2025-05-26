using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities.Reports
{
	public class ProductReportSalesDetails
	{
		public List<ProductSalesDetails> TopSelling { get; set; }
		public List<ProductSalesDetails> LowestSelling { get; set; }
		public List<ProductSalesDetails> Unsold { get; set; }
	}
}