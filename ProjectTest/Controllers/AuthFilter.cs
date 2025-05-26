using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.Filters;
using System.Web.Security;


namespace ProjectTest.Controllers
{

	public class AuthFilter : AuthorizationFilterAttribute
	{
		public override void OnAuthorization(System.Web.Http.Controllers.HttpActionContext actionContext)
		{
			// Check if the user is authenticated
			if (HttpContext.Current.User == null || !HttpContext.Current.User.Identity.IsAuthenticated)
			{
				// Return a 401 Unauthorized status if not authenticated
				actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, "You are not authorized to access this resource.");
			}
			else
			{
				base.OnAuthorization(actionContext);
			}
		}
	}




}

