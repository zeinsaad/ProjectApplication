using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities
{
	public class ProductAttributes
	{
		public int Id { get; set; }

		public int ProductId { get; set; }

		public int CategoryAttributeId { get; set;}

		public String Value { get;set;}

		public String Unit { get; set; }
	}
}