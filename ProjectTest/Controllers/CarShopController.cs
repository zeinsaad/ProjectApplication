using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ProjectTest.Controllers
{
    public class CarShopController : Controller
    {
        // GET: CarShop
        public ActionResult ShopPage(int? id)
        {
			
				if (id.HasValue)
				{
					ViewBag.CategoryId = id.Value;
				}
				else
				{
					ViewBag.CategoryId = null;
				}

				
			return View();
        }
		public ActionResult Index()
		{
			ViewBag.Title = "Home Page";

			return View();
		}

		public ActionResult MyOrders()
		{
			ViewBag.Title = "Home Page";

			return View();
		}

		public ActionResult ChatBot()
		{
			return View();
		}
	}
}