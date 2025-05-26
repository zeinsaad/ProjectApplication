angular.module('Ecommerce')
    .service('CategoryService', ['ModalService', '$http', 'WebApiService', function (ModalService, $http, WebApiService) {

        var baseUrl = 'https://localhost:44343/category/';

        this.addCategory = function (callback) {
            ModalService.openModal('../MyModals/categoryEditor.html', 'CategoryEditorController', null,'lg', function (result) {
                if (result) {
                    var url = baseUrl + 'AddCategory';
                    return WebApiService.post(url, result.category)
                        .then(function (response) {
                            console.log('University added successfully:', response.data);
                            if (callback) {
                                callback(true);
                            }
                        })
                        .catch(function (error) {
                            console.error('Error adding category:', error);
                            if (callback) {
                                callback(false);
                            }
                        });
                }
            });
        };


       
        this.editCategory = function (categoryId, callback) {
            var parameters = {
                categoryId
            };
            ModalService.openModal('../MyModals/categoryEditor.html', 'CategoryEditorController', parameters,'lg', function (result) {
                if (result) {
 
                    var url = baseUrl + 'UpdateCategory/' + categoryId;

                    return WebApiService.post(url, result.category)
                        .then(function (response) {
                            if (callback) callback(true);
                        })
                        .catch(function (error) {
                            console.error('Error updating category:', error);
                            if (callback) callback(false);
                        });
                }
            });
        };

        this.deleteCategory = function (categoryId, callback) {

                    var url = baseUrl + 'deleteCategory/' + categoryId;

                    return WebApiService.post(url)
                        .then(function (response) {
                            if (callback) callback(true);
                        })
                        .catch(function (error) {
                            console.error('Error deleting category:', error);
                            if (callback) callback(false);
                        });
                
            
        };

       


    }]);
