using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Entities
{
	public class User
	{
		public int Id { get; set; }
		public string FullName { get; set; }
		public string PhoneNumber { get; set; }
		public string Password { get; set; }
		public int Role { get; set; }

		public bool isDeactivated { get; set; }
	}
}