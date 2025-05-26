"use strict";

// Then define the controller
ProductManagementController.$inject = ["$scope", '$q','ProductService','ProductWebApiService','PaginationService','ModalService','AuthenticationService'];

function ProductManagementController($scope, $q, ProductService, ProductWebApiService, PaginationService, ModalService, AuthenticationService) {
    var categoryItemAPI;
    var categoryItemReadyDeferred = $q.defer();
    var categoryItemAPI;
    var categoryItemReadyDeferred = $q.defer();
    var totalItems;
    var pageSize = 6;
    defineScope();
    loadProducts();
    load();



    function defineScope() {
        $scope.isLoading = true;
        $scope.currentPage = 1;
        $scope.showPage = ShowPage;
        // Initialize filters
        $scope.filters = {
            Name: '',
            CategoryId: null,
            MinPrice: null,
            MaxPrice: null,
            // Stock Status updated for a single selection (null = no filter)
            StockStatus: null,  // null means no filter, 1 means 'in stock', 0 means 'low stock', -1 means 'out of stock'

            // Discount Status: 'all', 'discounted', 'nonDiscounted'
            DiscountStatus: null,  // 'all', 'discounted', 'nonDiscounted'

            // Active Status: 'all', 'active', 'inactive'
            IsActive: null  // 'all', 'active', 'inactive'
        };

        console.log(window.userIsLoggedIn);
        $scope.addProduct = addProduct;
        $scope.editProduct = editProduct;
        $scope.openQuickView = openQuickView;

        $scope.onCategorySelectorDirectiveReady = function (api) {
            categoryItemAPI = api;
            categoryItemReadyDeferred.resolve();
        };

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

    

    $scope.logout = function () {
        console.log("Logout clicked");
        AuthenticationService.logout();
    }

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
        if (product && product.Discount && product.Price != null) {
            var discountedPrice = product.Price;

            if (product.Discount.DiscountType === 1) {
                // Discount Type 1 is a fixed amount ($)
                discountedPrice = discountedPrice - product.Discount.DiscountValue;
            } else if (product.Discount.DiscountType === 2) {
                // Discount Type 2 is a percentage (%)
                discountedPrice = discountedPrice * (1 - (product.Discount.DiscountValue / 100));
            }

            // Ensure the price doesn't go below zero
            return discountedPrice > 0 ? discountedPrice : 0;
        }
        return product.Price; // If no discount, return the original price
    };

   

    $scope.isFilterCollapsed = true;
    $scope.toggleFilterCollapse = function () {
        $scope.isFilterCollapsed = !$scope.isFilterCollapsed;

        // If you need to manually trigger the collapse (optional)
        // $('#filterCollapse').collapse('toggle');
    };
    $scope.resetFilters = function () {
        $scope.filters = {
            Name: '',
            CategoryId: null,
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
        categoryItemAPI.load(payload);
    };

    $scope.applyFilters = function () {
        loadProducts();
        $scope.currentPage = 1;
        $scope.isFilterCollapsed = true;
    }

    $scope.getActiveFilterCount = function () {
        var count = 0;

        // Name filter
        if ($scope.filters.Name && $scope.filters.Name.trim() !== '') {
            count++;
        }


        if (categoryItemAPI && categoryItemAPI.getData() !== undefined) {
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

    function load() {

        loadAllControls();
        function loadAllControls() {
            loadCategorySelectorDirective();
        }


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

    function loadProducts() {
        console.log($scope.filters);
        var categoryId = categoryItemAPI && categoryItemAPI.getData ? categoryItemAPI.getData() : null;

        var params = {
            Name: $scope.filters ? $scope.filters.Name : null,
            CategoryId: categoryId,
            MinPrice: $scope.filters.MinPrice || null,
            MaxPrice: $scope.filters.MaxPrice || null,
            // For IsActive: 1 -> true, 0 -> false, else null
            IsActive: ($scope.filters.IsActive === 1) ? true : ($scope.filters.IsActive === 0 ? false : null),
            // For StockStatus: 1 -> 'in stock', 0 -> 'low stock' (< 10), -1 -> 'out of stock', else null
            StockStatus: ($scope.filters.StockStatus === 1 || $scope.filters.StockStatus === 0 || $scope.filters.StockStatus === -1) ? $scope.filters.StockStatus : null,
            // For DiscountStatus: 1 -> true, 0 -> false, else null
            DiscountStatus: ($scope.filters.DiscountStatus === 1) ? true : ($scope.filters.DiscountStatus === 0 ? false : null)
        };



        console.log(params);
        ProductWebApiService.getProducts(params)
            .then(function (data) {
                console.log(data);
                $scope.products = data;
                totalItems = data.length;

                $scope.paginationData = PaginationService.getPages($scope.currentPage, totalItems, pageSize);
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
        var data = PaginationService.setPage(pageNumber, $scope.products, pageSize);
        $scope.currentProducts = data.dataArray;
        $scope.LastPage = data.totalPages;
        $scope.pages = PaginationService.getPages($scope.currentPage, totalItems, pageSize);
    }

    function addProduct() {
        ProductService.addProduct(null, function (result) {
            if (result) {
                loadProducts(); // ✅ this will now be called correctly
            }
        });
    }


    function editProduct(productId) {
        ProductService.editProduct(productId, function (result) {
            if (result) {
                loadProducts();
            }
        });
    }

    function openQuickView(product) {
        console.log("Trying to open Quick View Modal:", product);

        if (!product) {
            console.error("No product provided!");
            return;
        }

        var parameters = { product };
        ModalService.openModal('../MyModals/quickViewModal.html', 'ProductQuickViewController', parameters,'lg', function (result) {
            console.log("Modal opened successfully", result);
        });
    }
    $scope.showDeleteConfirmation = null;

    $scope.confirmDelete = function (productId) {
        $scope.showDeleteConfirmation = productId;
    };

    $scope.cancelDelete = function () {
        $scope.showDeleteConfirmation = null;
    };

    $scope.deleteProduct = function (productId) {
        // Your delete logic here
        ProductService.deleteProduct(productId).then(function () {
            // On success
            $scope.showDeleteConfirmation = null;
            loadProducts();
            // Refresh products or remove from array
        }).catch(function (error) {
            // Handle error
        });
    };

   
}

// Define the module first
angular.module('Ecommerce', ['ui.bootstrap'])
    .controller("ProductManagementController", ProductManagementController);