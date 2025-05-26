using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities
{
	public class Discount
	{
		public int Id { get; set; }
		
		public int ProductId { get; set; }
		public int DiscountType { get; set; }

		public decimal DiscountValue { get; set; }

		public DateTime StartDate { get; set; }

		public DateTime EndDate { get; set; }
	}
}