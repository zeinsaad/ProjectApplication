angular.module('Ecommerce')
    .service('ProductService', ['ModalService', '$http', 'WebApiService', function (ModalService, $http, WebApiService) {

        var baseUrl = 'https://localhost:44343/product/';
        this.addProduct = function (parameters, callback) {
           
            ModalService.openModal('../MyModals/productEditor.html', 'ProductEditorController', parameters,'lg', function (result) {
                if (result) {
                    console.log(result.product);
                    var url = baseUrl + 'AddProduct';
                    return WebApiService.post(url, result.product)
                        .then(function (response) {
                           // console.log('department added successfully:', response.data);
                            if (callback) {
                                callback(true);
                            }
                        })
                        .catch(function (error) {
                            console.error('Error adding product:', error);
                            if (callback) {
                                callback(false);
                            }
                        });
                }
            });
        };


        this.editProduct = function (productId, callback) {

            var parameters = {
                productId
            };


            ModalService.openModal('../MyModals/productEditor.html', 'ProductEditorController', parameters,'lg', function (result) {
                if (result) {
                    var url = baseUrl + 'EditProduct/' + productId;

                    return WebApiService.post(url, result.product)
                        .then(function (response) {
                            if (callback) callback(true);
                        })
                        .catch(function (error) {
                            console.error('Error updating product:', error);
                            if (callback) callback(false);
                        });
                }
            });
        };

        this.deleteProduct = function (productId, callback) {
            var url = baseUrl + 'deleteProduct/' + productId;

            // Use WebApiService to make the delete request
            return WebApiService.post(url)
                .then(function (response) {
                    // On success, return true to the callback
                    console.log('Product deleted successfully');
                    if (callback) {
                        callback(true);
                    }
                })
                .catch(function (error) {
                    // On error, log and return false to the callback
                    console.error('Error deleting product:', error);
                    if (callback) {
                        callback(false);
                    }
                });
        };



    }]);
