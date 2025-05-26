"use strict";

ShoppingCartController.$inject = ['$scope', '$uibModalInstance', '$q', 'CartService', 'ProductWebApiService', 'PaginationService', 'ModalService'];

function ShoppingCartController($scope, $uibModalInstance, $q, CartService, ProductWebApiService, PaginationService, ModalService) {

    var userId = $scope.parameters.userId || 'guest';

    // Initialize and load cart
    CartService.initCart(userId);
    CartService.getCart(userId).then(function (cart) {
        $scope.cart = cart;  // Update the cart once the promise resolves
        checkCartQuantities();  // Check quantities after loading the cart
    });

    CartService.getTotal(userId).then(function (total) {
        $scope.total = total;  // Update the total once the promise resolves
    });

    console.log($scope.cart);

    // Function to check if any item's quantity exceeds available quantity
    function checkCartQuantities() {
        $scope.isSaveDisabled = $scope.cart.some(function (item) {
            if (item.Quantity > item.AvailableQuantity) {
                $scope.saveMessage = "Some items in your cart have quantities exceeding available stock.";
                return true;  // Return true to disable save button
            }
            return false;
        });

        if (!$scope.isSaveDisabled) {
            $scope.saveMessage = ''; // Clear message if all quantities are valid
        }
    }

    // Function to remove an item from the cart
    $scope.remove = function (itemId) {
        CartService.removeItem(userId, itemId);
        CartService.getCart(userId).then(function (cart) {
            $scope.cart = cart;  // Update the cart once the promise resolves
            checkCartQuantities();  // Recheck quantities after removal
        });

        CartService.getTotal(userId).then(function (total) {
            $scope.total = total;  // Update the total once the promise resolves
        });
    };

    // Decrement quantity
    $scope.decrementQuantity = function (product) {
        var existing = $scope.cart.find(i => i.ProductId === product.ProductId);
        if (existing) {
            if (existing.Quantity > 1) { // Ensure the quantity doesn't go below 1
                existing.Quantity--;
                CartService.saveCart(userId);
                CartService.getTotal(userId).then(function (total) {
                    $scope.total = total;  // Update the total once the promise resolves
                });
                checkCartQuantities();  // Recheck quantities after decrement
            }
        }
    };

    // Increment quantity
    $scope.incrementQuantity = function (product) {
        var existing = $scope.cart.find(i => i.ProductId === product.ProductId);
        if (existing) {
            // Ensure the quantity doesn't exceed the available stock
            if (existing.Quantity < existing.AvailableQuantity) {
                existing.Quantity++;
                CartService.saveCart(userId);
                CartService.getTotal(userId).then(function (total) {
                    $scope.total = total;  // Update the total once the promise resolves
                });
                checkCartQuantities();  // Recheck quantities after increment
            }
        }
    };

    // Checkout action
    $scope.checkout = function () {
        var checkoutModalInstance = ModalService.openModal('../MyModals/checkoutModal.html', 'CheckoutController', {
            userId: userId
        });

     /*   checkoutModalInstance.result.then(function (checkoutResult) {
            // Forward the result to the parent (ShoppingPageCtrl)
            $uibModalInstance.close(checkoutResult);
        }); */
        $uibModalInstance.close();
    };

    // Close the cart modal
    $scope.closeCart = function () {
        $uibModalInstance.dismiss("cancel");
    }
}

// Use `.module('Ecommerce')` instead of redefining it
angular.module('Ecommerce')
    .controller("ShoppingCartController", ShoppingCartController);
