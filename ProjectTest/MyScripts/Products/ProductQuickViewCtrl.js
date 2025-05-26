"use strict";

ProductQuickViewController.$inject = ['$scope','$uibModalInstance','$q', 'ProductService', 'ProductWebApiService', 'PaginationService', 'ModalService'];

function ProductQuickViewController($scope, $uibModalInstance , $q, ProductService, ProductWebApiService, PaginationService, ModalService) {
    $scope.currentImageIndex = 0;
    console.log($scope.parameters.product);
    // Function to change the current image
    $scope.changeModalImage = function (index) {
        console.log(index);
        $scope.currentImageIndex = index;
    };

    $scope.getAverageRating = function (product) {
        console.log(product);
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
        if (!discount || !discount.DiscountType) return false;

        var now = new Date();
        var startDate = new Date(discount.StartDate);
        var endDate = new Date(discount.EndDate);

        return now >= startDate && now <= endDate;
    };

    $scope.calculateDiscountedPrice = function (product) {
        if (!$scope.isDiscountActive(product.Discount)) return product.Price;

        if (product.Discount.DiscountType === 1) {
            // Fixed amount discount
            return product.Price - product.Discount.DiscountValue;
        } else {
            // Percentage discount
            return product.Price * (1 - (product.Discount.DiscountValue / 100));
        }
    };
    // Make sure parameters exist
    if (!$scope.parameters) {
        $scope.parameters = {};
    }

    // Make sure product exists
    if (!$scope.parameters.product) {
        $scope.parameters.product = {};
    }

    // Make sure ImageUrl exists and is an array
    if (!$scope.parameters.product.ImageUrl || !Array.isArray($scope.parameters.product.ImageUrl)) {
        $scope.parameters.product.ImageUrl = [];
    }

    console.log($scope.parameters);

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.isIsoDate = function (value) {
        // Regular expression to match ISO date format (YYYY-MM-DDTHH:mm:ss.sssZ)
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        return typeof value === 'string' && isoDateRegex.test(value);
    };




}

// Use `.module('Ecommerce')` instead of redefining it
angular.module('Ecommerce')
    .controller("ProductQuickViewController", ProductQuickViewController);
