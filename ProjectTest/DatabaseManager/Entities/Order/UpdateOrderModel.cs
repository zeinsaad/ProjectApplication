using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities.Order
{
	public class UpdateOrderModel
	{
	
			public int orderId { get; set; }
			public int? status { get; set; }
			public bool? isPaid { get; set; }
		
	}
}