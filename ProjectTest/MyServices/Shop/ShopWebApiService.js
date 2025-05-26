angular.module('Ecommerce')
    .service('ShopWebApiService', ['ModalService', '$http', 'WebApiService', function (ModalService, $http, WebApiService) {

        var baseUrl = 'https://localhost:44343/shop/';
        
        this.getReview = function (params) {
            var url = baseUrl + 'getReview';
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error fetching reviews:', error);
                });
        };

        this.getProductReviews = function (params) {
            var url = baseUrl + 'GetProductReviews/'+params;
            console.log(url + '/' + params);
            return WebApiService.get(url)
                .then(function (response) {
                     console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error fetching reviews:', error);
                });
        };


        this.getAllOrders = function (params) {
            var url = baseUrl + 'getAllOrders';
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error fetching orders:', error);
                });
        };

        this.getMyOrders = function (params) {
            var url = baseUrl + 'getMyOrders';
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error fetching orders:', error);
                });
        }
    }]);
