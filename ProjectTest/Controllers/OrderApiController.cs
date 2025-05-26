using ProjectTest.DatabaseManager.Business;
using ProjectTest.DatabaseManager.Entities;
using ProjectTest.DatabaseManager.Entities.Order;
using ProjectTest.DatabaseManager.Entities.Reviews;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace ProjectTest.Controllers
{
	[RoutePrefix("shop")]
	public class OrderApiController : ApiController
    {
        private readonly OrderManager orderManager;
        private readonly ReviewManager reviewManager;
        private readonly UserManager userManager;

        public OrderApiController()
        {
            orderManager = new OrderManager();
            reviewManager = new ReviewManager();
			userManager = new UserManager();
        }

		[HttpPost]
		[Route("PlaceOrder")]
        public void PlaceOrder(Order order)
        {
            orderManager.PlaceOrder(order);
        }

        [HttpPost]
        [Route("SubmitReview")]
        public void SubmitReview(ProductReview productReview)
        {
            reviewManager.AddReview(productReview);
        }

        [HttpGet]
        [Route("GetReview")]
        public ProductReview GetReview(int UserId, int ProductId)
        {
            return reviewManager.GetReview(UserId , ProductId);
        }

        [HttpGet]
        [Route("GetProductReviews/{productId}")]
        
        public List<ProductReviewsDetails> GetProductReviews(int productId)
        {
            return reviewManager.GetProductReviews(productId);
        }

        [HttpGet]
        [Route("GetAllOrders")]
		public List<OrderInfo> GetAllOrdersWithItems(string CustomerName = null, DateTime? OrderDate = null, int? OrderId = null, int? Status = null, bool? IsPaid = null, int? OrderType = null)
        {
            return orderManager.GetAllOrdersWithItems(CustomerName, OrderDate , OrderId, Status , IsPaid ,  OrderType );
        }

		[HttpGet]
		[Authorize]
		[Route("GetMyOrders")]

		public List<OrderInfo> GetMyOrders(string CustomerName = null, DateTime? OrderDate = null, int? OrderId = null, int? Status = null, bool? IsPaid = null, int? OrderType = null)
		{
			string phoneNb = User.Identity.Name;


			var user = userManager.GetUserByPhoneNb(phoneNb);


			// If user is found, proceed with fetching orders
			return orderManager.GetMyOrders(user.Id, CustomerName, OrderDate, OrderId, Status, IsPaid, OrderType);
		}

	



		[HttpPost]
        [Route("updateOrder")]
		public void UpdateOrder(UpdateOrderModel updateOrderModel)
        {
            orderManager.UpdateOrder(updateOrderModel);
        }
	}
}
