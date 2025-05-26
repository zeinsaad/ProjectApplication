using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities
{
	public class CategoryAttributes
	{
		public int Id { get; set; }

	    public int CategoryId { get; set; }
		public string Name { get; set; }
		public int DataType { get; set; }
		public string Unit { get; set; }

	}
}