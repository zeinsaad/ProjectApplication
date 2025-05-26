angular.module('Ecommerce')
    .service('CategoryWebApiService', ['WebApiService', function (WebApiService) {

        var baseUrl = 'https://localhost:44343/category/';


        this.getCategories = function (params) {
            var url = baseUrl + 'getCategories';
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error fetching categories:', error);
                });
        };

        this.getCategoriesInfo = function (params) {
            var url = baseUrl + 'getCategoriesInfo';
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error fetching categories:', error);
                });
        };

        this.getCategoryById = function (params) {
            var url = baseUrl + 'getCategoryById/' + params;
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error getting category:', error);
                });
        };
        this.getCategoryAttributes = function (params) {
            var url = baseUrl + 'getCategoriesAttributes/' + params;
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error getting category attribute:', error);
                });
        };

        this.getCategoryAttributesById = function (params) {
            var url = baseUrl + 'getCategoryAttributesById/' + params;
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error getting category attribute:', error);
                });
        };

        this.getSalesByCategories = function (params) {
            var url = baseUrl + 'getSalesByCategories';
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error getting category sales:', error);
                });
        };



    }]);
