using ProjectTest.DatabaseManager.Data;
using ProjectTest.DatabaseManager.Entities.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Linq;

namespace ProjectTest.DatabaseManager.Business
{
	public class OrderManager
	{
		private readonly OrderDataManager _orderDataManager;
		private readonly ProductManager _productManager;

		public OrderManager()
		{
			_orderDataManager = new OrderDataManager();
			_productManager = new ProductManager();
		}

		public void PlaceOrder (Order order) {
			_orderDataManager.PlaceOrder(order);
		}
		public List<OrderInfo> GetAllOrdersWithItems(string CustomerName = null, DateTime? OrderDate = null, int? OrderId = null, int? Status = null, bool? IsPaid = null, int? OrderType = null)
		{
			var results =  _orderDataManager.GetAllOrdersWithItems(CustomerName, OrderDate, OrderId, Status, IsPaid, OrderType);

			var mappedOrders = results.Select(d => new OrderInfo
			{
				Id = d.Id,
				UserId = d.UserId.HasValue ? d.UserId.Value : 0,
				PhoneNumber = d.PhoneNumber,
				Address = d.Address,
				City = d.City,
				PaymentMethod = d.PaymentMethod,
				TotalPrice = d.TotalPrice,
				isPaid = d.isPaid,
				OrderDate = d.OrderDate,
				Status = d.Status,
				orderType = d.orderType,
				OrderItems = d.OrderItems.Select(item => new OrderProductsInfo
				{
					ProductId = item.ProductId,
					ProductName = _productManager.GetProductById(item.ProductId).Name,
					ProductImages = _productManager.GetProductById(item.ProductId).ProductImages,
					Quantity = item.Quantity,
					Price = item.Price
				}).ToList(),
				UserName = d.CustomerName,
			}).ToList();

			return mappedOrders;
		}
		public List<OrderInfo> GetMyOrders(int userId, string CustomerName = null, DateTime? OrderDate = null, int? OrderId = null, int? Status = null, bool? IsPaid = null, int? OrderType = null)
		{
			var results = _orderDataManager.GetMyOrders(userId , CustomerName, OrderDate, OrderId, Status, IsPaid, OrderType);

			var mappedOrders = results.Select(d => new OrderInfo
			{
				Id = d.Id,
				UserId = d.UserId.HasValue ? d.UserId.Value : 0,
				PhoneNumber = d.PhoneNumber,
				Address = d.Address,
				City = d.City,
				PaymentMethod = d.PaymentMethod,
				TotalPrice = d.TotalPrice,
				isPaid = d.isPaid,
				OrderDate = d.OrderDate,
				Status = d.Status,
				orderType = d.orderType,
				OrderItems = d.OrderItems.Select(item => new OrderProductsInfo
				{
					ProductId = item.ProductId,
					ProductName = _productManager.GetProductById(item.ProductId).Name,
					ProductImages = _productManager.GetProductById(item.ProductId).ProductImages,
					Quantity = item.Quantity,
					Price = item.Price
				}).ToList(),
				UserName = d.CustomerName,
			}).ToList();

			return mappedOrders;
		}

			public void UpdateOrder(UpdateOrderModel updateOrderModel)
		{
			_orderDataManager.UpdateOrder(updateOrderModel);
		}
	}
}