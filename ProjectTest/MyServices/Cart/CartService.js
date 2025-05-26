angular.module('Ecommerce')
    .service('CartService', function ($window, $q, ProductWebApiService) {
        var carts = {}; // In-memory carts, keyed by userId


        function calculateDiscountPrice(product) {
            if (product && product.Discount && product.Price != null) {
                var now = new Date();
                var startDate = new Date(product.Discount.StartDate);
                var endDate = new Date(product.Discount.EndDate);

                // Check if current date is within the discount period
                if (now >= startDate && now <= endDate) {
                    var discountedPrice = product.Price;

                    if (product.Discount.DiscountType === 1) {
                        // Fixed amount discount
                        discountedPrice = discountedPrice - product.Discount.DiscountValue;
                    } else if (product.Discount.DiscountType === 2) {
                        // Percentage discount
                        discountedPrice = discountedPrice * (1 - (product.Discount.DiscountValue / 100));
                    }

                    return discountedPrice > 0 ? discountedPrice : 0;
                }
            }

            // If no valid discount or date is outside range, return original price
            return product.Price;
        }

        function loadCart(userId) {
            var stored = $window.localStorage.getItem('cart_' + userId);
            var localItems = stored ? JSON.parse(stored) : [];

            // Create a promise array to fetch updated product details
            var promises = localItems.map(function (item) {
                return ProductWebApiService.getProductById(item.ProductId).then(function (latestProduct) {
                    var discountedPrice = calculateDiscountPrice(latestProduct);
                    // Only update Quantity, keep all other attributes intact
                    return {
                        ProductId: latestProduct.ProductId,   // Keep ProductId as is
                        Name: latestProduct.Name,             // Keep Name as is
                        Price: discountedPrice,           // Keep Price (possibly discounted) as is
                        AvailableQuantity: latestProduct.Quantity,  // Keep AvailableQuantity as is
                        Image: latestProduct.ProductImages[0].ImagePath, // Keep the image as is
                        Quantity: item.Quantity // Keep the original quantity, only update it if needed
                    };
                });
            });

            // Wait for all product details to be fetched and updated
            return $q.all(promises).then(function (updatedItems) {
                carts[userId] = updatedItems;  // Store the updated cart for the user
            });
        }


        // Save cart to localStorage
        this.saveCart = function (userId) {
            $window.localStorage.setItem('cart_' + userId, JSON.stringify(carts[userId]));
        };

        // Init cart and return a promise
        this.initCart = function (userId) {
            if (!carts[userId]) {
                return loadCart(userId);
            }
            return $q.resolve(); // already initialized
        };

        // Get current cart (async)
        this.getCart = function (userId) {
            return this.initCart(userId).then(function () {
                return carts[userId];
            });
        };

        this.addItem = function (userId, item) {
            return this.initCart(userId).then(() => {
                var cart = carts[userId];
                var existing = cart.find(i => i.ProductId === item.ProductId);
                if (existing) {
                    existing.Quantity += item.Quantity;
                } else {
                    cart.push(item);
                }
                this.saveCart(userId);
            });
        };

        this.removeItem = function (userId, itemId) {
            return this.initCart(userId).then(() => {
                carts[userId] = carts[userId].filter(i => i.ProductId !== itemId);
                this.saveCart(userId);
            });
        };

        this.clearCart = function (userId) {
            carts[userId] = [];
            this.saveCart(userId);
        };

        this.getTotal = function (userId) {
            return this.initCart(userId).then(() => {
                return carts[userId].reduce((sum, item) => sum + item.Price * item.Quantity, 0);
            });
        };
    });
