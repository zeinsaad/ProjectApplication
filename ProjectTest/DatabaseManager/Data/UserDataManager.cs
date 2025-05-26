using ProjectTest.DatabaseManager.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Security;
using Twilio.Types;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using System.Web.Http;
using Twilio.Http;
using Twilio.TwiML;
using System.Net.Http;
using System.Threading.Tasks;

namespace ProjectTest.DatabaseManager.Data
{
	public class UserDataManager
	{
		private readonly BaseDataManager _baseDataManager;
		public UserDataManager() { 
		 
			_baseDataManager = new BaseDataManager();
		}
		public void AddUser(User user)
		{
			// Step 1: Verify the phone number first
			bool isPhoneAvailable = VerifyPhoneNumber(user.PhoneNumber); // TRUE means available, FALSE means exists

			if (isPhoneAvailable == false)
			{
				throw new Exception("Phone number already exists.");
			}

			// Step 2: Proceed with user addition
			string procedureName = "AddUser";
			string hashedPassword = HashPassword(user.Password);

			var parameters = new List<SqlParameter>
	{
		new SqlParameter("@PhoneNumber", user.PhoneNumber),
		new SqlParameter("@FullName", user.FullName),
		new SqlParameter("@Password", hashedPassword),
		new SqlParameter("@Role", user.Role)
	};


			_baseDataManager.ExecuteNonQuery(procedureName, parameters.ToArray());
		}


		public User CheckUser(User user)
		{
			// Hash the password for comparison
			string hashedPassword = HashPassword(user.Password);
			var parameters = new object[] { user.PhoneNumber, hashedPassword };

			Func<IDataReader, User> mapUser = reader =>
			{
				if (!reader.IsDBNull(0))
				{
					return new User
					{
						Id = reader.GetInt32(0),
						PhoneNumber = reader.GetString(1),
						FullName = reader.GetString(2),
						Role = reader.GetInt32(3)
					};
				}
				return null;
			};

			var result = _baseDataManager.GetSPItems("GetUser", mapUser, parameters);

			var authenticatedUser = result.FirstOrDefault();

			if (authenticatedUser == null)
			{
				return null; // Invalid login
			}

			var userData = $"{authenticatedUser.Role}|{authenticatedUser.FullName}";

			var ticket = new FormsAuthenticationTicket(
				1,
				authenticatedUser.PhoneNumber,
				DateTime.Now,
				DateTime.Now.AddMinutes(30),
				false,
				userData
			);

			string encryptedTicket = FormsAuthentication.Encrypt(ticket);
			var authCookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket)
			{
				HttpOnly = true,
				Secure = false, // Set to true if using HTTPS
				Expires = DateTime.Now.AddMinutes(30)
			};

			HttpContext.Current.Response.Cookies.Add(authCookie);

			return authenticatedUser;

		}



		public bool VerifyPhoneNumber(string phoneNumber)
		{
			var parameters = new object[] { phoneNumber };

			Func<IDataReader, bool> mapResult = reader =>
			{
				return reader.GetInt32(0) == 1; // 1 means phone number is NOT unique
			};

			var result = _baseDataManager.GetSPItems("IsPhoneNumberUnique", mapResult, parameters);
			return result.FirstOrDefault();
		}

		public string HashPassword ( string password)
		{
			using(var sha256=SHA256.Create())
			{
				byte[] bytes = Encoding.UTF8.GetBytes(password);
				byte[] hash = sha256.ComputeHash(bytes);
				return Convert.ToBase64String(hash);
			}
		}

		public void Logout()
		{
			// Clear the authentication cookie
			FormsAuthentication.SignOut();

			// Remove the cookie from the client
			var cookie = new HttpCookie(FormsAuthentication.FormsCookieName)
			{
				Expires = DateTime.Now.AddDays(-1) // Expire the cookie immediately
			};
			HttpContext.Current.Response.Cookies.Add(cookie);
		}

