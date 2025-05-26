using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ProjectTest.Controllers
{

	[AdminAuthorizationFilter]
	public class AdminDashboardController : Controller
	{
		

		public ActionResult Category()
		{
			return View();
		}

		public ActionResult Product()
		{
			return View();
		}

		public ActionResult Order()
		{
			return View();
		}

		public ActionResult Reports()
		{
			return View();
		}

		public ActionResult Users()
		{
			return View();
		}

	}
}
