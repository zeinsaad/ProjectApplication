"use strict";

// Then define the controller
ShopPageController.$inject = ["$scope", '$q', 'CartService', 'ProductWebApiService', 'PaginationService', 'ModalService', 'AuthenticationService', 'ShopService','$rootScope'];

function ShopPageController($scope, $q, CartService, ProductWebApiService, PaginationService, ModalService, AuthenticationService, ShopService, $rootScope) {
    var categoryItemAPI;
    var categoryItemReadyDeferred = $q.defer();
    catId = parseInt(catId) || null;
    console.log("catId before assignment:", catId); // check if it's defined
    var categoryId = catId;
    console.log("categoryId after assignment:", categoryId);
    var pageSize = 6;
    var totalItems;
    defineScope();
    loadProducts();
    load();
    
  



    function defineScope() {
      
        $scope.currentPage = 1;
        $scope.isLoading = true;
        $scope.showPage = ShowPage;
        console.log(window.userIsLoggedIn);
     
        $scope.filters = {
            Name: '',
         //   CategoryId: categoryItemAPI && categoryItemAPI.getData() ? categoryItemAPI.getData() : null,
            MinPrice: null,
            MaxPrice: null,
            // Stock Status updated for a single selection (null = no filter)
            StockStatus: null,  // null means no filter, 1 means 'in stock', 0 means 'low stock', -1 means 'out of stock'

            // Discount Status: 'all', 'discounted', 'nonDiscounted'
            DiscountStatus: null,  // 'all', 'discounted', 'nonDiscounted'

            // Active Status: 'all', 'active', 'inactive'
            IsActive: null  // 'all', 'active', 'inactive'
        };
        $scope.openQuickView = openQuickView;
        AuthenticationService.current().then(function (result) {
            if (result) {
                $scope.userId = result.Id;
                CartService.initCart($scope.userId);

                // Since getCartCount() now returns a promise, you need to handle it with .then() to update the cart count
                getCartCount().then(function (cartCount) {
                    $scope.cartCount = cartCount; // Update $scope.cartCount with the resolved value
                }).catch(function (error) {
                    console.error("Error getting cart count:", error);
                    $scope.cartCount = 0; // Default to 0 if there's an error
                });
            }
        });
 // Replace with actual user logic if logged in
        
        
        
      //  CartService.clearCart($scope.userId);
        $scope.getAverageRating = function (product) {
            if (!product.ProductReviews || product.ProductReviews.length === 0) return 0;

            var total = 0;
            var count = 0;

            product.ProductReviews.forEach(function (review) {
                if (review.Rating) {
                    total += parseFloat(review.Rating);
                    count++;
                }
            });

            //   console.log(count > 0 ? (total / count).toFixed(1) : 0);

            return count > 0 ? (total / count).toFixed(1) : 0;
        };

        $scope.isDiscountActive = function (discount) {
            if (!discount || !discount.StartDate || !discount.EndDate) return false;

            var now = new Date();
            var start = new Date(discount.StartDate);
            var end = new Date(discount.EndDate);

            return now >= start && now <= end;
        };

        $scope.showFilters = true;
    }

    var payload = {};

    // Fix: The function name in HTML was different from what was defined
    $scope.onCategorySelectorDirectiveReady = function (api) {
        console.log("directive ready");
        categoryItemAPI = api;
        categoryItemReadyDeferred.resolve();
     //   $scope.filters.CategoryId = api.getData();
    };

    $scope.changeMainImage = function (event, product) {
        event.stopPropagation();
        const thumbnails = event.currentTarget.parentElement.querySelectorAll('.thumbnail');
        const mainImage = event.currentTarget.parentElement.previousElementSibling;

        // Update active class on thumbnails
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        event.currentTarget.classList.add('active');

        // Change main image
        const newSrc = event.currentTarget.getAttribute('src');
        mainImage.setAttribute('src', newSrc);
    };

    $scope.calculateDiscountedPrice = function (product) {
        console.log(product);

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
    };


    $scope.isFilterCollapsed = true;
    $scope.toggleFilterCollapse = function () {
        $scope.isFilterCollapsed = !$scope.isFilterCollapsed;

    };
    $scope.resetFilters = function () {
        $scope.filters = {
            Name: '',
          //  CategoryId: null,
            MinPrice: null,
            MaxPrice: null,
            // Stock Status updated for a single selection (null = no filter)
            StockStatus: null,  // null means no filter, 1 means 'in stock', 0 means 'low stock', -1 means 'out of stock'

            // Discount Status: 'all', 'discounted', 'nonDiscounted'
            DiscountStatus: null,  // 'all', 'discounted', 'nonDiscounted'

            // Active Status: 'all', 'active', 'inactive'
            IsActive: null  // 'all', 'active', 'inactive'
        };
        var payload = {};
        payload.selectedCategory = null;
        categoryItemAPI.load(payload);
    };

    $scope.applyFilters = function () {
        $scope.currentPage = 1;
        loadProducts();
        $scope.isFilterCollapsed = true;
    }

    $scope.getActiveFilterCount = function () {
        var count = 0;

        // Name filter
        if ($scope.filters.Name && $scope.filters.Name.trim() !== '') {
            count++;
        }


        if (categoryItemAPI && categoryItemAPI.getData() !== '' && categoryItemAPI.getData() !== undefined && categoryItemAPI.getData() !== null) {
            console.log(categoryItemAPI.getData());
            count++;
        }

        // Price range
        if ($scope.filters.MinPrice || $scope.filters.MaxPrice) {
            count++;
        }

        // Stock status
        if ($scope.filters.StockStatus !== null) {
            count++;
        }

        // Discount status
        if ($scope.filters.DiscountStatus !== null) {
            count++;
        }

        // Active status
        if ($scope.filters.IsActive !== null) {
            count++;
        }

        return count;
    };

    $scope.getCartQuantity = function (productId) {
        return $scope.cart.getQuantity(productId);
    };

    $scope.onCSC = function (value) {
        console.log(value);
    }
    $scope.decrementQuantity = function (product) {
        if (product.selectedQuantity > 1) {
            product.selectedQuantity--;
        }
    };

    $scope.incrementQuantity = function (product) {
        if (product.selectedQuantity < product.Quantity) {
            product.selectedQuantity++;
        }
    };

    $scope.validateQuantity = function (product) {
        if (product.selectedQuantity < 1) {
            product.selectedQuantity = 1;
        }
        if (product.selectedQuantity > product.Quantity) {
            product.selectedQuantity = product.Quantity;
        }
    };

    $scope.openAuthenticationForm = function () {
        ModalService.openModal('/MyModals/authModal.html', AuthenticationController, null, 'xl', function (result) {

         });
    }

    $scope.login = function () {
        ModalService.openModal('/MyModals/authModal.html', AuthenticationController, null, 'xl', function (result) {

        });
    };

    $scope.logout = function () {
        console.log("Logout clicked");
        AuthenticationService.logout();
    }
    $scope.addToCart = function (product) {
        if (window.userIsLoggedIn) {
            const discountedPrice = $scope.calculateDiscountedPrice(product);
            const quantityToAdd = product.selectedQuantity || 1;
            CartService.getCart($scope.userId).then(function (cart) {

                const existing = cart.find(i => i.ProductId === product.ProductId);
                const currentQuantity = existing ? existing.Quantity : 0;
                const availableQuantity = product.Quantity;

                if (currentQuantity + quantityToAdd > availableQuantity) {
                    //  ModalService.showMessage("Cannot add more than available stock.");
                    return;
                }

                const item = {
                    ProductId: product.ProductId,
                    Name: product.Name,
                    Price: discountedPrice,
                    Quantity: quantityToAdd,
                    AvailableQuantity: product.Quantity,
                    Image: product.ProductImages[0].ImagePath
                };

                CartService.addItem($scope.userId, item);
                getCartCount().then(function (result) {
                    $scope.cartCount = result;
                });
            });
        } else {
            ModalService.openModal('/MyModals/authModal.html', AuthenticationController, null, 'xl', function (result) {
                // Handle authentication result
            });
        }
    };





    // Count all items
    function getCartCount() {
        if (window.userIsLoggedIn) {
            return CartService.getCart($scope.userId).then(function (result) {
                console.log(result); // Log the cart for debugging
                const cart = result;
                // Sum the quantity of items in the cart and return the result
                return cart.reduce((sum, item) => sum + item.Quantity, 0);
            }).catch(function (error) {
                console.error("Error loading cart:", error);
                return 0; // Return 0 if there's an error
            });
        }
        return Promise.resolve(0); // Return a resolved promise with 0 if user is not logged in
    }


    $scope.viewCart = function () {
        if ($scope.userId) {
            var modalInstance = ModalService.openModal('../MyModals/cartModal.html', 'ShoppingCartController', {
                userId: $scope.userId
            });

            modalInstance.result.then(function (result) {

                getCartCount().then(function (count) {
                    $scope.cartCount = count;
                });
              //  console.log("Loading products");
              //  loadProducts(); // reloads product list
            }, function () {
                // Handle the case where the modal is dismissed
                getCartCount().then(function (count) {
                    $scope.cartCount = count;  // Update cart count after dismissing
                });
            });
            // Listen for order placed event and load products
            $rootScope.$on("orderPlaced", function () {
                loadProducts();
                getCartCount().then(function (count) {
                    $scope.cartCount = count;  // Update cart count after dismissing
                });
            });
        }
        else {
            $scope.openAuthenticationForm();
        }
    };




    function load() {

        loadAllControls();
        function loadAllControls() {
            loadCategorySelectorDirective();
        }


        function loadCategorySelectorDirective() {
            var payload = {};
            var loadDeferred = $q.defer();

            payload.selectedCategory = catId;
            categoryItemReadyDeferred.promise.then(function () {
                if (categoryItemAPI && categoryItemAPI.load) {
                    console.log("directive loaded with selected category : " + payload.selectedCategory);
                    categoryItemAPI.load(payload);
                }
            });
            return loadDeferred.promise;
        }
    }

    function loadProducts() {
        categoryId = categoryId ? categoryId : categoryItemAPI && categoryItemAPI.getData ? categoryItemAPI.getData() : null;
        var params = {
            Name: $scope.filters ? $scope.filters.Name : null,
            CategoryId: categoryId,
            MinPrice: $scope.filters.MinPrice || null,
            MaxPrice: $scope.filters.MaxPrice || null,
            // For IsActive: 1 -> true, 0 -> false, else null
            IsActive: true,
            // For StockStatus: 1 -> 'in stock', 0 -> 'low stock' (< 10), -1 -> 'out of stock', else null
            StockStatus: null,
            // For DiscountStatus: 1 -> true, 0 -> false, else null
            DiscountStatus: ($scope.filters.DiscountStatus === 1) ? true : ($scope.filters.DiscountStatus === 0 ? false : null)
        };
        categoryId = null;

        ProductWebApiService.getProducts(params)
            .then(function (data) {
                console.log(data);
                $scope.products = data;
                $scope.products.forEach(function (product) {
                    product.selectedQuantity = 1;
                });
                 totalItems = data.length;

                $scope.paginationData = PaginationService.getPages($scope.currentPage, totalItems);
                //     $scope.pages = $scope.paginationData.pages;
                ShowPage($scope.currentPage);
                $scope.isLoading = false;
            })
            .catch(function (error) {
                console.error('Error fetching universities:', error);
            });
    }

    function ShowPage(pageNumber) {
        $scope.currentPage = pageNumber;
        var data = PaginationService.setPage(pageNumber, $scope.products , pageSize);
        $scope.currentProducts = data.dataArray;
        $scope.LastPage = data.totalPages;
        $scope.pages = PaginationService.getPages($scope.currentPage, totalItems, pageSize);
    }

    function openQuickView(product) {
        console.log("Trying to open Quick View Modal:", product);

        if (!product) {
            console.error("No product provided!");
            return;
        }

        var parameters = { product };
        ModalService.openModal('/MyModals/quickViewModal.html', 'ProductQuickViewController', parameters,'lg', function (result) {
            console.log("Modal opened successfully", result);
        });
    }

    $scope.openReviewModal = function (product) {
        if ($scope.userId) { 
        var parameters = {
            product: product,
            userId: $scope.userId
        };
        ShopService.addReview(parameters, function (result) {
            if (result) {
                loadProducts();
            }
        });
        } else {
            $scope.openAuthenticationForm();
        }
    }

    $scope.showReview = function (productId) {
        var parameters = {};
        parameters.ProductId = productId;
        parameters.userId = $scope.userId;
        ModalService.openModal('/MyModals/getReviewsModal.html', 'GetReviewController', parameters,'lg', function (result) {
        });
    }

}

// Define the module first
angular.module('Ecommerce', ['ui.bootstrap'])
    .controller("ShopPageController", ShopPageController);