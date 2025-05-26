angular.module('Ecommerce')
    .service('ProductWebApiService', ['ModalService', '$http', 'WebApiService', function (ModalService, $http, WebApiService) {

        var baseUrl = 'https://localhost:44343/product/';


        this.getProducts = function (params) {
            var url = baseUrl + 'getProducts';
            //  console.log(params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error fetching products:', error);
                });
        };

        this.getProductById = function (params) {
            var url = baseUrl + 'getProductById/' + params;
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error getting product:', error);
                });
        };


        this.getProductById = function (id, params) {
            var url = baseUrl + 'GetProductById/' + id;
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error getting Product:', error);
                });
        }

        
        this.getSalesSummary = function (params) {
            var url = baseUrl + 'getSalesSummary' ;
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error getting :', error);
                });
        };

        this.getProductSalesReport = function (params) {
            var url = baseUrl + '/getProductSalesReport/' + params.TopN; // Using URL path instead of query string
            return WebApiService.get(url)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error getting product sales report:', error);
                });
        };

        this.getMonthlySalesRevenue = function (params) {
            var url = baseUrl + '/getMonthlySalesRevenue';
            return WebApiService.get(url)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error getting product sales report:', error);
                });
        };


    }]);
