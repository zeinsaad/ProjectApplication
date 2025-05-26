"use strict";

GetReviewController.$inject = ['$scope', '$uibModalInstance', '$q', 'ShopService', 'ShopWebApiService', 'PaginationService', 'ModalService'];

function GetReviewController($scope, $uibModalInstance, $q, ShopService, ShopWebApiService, PaginationService, ModalService) {

    console.log($scope.parameters);
    var productId = $scope.parameters.ProductId;
    loadReviews();
    function loadReviews() {
        console.log(productId);
        ShopWebApiService.getProductReviews(productId).then(function (result) {
            if (result) {
                console.log(result);
                $scope.reviews = result;
            }
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }




}

// Use `.module('Ecommerce')` instead of redefining it
angular.module('Ecommerce')
    .controller("GetReviewController", GetReviewController);
