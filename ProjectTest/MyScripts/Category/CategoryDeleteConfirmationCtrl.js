'use strict';

CategoryDeleteConfirmationCtrl.$inject = ['$scope', '$uibModalInstance', 'CategoryWebApiService', '$q', '$timeout'];

function CategoryDeleteConfirmationCtrl($scope, $uibModalInstance, CategoryWebApiService, $q, $timeout) {
    var categoryId;
    var category;
    var file;
    console.log($scope.parameters);
    var CategoryAttributeGridApi;
    var CategoryAttributeGridDeferred = $q.defer();
    //  console.log($scope.parameters.universityId);

    defineScope();
    loadParameters();
    load();



    function defineScope() {
        $scope.scopeModel = {};

        $scope.scopeModel.toEdit = $scope.parameters.categoryId ? true : false;
        $scope.scopeModel.modalTitle = $scope.parameters.categoryId ? 'Edit Category' : 'Add Category';
        $scope.Delete = Delete;
        $scope.scopeModel.cancel = cancel;

     

    }
    function load() {

    }



    function loadParameters() {
        categoryId = $scope.parameters.categoryId;
    }


    function Delete() {
        $uibModalInstance.close(true);
    }




    function cancel() {
        console.log("cancel");
        $uibModalInstance.dismiss('cancel');
    }

    
}

angular.module('Ecommerce')
    .controller("CategoryDeleteConfirmationCtrl", CategoryDeleteConfirmationCtrl);
