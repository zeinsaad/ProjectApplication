using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;

namespace ProjectTest
{
	public class WebApiApplication : System.Web.HttpApplication
	{
		protected void Application_Start()
		{
			AreaRegistration.RegisterAllAreas();
			GlobalConfiguration.Configure(WebApiConfig.Register);
			FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
			RouteConfig.RegisterRoutes(RouteTable.Routes);
			BundleConfig.RegisterBundles(BundleTable.Bundles);
		}

		protected void Application_PostAuthenticateRequest(Object sender, EventArgs e)
		{
			HttpCookie authCookie = HttpContext.Current.Request.Cookies[FormsAuthentication.FormsCookieName];

			if (authCookie != null && !string.IsNullOrEmpty(authCookie.Value))
			{
				try
				{
					FormsAuthenticationTicket ticket = FormsAuthentication.Decrypt(authCookie.Value);

					if (ticket != null && !ticket.Expired)
					{
						// You stored "role|fullname" in UserData
						string[] data = ticket.UserData.Split('|');
						int role = int.Parse(data[0]);
						string fullName = data.Length > 1 ? data[1] : "";

						// Create identity and principal
						var identity = new FormsIdentity(ticket);
						var principal = new GenericPrincipal(identity, new[] { role.ToString() });

						HttpContext.Current.User = principal;
					}
				}
				catch (Exception ex)
				{
					Console.WriteLine(ex);
				}
			}
		}



	}
}
