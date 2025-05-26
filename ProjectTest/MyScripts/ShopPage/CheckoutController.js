
angular.module('Ecommerce')
    .controller('CheckoutController', ['$scope', 'ShopService', '$uibModalInstance', 'ModalService', 'CartService', 'AuthenticationService', '$rootScope',
        function ($scope, ShopService, $uibModalInstance, ModalService, CartService, AuthenticationService, $rootScope) {

            var userId = $scope.parameters.userId;
        AuthenticationService.getUserById(userId).then(function (data) {
            console.log(data);
            $scope.checkoutData.fullName = data.FullName;
            $scope.checkoutData.phone = data.PhoneNumber;
        })

        $scope.parameters = {};

        CartService.getCart(userId).then(function (cart) {
            $scope.cart = cart;  // Update the cart once the promise resolves  // Check quantities after loading the cart
        });

        CartService.getTotal(userId).then(function (total) {
            $scope.subtotal = total;  // Update the total once the promise resolves
            $scope.deliveryFee = 10.00;
            $scope.total = $scope.subtotal + $scope.deliveryFee;
        });
        $scope.deliveryFee = 10.00;
        $scope.total = $scope.subtotal + $scope.deliveryFee;

        $scope.checkoutData = {
            paymentMethod: 'cash' // Default to cash on delivery
        };


    $scope.orderId = Math.floor(Math.random() * 10000); // Generate random order ID

    // Close checkout modal
    $scope.closeCheckout = function() {
        $uibModalInstance.dismiss('cancel');
        var parameters = {
            userId: userId,
        };
        ModalService.openModal('../MyModals/cartModal.html', 'ShoppingCartController', parameters, function (result) {

        });
    };

    // Validate form
    $scope.checkoutFormValid = function() {
            return $scope.checkoutData.fullName &&
    $scope.checkoutData.phone &&
    $scope.checkoutData.address1 &&
    $scope.checkoutData.city &&
    $scope.checkoutData.area;
        };

    // Place order
        $scope.placeOrder = function () {
            $scope.parameters.order = {
                UserId: userId,
                PhoneNumber: $scope.checkoutData.phone,
                City: $scope.checkoutData.city,
                Address: $scope.checkoutData.address,
                PaymentMethod: $scope.checkoutData.paymentMethod,
                TotalPrice: $scope.total,
                CustomerName: $scope.checkoutData.fullName,
                OrderItems: $scope.cart
            };

            ShopService.placeOrder($scope.parameters).then(function () {
                console.log('Placing order with data:', $scope.parameters.order);
                CartService.clearCart(userId);
                $uibModalInstance.close();
                $rootScope.$emit("orderPlaced");

            });
            
        };

    }]);
