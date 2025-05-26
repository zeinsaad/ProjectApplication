using ProjectTest.DatabaseManager.Entities.Order;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace ProjectTest.DatabaseManager.Data
{
	public class OrderDataManager
	{
		private readonly BaseDataManager _baseDataManager;

		public OrderDataManager()
		{
			_baseDataManager = new BaseDataManager();
		}

		public void PlaceOrder(Order order)
		{
			string procedureName = "PlaceOrder";

			// Create DataTable for order items (OrderProducts)
			DataTable orderItemsTable = new DataTable();
			orderItemsTable.Columns.Add("ProductId", typeof(int));
			orderItemsTable.Columns.Add("Quantity", typeof(int));
			orderItemsTable.Columns.Add("Price", typeof(decimal));

			foreach (var item in order.OrderItems)
			{
				orderItemsTable.Rows.Add(item.ProductId, item.Quantity, item.Price);
			}

			// Conditional defaults if UserId is null (guest order)
			bool isGuest = !order.UserId.HasValue;
			var userId = isGuest ? (object)DBNull.Value : order.UserId.Value;
			var city = isGuest ? (object)DBNull.Value : (object)order.City;
			var address = isGuest ? (object)DBNull.Value : (object)order.Address;
			var isPaid = isGuest ? true : false;
			var status = isGuest ? 5 : 1;
			var paymentMethod = isGuest ? "cash" : order.PaymentMethod;
			var orderType = isGuest ? 2 : 1;

			// Define SQL parameters
			var parameters = new[]
			{
		new SqlParameter("@UserId", userId),
		new SqlParameter("@PhoneNumber", order.PhoneNumber),
		new SqlParameter("@City", city),
		new SqlParameter("@Address", address),
		new SqlParameter("@PaymentMethod", paymentMethod),
		new SqlParameter("@TotalPrice", order.TotalPrice),
		new SqlParameter("@IsPaid", isPaid),
		new SqlParameter("@OrderDate", DateTime.Now),
		new SqlParameter("@Status", status),
		new SqlParameter("@OrderType", orderType),
		new SqlParameter("@CustomerName", order.CustomerName as object ?? DBNull.Value),
		new SqlParameter("@OrderItems", SqlDbType.Structured)
		{
			TypeName = "OrderItemType",
			Value = orderItemsTable
		}
	};

			_baseDataManager.ExecuteNonQuery(procedureName, parameters);
		}


		public void UpdateOrder(UpdateOrderModel updateOrderModel)
		{
			string procedureName = "updateOrder";

			var parameters = new[]
			{
		new SqlParameter("@OrderId", updateOrderModel.orderId),
		new SqlParameter("@Status", updateOrderModel.status.HasValue ? (object)updateOrderModel.status.Value : DBNull.Value),
		new SqlParameter("@IsPaid", updateOrderModel.isPaid.HasValue ? (object)updateOrderModel.isPaid.Value : DBNull.Value)
	};

			_baseDataManager.ExecuteNonQuery(procedureName, parameters);
		}



		public List<Order> GetAllOrdersWithItems(string CustomerName = null, DateTime? OrderDate = null, int? OrderId = null , int? Status = null , bool? IsPaid = null , int? OrderType =null)
		{
			var parameters = new object[]
			{
		OrderId ?? (object)DBNull.Value,
		CustomerName ?? (object) DBNull.Value,
		OrderDate ?? (object) DBNull.Value,
		Status ?? (object) DBNull.Value,
		IsPaid ?? (object) DBNull.Value,
		OrderType ?? (object) DBNull.Value
			};

			var result = _baseDataManager.GetSPItems("GetAllOrdersWithItems", reader =>
			{
				var orderId = reader.GetInt32(0);

				var order = new Order
				{
					Id = orderId,
					UserId = reader.IsDBNull(1) ? (int?)null : reader.GetInt32(1),
					OrderDate = reader.GetDateTime(2),
					Status = reader.GetInt32(3),
					City = reader.IsDBNull(4) ? null : reader.GetString(4),
					Address = reader.IsDBNull(5) ? null : reader.GetString(5),
					PaymentMethod = reader.GetString(6),
					TotalPrice = reader.GetDecimal(7),
					isPaid = reader.GetBoolean(8),
					PhoneNumber = reader.GetString(9),
					OrderItems = new List<OrderProducts>(),
					orderType = reader.GetInt32(11),
					CustomerName = reader.IsDBNull(12) ? null : reader.GetString(12)
				};

				string serializedOrderItems = reader.IsDBNull(10) ? null : reader.GetString(10);
				if (!string.IsNullOrEmpty(serializedOrderItems))
				{
					order.OrderItems = JsonConvert.DeserializeObject<List<OrderProducts>>(serializedOrderItems);
				}

				return order;
			}, parameters);

			return result;
		}

		public List<Order> GetMyOrders(int userId , string CustomerName = null, DateTime? OrderDate = null, int? OrderId = null, int? Status = null, bool? IsPaid = null, int? OrderType = null)
		{
			var parameters = new object[]
			{
				userId,
		OrderId ?? (object)DBNull.Value,
		CustomerName ?? (object) DBNull.Value,
		OrderDate ?? (object) DBNull.Value,
		Status ?? (object) DBNull.Value,
		IsPaid ?? (object) DBNull.Value,
		OrderType ?? (object) DBNull.Value
			};

			var result = _baseDataManager.GetSPItems("GetMyOrdersWithItems", reader =>
			{
				var orderId = reader.GetInt32(0);

				var order = new Order
				{
					Id = orderId,
					UserId = reader.IsDBNull(1) ? (int?)null : reader.GetInt32(1),
					OrderDate = reader.GetDateTime(2),
					Status = reader.GetInt32(3),
					City = reader.IsDBNull(4) ? null : reader.GetString(4),
					Address = reader.IsDBNull(5) ? null : reader.GetString(5),
					PaymentMethod = reader.GetString(6),
					TotalPrice = reader.GetDecimal(7),
					isPaid = reader.GetBoolean(8),
					PhoneNumber = reader.GetString(9),
					OrderItems = new List<OrderProducts>(),
					orderType = reader.GetInt32(11),
					CustomerName = reader.IsDBNull(12) ? null : reader.GetString(12)
				};

				string serializedOrderItems = reader.IsDBNull(10) ? null : reader.GetString(10);
				if (!string.IsNullOrEmpty(serializedOrderItems))
				{
					order.OrderItems = JsonConvert.DeserializeObject<List<OrderProducts>>(serializedOrderItems);
				}

				return order;
			}, parameters);

			return result;
		}




	}
}