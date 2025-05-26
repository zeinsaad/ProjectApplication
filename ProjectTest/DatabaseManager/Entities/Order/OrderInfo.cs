using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities.Order
{
	public class OrderInfo
	{
		public int Id { get; set; }

		public string UserName { get; set; }
		public int UserId { get; set; }
		public string PhoneNumber { get; set; }
		public string Address { get; set; }
		public string City { get; set; }
		public string PaymentMethod { get; set; }

		public decimal TotalPrice { get; set; }

		public Boolean isPaid { get; set; }

		public DateTime OrderDate { get; set; }

		public int Status { get; set; }

		public int orderType { get; set; }
		public List<OrderProductsInfo> OrderItems { get; set; }
	}
}