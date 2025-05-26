using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities
{
	public class ProductImage
	{
		public int Id { get; set; }
		public int ProductId { get; set; }
		public string ImagePath { get; set; }
		public bool IsMain { get; set; }

	}
}