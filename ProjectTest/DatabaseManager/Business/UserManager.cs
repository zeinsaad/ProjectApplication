using ProjectTest.DatabaseManager.Data;
using ProjectTest.DatabaseManager.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTest.DatabaseManager.Business
{
	public class UserManager
	{
		private readonly UserDataManager _userDataManager;

		public UserManager()
		{
			_userDataManager = new UserDataManager();
		}

		public void AddUser (User user)
		{
			_userDataManager.AddUser(user);
		}

		public User CheckUser (User user)
		{
			return _userDataManager.CheckUser(user);
		}

		public bool IsPhoneNbAvailable(string phoneNb)
		{
			return _userDataManager.VerifyPhoneNumber(phoneNb);
		}

		public void Logout()
		{
			_userDataManager.Logout();
		}

		public User GetUserByPhoneNb(string phoneNb)
		{
			return _userDataManager.GetUserByPhoneNumber(phoneNb);
		}

		public User GetUserById(int id)
		{
			return _userDataManager.GetUserById(id);
		}

		public void sendOtp(string phoneNb, int otp)
		{
			_userDataManager.sendOtp(phoneNb, otp);
		}

		public List<User> GetAllUsers(string name = null, int? id = null)
		{
			return _userDataManager.GetAllUsers(name, id);
		}
		public void UpdateUserRole(int userId, int newRole)
		{
			_userDataManager.UpdateUserRole(userId, newRole);
		}

		public void UpdateUserStatus(int userId, bool status)
		{
			_userDataManager.UpdateUserStatus(userId, status);
		}
	}
}