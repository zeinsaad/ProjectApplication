using System.Web;
using System;
using System.Web.Mvc;
using System.IO; // ← MVC namespace

public class AdminAuthorizationFilter : AuthorizeAttribute
{
	protected override bool AuthorizeCore(HttpContextBase httpContext)
	{
		try
		{
			if (httpContext.User == null || !httpContext.User.Identity.IsAuthenticated)
			{
				LogError("Unauthorized access attempt by unauthenticated user.");
				return false;
			}

			var identity = httpContext.User.Identity as System.Web.Security.FormsIdentity;
			if (identity == null)
			{
				LogError("Identity is not FormsIdentity.");
				return false;
			}

			var ticket = identity.Ticket;
			var userData = ticket.UserData; // This is your "1|John Doe"

			LogError(userData);

			string[] parts = userData.Split('|');
			if (parts.Length < 1)
			{
				LogError("Malformed userData in ticket.");
				return false;
			}

			int userRole;
			if (int.TryParse(parts[0], out userRole))
			{
				if (userRole == 1)
				{
					return true; // Admin
				}
				else
				{
					LogError($"Access denied for non-admin user with role {userRole}.");
					return false;
				}
			}
			else
			{
				LogError("Could not parse role from userData.");
				return false;
			}
		}
		catch (Exception ex)
		{
			LogError("Exception in AdminAuthorizationFilter: " + ex.Message);
			return false;
		}
	}


	protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
	{
		filterContext.Result = new HttpStatusCodeResult(403, "You are not authorized to access this resource.");
	}

	private void LogError(string errorMessage)
	{
		try
		{
			string logFilePath = HttpContext.Current.Server.MapPath("~/Logs/ErrorLog.txt");
			string logMessage = $"{DateTime.Now} - {errorMessage}{Environment.NewLine}";
			File.AppendAllText(logFilePath, logMessage);
		}
		catch (Exception ex)
		{
			Console.WriteLine("Error logging to file: " + ex.Message);
		}
	}
}
