"use strict";

ReviewController.$inject = ['$scope', '$uibModalInstance', '$q', 'ShopService', 'ShopWebApiService', 'PaginationService', 'ModalService'];

function ReviewController($scope, $uibModalInstance, $q, ShopService, ShopWebApiService, PaginationService, ModalService) {
    $scope.currentImageIndex = 0;
    getReviewIfExist();
    console.log($scope.parameters);

   
    $scope.product = $scope.parameters.product;

    function getReviewIfExist() {
        var parameters = {
            UserId: $scope.parameters.userId,
            ProductId: $scope.parameters.product.ProductId
        };

        ShopWebApiService.getReview(parameters).then(function (result) {
            if (result) {
                $scope.rating = result.Rating;
                $scope.comment = result.Comment;
            }
        });
    }


    $scope.hoverRating = null;

    $scope.setHoverRating = function (rating) {
        $scope.hoverRating = rating;
    };

    $scope.clearHoverRating = function () {
        $scope.hoverRating = null;
    };

    // Set rating function - called when user clicks a star
    $scope.setRating = function (rating) {
        $scope.rating = rating;
    };


    console.log($scope.parameters);

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.save = function () {
        if (!$scope.parameters.review) {
            $scope.parameters.review = {};
        }

        $scope.parameters.review.UserId = $scope.parameters.userId;
        $scope.parameters.review.ProductId = $scope.parameters.product.ProductId;
        $scope.parameters.review.Rating = $scope.rating;
        $scope.parameters.review.Comment = $scope.comment;

        console.log($scope.parameters);

        $uibModalInstance.close($scope.parameters);
    }

}

// Use `.module('Ecommerce')` instead of redefining it
angular.module('Ecommerce')
    .controller("ReviewController", ReviewController);
