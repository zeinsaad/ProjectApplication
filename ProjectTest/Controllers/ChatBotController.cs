using ProjectTest.DatabaseManager.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web.Http;
using StopWord;
using Twilio.TwiML.Voice;
using Pluralize.NET;
using FuzzySharp;
using ProjectTest.DatabaseManager.Entities;

namespace ProjectTest.Controllers
{
	[RoutePrefix("chatBot")]
	public class ChatBotController : ApiController
	{
		// Placeholder for product and category managers
		private readonly ProductManager _productManager;
		private readonly CategoryManager _categoryManager;
		private readonly OrderManager _orderManager;
		private readonly Pluralizer _pluralizer = new Pluralizer();


		// Contact information
		private readonly string _location = "123 Car Parts St., Auto City, ABC";
		private readonly string _phone = "+961 76 354 954";
		private readonly string _email = "contact@carparts.com";

		public ChatBotController()
		{
			_productManager = new ProductManager();
			_categoryManager = new CategoryManager();
			_orderManager = new OrderManager();
		}

		// POST: api/chatbot/sendMessage
		[HttpPost]
		[Route("sendMessage")]
		public string SendMessage(ChatMessageRequest request)
		{
			if (request == null || string.IsNullOrWhiteSpace(request.Message))
			{
				return "Please provide a message.";
			}

			string botResponse = GenerateBotResponse(request.Message);
			return botResponse;
		}

		// Simulate bot response logic
		private string GenerateBotResponse(string userMessage)
		{
			string messageLower = userMessage.ToLower();

			if (IsGreetingIntent(messageLower)) return HandleGreetingIntent();
			if (IsThanksIntent(messageLower)) return HandleThanksIntent();

			if (IsHelpIntent(messageLower)) return HandleHelpIntent();
			if (IsEmailIntent(messageLower)) return HandleEmailIntent();
			if (IsLocationIntent(messageLower)) return HandleLocationIntent();
			if (IsStoreHoursIntent(messageLower)) return HandleStoreHoursIntent();
			if (IsPhoneIntent(messageLower)) return HandlePhoneIntent();
			
			if (IsDiscountIntent(messageLower)) return HandleDiscountIntent();
			
			if (IsShippingIntent(messageLower)) return HandleShippingIntent();
			if (IsPaymentIntent(messageLower)) return HandlePaymentIntent();
			if (IsTrackOrderIntent(messageLower, out int orderId)) return HandleTrackOrderIntent(orderId);
			if (IsSearchProductIntent(messageLower)) return HandleProductSearchIntent(messageLower);
			if (IsSearchCategoryIntent(messageLower)) return HandleCategorySearchIntent(messageLower);
			
			if (IsProductIntent(messageLower)) return HandleProductIntent();


			return "I'm sorry, I didn't quite understand that. Can you rephrase your question?";
		}

		#region Intent Functions
		private bool IsDiscountIntent(string message)
		{
			var discountKeywords = new[] { "discount", "sale", "offer", "promotion", "deal", "coupon", "price reduction" };
			return IsIntentMatch(message, discountKeywords);
		}
		private string HandleDiscountIntent()
		{
			var discountedProducts = _productManager.GetProducts(null,null,null,null,null,null,true);
			var now = DateTime.Now;

			if (discountedProducts != null && discountedProducts.Any())
			{
				var activeDiscounts = discountedProducts
					.Where(p => p.Discount.StartDate <= now && p.Discount.EndDate >= now)
					.ToList();

				if (!activeDiscounts.Any())
					return "Sorry, we currently don't have any active discounts.";

				var resultLines = new List<string>();

				foreach (var p in activeDiscounts)
				{
					decimal discountedPrice = p.Price;

					if (p.Discount.DiscountType == 1) // Fixed amount discount
					{
						discountedPrice = Math.Max(0, p.Price - p.Discount.DiscountValue);
					}
					else if (p.Discount.DiscountType == 2) // Percentage discount
					{
						discountedPrice = p.Price * (1 - (p.Discount.DiscountValue / 100m));
					}

					resultLines.Add($"{p.Name}: Old Price: ${p.Price:F2}, Discounted Price: ${discountedPrice:F2}");
				}

				return "Special discounts currently available:\n- " + string.Join("\n- ", resultLines);
			}
			else
			{
				return "Sorry, we currently don't have any discounted products.";
			}
		}



		// Reusable fuzzy intent matcher
		private bool IsIntentMatch(string message, IEnumerable<string> keywords, int threshold = 90)
		{
			if (string.IsNullOrWhiteSpace(message) || keywords == null)
				return false;

			var normalizedMessage = message.ToLower();

			return keywords.Any(keyword =>
				Fuzz.PartialRatio(keyword.ToLower(), normalizedMessage) >= threshold
			);
		}

