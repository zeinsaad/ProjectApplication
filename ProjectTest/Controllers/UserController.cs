using ProjectTest.DatabaseManager.Business;
using ProjectTest.DatabaseManager.Data;
using ProjectTest.DatabaseManager.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Twilio;
using Twilio.Http;
using Twilio.Rest.Api.V2010.Account;

namespace ProjectTest.Controllers
{
    [RoutePrefix("user")]
    public class UserController : ApiController
    {
        private readonly UserManager _userManager;

        public UserController()
        {
            _userManager = new UserManager();
        }

		[HttpPost]
		[Route("Signup")]
		public void Signup(User user)
        {
            _userManager.AddUser(user);
        }

		[HttpPost]
		[Route("Login")]
		public User Login(User user)
        {
            return _userManager.CheckUser(user);
        }

        [HttpGet]
        [Route("PhoneNbAvailable")]

        public bool IsPhoneNumberAvailable(string phoneNb)
        {
            return _userManager.IsPhoneNbAvailable(phoneNb);
        }

		[HttpGet]
		[Route("getUserByPhoneNb/{phoneNb}")]

		public User GetUserByPhoneNb(string phoneNb)
		{
			return _userManager.GetUserByPhoneNb(phoneNb);
		}

		[HttpGet]
		[Route("getUserById/{id}")]

		public User GetUserById(int id)
		{
			return _userManager.GetUserById(id);
		}

		[HttpPost]
        [Route("Logout")]
        public void Logout()
        {
            _userManager.Logout();
        }

		[HttpGet]
		[Route("current")]
		public User GetCurrentUser()
		{
			

			// Get the phone number from the identity
			string phoneNumber = User.Identity.Name;

			// Call your service/repo to get the user by phone number
			var user = _userManager.GetUserByPhoneNb(phoneNumber);

			if (user == null)
				return null;

			return user; // returns { Id, FullName, PhoneNumber, Role, ... }
		}

		[HttpPost]
		[Route("sendOtp")]

		public void sendOtp(SendOtpRequest request)
		{
			_userManager.sendOtp(request.PhoneNumber, request.Otp);
		}

		[HttpGet]
		[Route("getAllUsers")]
		public List<User> GetAllUsers(string name = null, int? id = null)
		{
			return _userManager.GetAllUsers(name, id);
		}

		[HttpPost]
		[Route("updateUserRole")]
		public void UpdateUserRole(UserRoleUpdateModel model)
		{
			int userId = model.UserId;
			int newRole = model.NewRole;
			_userManager.UpdateUserRole(userId, newRole);
		}

		[HttpPost]
		[Route("updateUserStatus")]
		public void UpdateUserStatus(UserStatusUpdateModel model)
		{
			int userId = model.UserId;
			bool newStatus = model.NewStatus;
			_userManager.UpdateUserStatus(userId, newStatus);
		}

		[HttpGet]
		[Route("checkJoinStatus")]
		public async Task<IHttpActionResult> CheckJoinStatus(string phoneNumber)
		{
			try
			{
				// Initialize Twilio client
				var accountSid = "ACdb0488c8e62dc411b88fcf83ef978ee0";
				var authToken = "3b86eaf6f060b7fc421a179f9129374a";
				TwilioClient.Init(accountSid, authToken);

				// Retrieve recent messages for the phone number
				var messages = await MessageResource.ReadAsync(
					from: new Twilio.Types.PhoneNumber(phoneNumber),
					to: new Twilio.Types.PhoneNumber("whatsapp:+14155238886") // Your Twilio WhatsApp number
				);

				// Check if any message contains "join mean-contrast"
				var joinConfirmed = messages.Any(msg =>
					msg.Body?.Trim().ToLower() == "join mean-contrast"
				);

				return Ok(new { joinConfirmed });
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex);
				return InternalServerError(ex);
			}
		}

	}

	public class SendOtpRequest
	{
		public string PhoneNumber { get; set; }
		public int Otp { get; set; }
	}

	public class UserRoleUpdateModel
	{
		public int UserId { get; set; }
		public int NewRole { get; set; }
	}

	public class UserStatusUpdateModel
	{
		public int UserId { get; set; }
		public bool NewStatus { get; set; }
	}
}
