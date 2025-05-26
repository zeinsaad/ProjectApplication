using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities
{
	public class Category
	{
		public int Id { get; set; }
		public string Name { get; set; }

		public string Description { get; set; }

		public string FilePath { get; set; }

		public List<CategoryAttributes> CategoryAttributes { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.Now;
	}
}