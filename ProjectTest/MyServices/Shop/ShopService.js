angular.module('Ecommerce')
    .service('ShopService', ['ModalService', '$http', 'WebApiService', function (ModalService, $http, WebApiService) {

        var baseUrl = 'https://localhost:44343/shop/';
        this.placeOrder = function (parameters, callback) {
            var url = baseUrl + 'PlaceOrder';
            return WebApiService.post(url, parameters.order)
                 .then(function (response) {
                     // console.log('department added successfully:', response.data);
                     if (callback) {
                         callback(true);
                     }
                 })
            .catch(function (error) {
                console.error('Error adding order:', error);
                if (callback) {
                    callback(false);
                }
            });
            
        }

        this.addReview = function (parameters, callback) {
            ModalService.openModal('../MyModals/addReviewModal.html', 'ReviewController', parameters,'lg', function (result) {
                if (result) {
                    var url = baseUrl + 'SubmitReview';
                    return WebApiService.post(url, parameters.review)
                        .then(function (response) {
                            // console.log('department added successfully:', response.data);
                            if (callback) {
                                callback(true);
                            }
                        })
                        .catch(function (error) {
                            console.error('Error adding review:', error);
                            if (callback) {
                                callback(false);
                            }
                        });
                }
            });
        }

        this.updateOrder = function (parameters,callback) {
            var url = baseUrl + 'UpdateOrder';
            console.log(parameters);
            return WebApiService.post(url, parameters)
                .then(function (response) {
                    // console.log('department added successfully:', response.data);
                    if (callback) {
                        callback(true);
                    }
                })
                .catch(function (error) {
                    console.error('Error updating order:', error);
                    if (callback) {
                        callback(false);
                    }
                });
        }

    }]);