		// Greeting Intent
		private bool IsGreetingIntent(string message)
		{
			var greetingKeywords = new[]
			{
		"hello", "hi", "hey", "greetings", "good morning", "good afternoon",
		"good evening", "howdy", "what's up", "hiya", "salutations", "hi there",
		"good day", "morning", "evening", "welcome", "yo", "hola"
	};

			// Strict matching for greetings (starts with or exact)
			return greetingKeywords.Any(keyword =>
				message.StartsWith(keyword, StringComparison.OrdinalIgnoreCase) ||
				message.Equals(keyword, StringComparison.OrdinalIgnoreCase)
			);
		}

		private string HandleGreetingIntent() => "Hello! How can I assist you today?";

		private bool IsThanksIntent(string message)
		{
			var thanksKeywords = new[]
			{
		"thank you", "thanks", "thx", "many thanks", "thanks a lot",
		"thank u", "much appreciated", "appreciate it", "ty", "thanks so much"
	};

			// Strict matching for thanks (starts with or exact)
			return thanksKeywords.Any(keyword =>
				message.StartsWith(keyword, StringComparison.OrdinalIgnoreCase) ||
				message.Equals(keyword, StringComparison.OrdinalIgnoreCase)
			);
		}

		private string HandleThanksIntent() =>
	"You're welcome! Let me know if there's anything else I can help you with.";


		// Help Intent
		private bool IsHelpIntent(string message)
		{
			var helpKeywords = new[] { "help", "assist", "support" };
			return IsIntentMatch(message, helpKeywords);
		}
		private string HandleHelpIntent() => "Sure! Please tell me what you need help with.";

		// Location Intent
		private bool IsLocationIntent(string message)
		{
			var locationKeywords = new[] { "location", "address", "where are you" };
			return IsIntentMatch(message, locationKeywords);
		}
		private string HandleLocationIntent() => $"Our location is: {_location}";

		// Phone Intent
		private bool IsPhoneIntent(string message)
		{
			var phoneKeywords = new[] { "phone", "contact", "number" };
			return IsIntentMatch(message, phoneKeywords);
		}
		private string HandlePhoneIntent() => $"You can contact us at: {_phone}";

		//open hours Intent
		private bool IsStoreHoursIntent(string message)
		{
			var storeHoursKeywords = new[] { "hours", "open", "opening times", "when are you open", "closing time" };
			return IsIntentMatch(message, storeHoursKeywords);
		}
		private string HandleStoreHoursIntent()
		{
			return "Our store is open from Monday to Friday, 9 AM to 6 PM, and on Saturdays from 10 AM to 4 PM. We are closed on Sundays.";
		}


		// Email Intent
		private bool IsEmailIntent(string message)
		{
			var emailKeywords = new[] { "email", "contact us" };
			return IsIntentMatch(message, emailKeywords);
		}
		private string HandleEmailIntent() => $"You can reach us via email at: {_email}";

		// Product Intent (Listing all products)
		private bool IsProductIntent(string message)
		{
			var productKeywords = new[] { "product", "products", "parts", "items", "inventory" };
			return IsIntentMatch(message, productKeywords);
		}
		private string HandleProductIntent()
		{
			var products = _categoryManager.GetCategories(null);
			if (products != null && products.Any())
			{
				var productNames = products.Select(p => p.Name).ToList();
				return $"We have the following products:\n- " + string.Join("\n- ", productNames);
			}
			return "Sorry, we currently don't have any products listed.";
		}

		// Shipping Intent
		private bool IsShippingIntent(string message)
		{
			var shippingKeywords = new[] { "shipping", "delivery", "ship", "send", "shipping time", "arrives", "shipping cost" };
			return IsIntentMatch(message, shippingKeywords);
		}
		private string HandleShippingIntent() => "Shipping costs $10 and delivery takes between 3 to 5 business days.";

		// Track Order Intent (kept regex for orderId extraction)
		private bool IsTrackOrderIntent(string message, out int orderId)
		{
			orderId = 0;
			var match = Regex.Match(message, @"\b(order|track).*?(id|#)?\s*[:\-]?\s*(\d+)", RegexOptions.IgnoreCase);
			return match.Success && int.TryParse(match.Groups[3].Value, out orderId);
		}
		private string HandleTrackOrderIntent(int orderId)
		{
			var order = _orderManager.GetAllOrdersWithItems(null, null, orderId, null, null, null).FirstOrDefault();
			if (order == null)
				return $"Sorry, I couldn't find any information for the order ID: {orderId}.";

			if (Enum.IsDefined(typeof(OrderStatus), order.Status))
			{
				var statusDescription = Enum.GetName(typeof(OrderStatus), (OrderStatus)order.Status);
				return $"The status of your order ID {orderId} is: {statusDescription}.";
			}
			return $"The status of your order ID {orderId} is unknown.";
		}

