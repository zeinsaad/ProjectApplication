using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities
{
	public class ProductSalesReport
	{
		public List<ProductSalesInfo> TopSelling { get; set; }
		public List<ProductSalesInfo> LowestSelling { get; set; }
		public List<ProductSalesInfo> Unsold { get; set; }
	}
}