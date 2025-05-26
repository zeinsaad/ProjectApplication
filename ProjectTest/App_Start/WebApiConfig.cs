using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace ProjectTest
{
	public static class WebApiConfig
	{
		public static void Register(HttpConfiguration config)
		{
			// Web API configuration and services

			// Web API routes
			config.MapHttpAttributeRoutes();

			config.Routes.MapHttpRoute(
				name: "DefaultApi",
				routeTemplate: "api/{controller}/{id}",
				defaults: new { id = RouteParameter.Optional }
			);

			var json = config.Formatters.JsonFormatter;
			json.SerializerSettings.TypeNameHandling = Newtonsoft.Json.TypeNameHandling.Objects;
			json.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Unspecified;
		}
	}
}
