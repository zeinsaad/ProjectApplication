using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities.Order
{
	public class OrderProductsInfo
	{
		public int Id { get; set; }
		public int ProductId { get; set; }

		public string ProductName { get; set; }

		public List<ProductImage> ProductImages { get; set; }
		public int OrderId { get; set; }
		public decimal Price { get; set; }
		public int Quantity { get; set; }
	}
}