		// Smart Product Search (Fuzzy Matching) - kept as is
		private bool IsSearchProductIntent(string message)
		{
			var products = _productManager.GetProducts(null, null, null, null, null, null, null);
			var keywords = GetKeywords(message);

			return products.Any(product => ProductNameContainsAllKeywords(product.Name, keywords));
		}

		private string HandleProductSearchIntent(string userMessage)
		{
			var products = _productManager.GetProducts(null, null, null, null, null, null, null);
			var keywords = GetKeywords(userMessage);
			if (keywords.Count == 0)
				return "Could you please specify the product you are looking for?";

			var matchingProducts = products
				.Where(product => ProductNameContainsAllKeywords(product.Name, keywords))
				.ToList();
			return matchingProducts.Any()
		? "Here are the products matching your search:\n- " +
		  string.Join("\n- ", matchingProducts.Select(p =>
		  {
			  decimal discountedPrice = CalculateDiscountedPrice(p);
			  return $"{p.Name} - ${discountedPrice:F2}";
		  }))
		: "Sorry, no products match your search.";
		}

		// Category Intent (use fuzzy matching on category names instead of exact matching)
		private bool IsSearchCategoryIntent(string message)
		{
			var categories = _categoryManager.GetCategories(null).Select(c => c.Name.ToLower()).ToList();
			return categories.Any(category =>
				Fuzz.PartialRatio(category, message.ToLower()) >= 80
				|| Fuzz.PartialRatio(_pluralizer.Singularize(category), message.ToLower()) >= 80
				|| Fuzz.PartialRatio(_pluralizer.Pluralize(category), message.ToLower()) >= 80);
		}

		private string HandleCategorySearchIntent(string userMessage)
		{
			var categories = _categoryManager.GetCategories(null);
			var matchedCategory = categories.FirstOrDefault(c =>
				Fuzz.PartialRatio(c.Name.ToLower(), userMessage.ToLower()) >= 80 ||
				Fuzz.PartialRatio(_pluralizer.Singularize(c.Name.ToLower()), userMessage.ToLower()) >= 80 ||
				Fuzz.PartialRatio(_pluralizer.Pluralize(c.Name.ToLower()), userMessage.ToLower()) >= 80);

			if (matchedCategory == null)
				return "Sorry, no matching category found.";

			var products = _productManager.GetProducts(null, matchedCategory.Id, null, null, null, null, null);
			if (!products.Any())
				return $"Sorry, no products found in the '{matchedCategory.Name}' category.";

			return $"Here are the products in the '{matchedCategory.Name}' category:\n- " +
				   string.Join("\n- ", products.Select(p =>
				   {
					   decimal discountedPrice = CalculateDiscountedPrice(p);
					   return $"{p.Name} - ${discountedPrice:F2}";
				   }));
		}

		// Payment Information Intent
		private bool IsPaymentIntent(string message)
		{
			var paymentKeywords = new[]
			{
		"payment", "pay", "payment method", "accepted payment",
		"how can i pay", "payment options", "ways to pay", "make payment"
	};
			return IsIntentMatch(message, paymentKeywords);
		}
		private string HandlePaymentIntent()
		{
			return "You can pay using:\n- Cash\n- Whish Money app (available on iOS and Android)";
		}

		#endregion

		private List<string> GetKeywords(string text)
		{
			var englishStopWords = StopWords.GetStopWords("en");

			var tokens = text.ToLower()
							 .Split(new[] { ' ', '?', '.', ',', '!' }, StringSplitOptions.RemoveEmptyEntries);

			var filtered = tokens
				.Where(word => !englishStopWords.Contains(word) && word.Length > 2)
				.ToList();

			return filtered;
		}




		private bool ProductNameContainsAllKeywords(string productName, List<string> keywords)
		{
			var name = productName.ToLower();
			return keywords.All(keyword => name.Contains(keyword));
		}

		// Category Intent
		// Category Intent
		private decimal CalculateDiscountedPrice(ProductDetails product)
		{
			if (product.Discount == null || product.Discount.StartDate > DateTime.Now || product.Discount.EndDate < DateTime.Now)
				return product.Price;

			return product.Discount.DiscountType == 1
				? Math.Max(0, product.Price - product.Discount.DiscountValue) // Fixed amount discount
				: product.Price * (1 - (product.Discount.DiscountValue / 100m)); // Percentage discount
		}


	}

// Enums
public enum OrderStatus { Pending = 1, Shipped, Delivered, Cancelled, Served }

	// DTOs
	public class ChatMessageRequest { public string Message { get; set; } }
	public class ChatMessageResponse { public string Message { get; set; } }
}