		public User GetUserByPhoneNumber(string phoneNumber)
		{
			

			var parameters = new object[] { phoneNumber };
			Func<IDataReader, User> mapUser = reader =>
			{
				if (!reader.IsDBNull(0)) // Check if the result is not null
				{
					return new User
					{
						Id = reader.GetInt32(0),
						PhoneNumber = reader.GetString(1),
						FullName = reader.GetString(2),
						Role = reader.GetInt32(3)
					};
				}
				return null; // If no user found
			};

			// Call the stored procedure to get user data
			var result = _baseDataManager.GetSPItems("GetUserByPhoneNb", mapUser, parameters);
			return result.FirstOrDefault(); // Return the first result (or null if no match)
		}

		public User GetUserById(int id)
		{


			var parameters = new object[] { id };
			Func<IDataReader, User> mapUser = reader =>
			{
				if (!reader.IsDBNull(0)) // Check if the result is not null
				{
					return new User
					{
						Id = reader.GetInt32(0),
						PhoneNumber = reader.GetString(1),
						FullName = reader.GetString(2),
						Role = reader.GetInt32(3)
					};
				}
				return null; // If no user found
			};

			// Call the stored procedure to get user data
			var result = _baseDataManager.GetSPItems("GetUserById", mapUser, parameters);
			return result.FirstOrDefault(); // Return the first result (or null if no match)
		}


		
		public void sendOtp(string phoneNb, int otp)
		{
			try
			{
				// Twilio credentials from your Twilio Console
				string accountSid = "ACdb0488c8e62dc411b88fcf83ef978ee0";  // Your Account SID
				string authToken = "3b86eaf6f060b7fc421a179f9129374a";    // Your Auth Token

				// Initialize the Twilio client
				TwilioClient.Init(accountSid, authToken);

				// Ensure the phone number is in the correct WhatsApp format (e.g., "whatsapp:+96176354954")
				string formattedPhoneNumber = $"whatsapp:{phoneNb}"; // phoneNb should be passed as "+96176354954" or similar

				// Send OTP message via WhatsApp
				var message = MessageResource.Create(
					body: $"Hello, your verification for PremiumStore is: {otp}. Do not share this code with anyone.",
					from: new PhoneNumber("whatsapp:+14155238886"), // Twilio WhatsApp number (sandbox)
					to: new PhoneNumber(formattedPhoneNumber)      // Dynamic recipient's WhatsApp number
				);

			
			}
			catch (Exception ex)
			{
				// Handle errors (e.g., invalid phone number, Twilio service issues)
				Console.WriteLine($"Error sending OTP: {ex.Message}");
			}
		}

	
		public List<User> GetAllUsers(string name = null , int? id = null)
		{
			var parameters = new object[] { id, name };

			Func<IDataReader, User> mapUser = reader =>
			{
				
					var user = new User
					{
						Id = reader.GetInt32(0),
						PhoneNumber = reader.GetString(1),
						FullName = reader.GetString(2),
						Role = reader.GetInt32(3),
						isDeactivated = reader.GetBoolean(4)
					};
				
				return user;
			};

			var result = _baseDataManager.GetSPItems("GetAllUsers", mapUser, parameters.ToArray());
			
			return result;
		}

		public void UpdateUserRole(int userId, int newRole)
		{
			string sp = "UpdateUserRole";
			var parameters = new[]
			{
				new SqlParameter("@UserId", userId),
				new SqlParameter("@NewRole", newRole)
			};
			_baseDataManager.ExecuteNonQuery(sp, parameters);
		}

		public void UpdateUserStatus(int userId, bool status)
		{
			string sp = "UpdateUserStatus";
			var parameters = new[]
			{
				new SqlParameter("@UserId", userId),
				new SqlParameter("@IsDeactivated", status)
			};
			_baseDataManager.ExecuteNonQuery(sp, parameters);
		}
	}
}