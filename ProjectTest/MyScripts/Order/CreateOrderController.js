"use strict";

CreateOrderController.$inject = ["$scope",'$uibModalInstance', 'ModalService', 'PaginationService', '$q', 'ShopService', 'AuthenticationService', 'ProductWebApiService'];

function CreateOrderController($scope, $uibModalInstance, ModalService, PaginationService, $q, ShopService, AuthenticationService, ProductWebApiService) {


    var totalItems;
    var categoryItemAPI;
    var categoryItemReadyDeferred = $q.defer();
    defineScope();
    loadData();
    load();
    function defineScope() {
        $scope.categories = [];
        $scope.pages = [];
        $scope.currentPage = 1;
        $scope.pageSize = 3;

        $scope.LastPage = 0;
        // $scope.openDrillDowns = [];

      //  $scope.loadCategories = loadCategories;
        $scope.updatePagination = updatePagination;
        $scope.showPage = ShowPage;
        $scope.search = search;

        $scope.order = {
            customerName: '',
            phoneNumber: '',
            address: '',
            shipping: 0.00,
            items: []
        };

        $scope.onCategorySelectorDirectiveReady = function (api) {
            categoryItemAPI = api;
            categoryItemReadyDeferred.resolve();
        };

        $scope.login = function () {
            ModalService.openModal('../MyModals/authModal.html', AuthenticationController, null, 'sm', function (result) {

            });
        };

        $scope.logout = function () {
            console.log("Logout clicked");
            AuthenticationService.logout();
        }

    }

    function load() {
        loadCategorySelectorDirective();
        function loadCategorySelectorDirective() {
            var payload = {};
            var loadDeferred = $q.defer();
            categoryItemReadyDeferred.promise.then(function () {
                if (categoryItemAPI && categoryItemAPI.load) {
                    categoryItemAPI.load(payload);
                }
            });
            return loadDeferred.promise;
        }
    }

    function loadData() {
        loadProducts();
    }

    function updatePagination() {

        $scope.paginationData = PaginationService.getPages($scope.currentPage, $scope.pageSize, totalItems);
        console.log($scope.paginationData);


        var startIndex = ($scope.currentPage - 1) * $scope.pageSize;
        var endIndex = startIndex + $scope.pageSize;

        var totalPages = Math.ceil(totalItems / $scope.pageSize);
        console.log(totalPages);

        $scope.currentCategories = $scope.categories.slice(startIndex, endIndex);
        // $scope.pages = $scope.paginationData.pages;
        $scope.LastPage = totalPages;

    }

    function ShowPage(pageNumber) {
        $scope.currentPage = pageNumber;
        var data = PaginationService.setPage(pageNumber, $scope.categories);
        $scope.currentCategories = data.dataArray;
        $scope.LastPage = data.totalPages;
        $scope.pages = PaginationService.getPages($scope.currentPage, totalItems);
    }

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
    function loadProducts() {
        var params = {
            Name: $scope.productNameSearch,
            CategoryId: categoryItemAPI ? categoryItemAPI.getData() : null
        };

        ProductWebApiService.getProducts(params)
            .then(function (data) {
                $scope.products = data;
                totalItems = data.length;
                console.log(data);
                $scope.paginationData = PaginationService.getPages($scope.currentPage, totalItems);
                $scope.products.forEach(function (product) {
                    product.selectedQuantity = 0;
                    product.Price = $scope.calculateDiscountedPrice(product);
                });
                console.log($scope.pages);
                //  updatePagination();
            })
            .catch(function (error) {
                console.error('Error fetching universities:', error);
            });
    }

    $scope.increaseQuantity = function (product) {
        if (product.selectedQuantity < product.Quantity) {
            product.selectedQuantity++;
        }
    };

    $scope.decreaseQuantity = function (product) {
        if (product.selectedQuantity > 0) {
            product.selectedQuantity--;
        }
    };

    // Validate quantity doesn't exceed stock
    $scope.validateQuantity = function (product) {
        if (product.selectedQuantity < 0 || isNaN(product.selectedQuantity)) {
            product.selectedQuantity = 0;
        } else if (product.selectedQuantity > product.Quantity) {
            product.selectedQuantity = product.Quantity;
        }
    };

    $scope.addToOrder = function (product) {
        console.log(product);
        if (product.selectedQuantity <= 0 || product.selectedQuantity > product.Quantity) return;

        // Check if product already exists in order
        var existingItem = $scope.order.items.find(function (item) {
            return item.ProductId === product.ProductId;
        });
        console.log(existingItem);
        if (existingItem) {
            // Update existing item quantity if it won't exceed stock
            var newTotalQuantity = existingItem.selectedQuantity + product.selectedQuantity;
            if (newTotalQuantity <= product.Quantity) {
                existingItem.selectedQuantity = newTotalQuantity;
            } else {
                existingItem.selectedQuantity = product.Quantity;
            }
        } else {
            console.log(product.selectedQuantity);
            // Add new item to order
            $scope.order.items.push({
                ProductId: product.ProductId,
                Name: product.Name,
                Price: product.Price,
                selectedQuantity: product.selectedQuantity,
                Quantity: product.Quantity
            });

        }

        // Reset quantity after adding
        product.selectedQuantity = 0;
    };
    
    // Remove item from order
    $scope.removeItem = function (item) {
        var index = $scope.order.items.indexOf(item);
        if (index !== -1) {
            $scope.order.items.splice(index, 1);
        }
    };

    // Calculate subtotal
    $scope.calculateSubtotal = function () {
        return $scope.order.items.reduce(function (total, item) {
            return total + (item.Price * item.selectedQuantity);
        }, 0);
    };

    // Calculate total with shipping
    $scope.calculateTotal = function () {
        return $scope.calculateSubtotal() + ($scope.order.shipping || 0);
    };

    $scope.saveOrder = function () {
        console.log($scope.order);
        const transformedItems = $scope.order.items.map(function (item) {
            return {
                ProductId: item.ProductId,
                Name: item.Name,
                Price: item.Price,
                AvailableQuantity: item.Quantity,
                Quantity: item.selectedQuantity,
                // Add other properties you want to keep from the item, if needed
            };
        });

        $scope.parameters.order = {
            UserId: null,
            PhoneNumber: $scope.order.phoneNumber,
            City: null,
            Address: null,
            PaymentMethod: 'cash',
            TotalPrice: $scope.calculateTotal(),
            CustomerName: $scope.order.customerName,
            OrderItems: transformedItems
        };

        ShopService.placeOrder($scope.parameters);
        $uibModalInstance.close("success");

        console.log('Placing order with data:', $scope.parameters.order);
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    }

    function search() {
        loadProducts();
    }

  


}


angular.module('Ecommerce', ['ui.bootstrap'])
    .controller("CreateOrderController", CreateOrderController);