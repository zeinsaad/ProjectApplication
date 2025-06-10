"use strict";

CategoryManagementController.$inject = ["$scope", 'CategoryService', 'PaginationService', '$q', 'CategoryWebApiService', 'ModalService','AuthenticationService'];

function CategoryManagementController($scope, CategoryService, PaginationService, $q, CategoryWebApiService, ModalService, AuthenticationService) {
   

    var totalItems;
    defineScope();
    loadData();
    function defineScope() {
        $scope.categories = [];
        $scope.pages = [];
        $scope.currentPage = 1;
        $scope.pageSize = 6;
        $scope.isLoading = true;
        $scope.LastPage = 0;
        // $scope.openDrillDowns = [];

        $scope.loadCategories = loadCategories;
       // $scope.updatePagination = updatePagination;
        $scope.showPage = ShowPage;
        $scope.Search = Search;
        $scope.addCategory = addCategory;
        $scope.editCategory = editCategory;

      

        $scope.login = function () {
            ModalService.openModal('../MyModals/authModal.html', AuthenticationController, null, 'sm', function (result) {

            });
        };

        $scope.logout = function () {
            console.log("Logout clicked");
            AuthenticationService.logout();
        }

    }  
    

    function loadData() {
        loadCategories();
        console.log($scope.categories.length);
    }

   /* function updatePagination() {

        $scope.paginationData = PaginationService.getPages($scope.currentPage, totalItems, $scope.pageSize);
        console.log($scope.paginationData);
   

        var startIndex = ($scope.currentPage - 1) * $scope.pageSize;
        var endIndex = startIndex + $scope.pageSize;

        var totalPages = Math.ceil(totalItems / $scope.pageSize);
        console.log(totalPages);

        $scope.currentCategories = $scope.categories.slice(startIndex, endIndex);
       // $scope.pages = $scope.paginationData.pages;
        $scope.LastPage = totalPages;

    } */

    function ShowPage(pageNumber) {
        $scope.currentPage = pageNumber;
        var data = PaginationService.setPage(pageNumber, $scope.categories, $scope.pageSize);
        $scope.currentCategories = data.dataArray;
        $scope.LastPage = data.totalPages;
        $scope.pages = PaginationService.getPages($scope.currentPage, totalItems, $scope.pageSize);
    }

    function loadCategories() {
        var params = {
            Name: $scope.searchTerm,
        };

        CategoryWebApiService.getCategories(params)
            .then(function (data) {
                $scope.categories = data;
                totalItems = data.length;
                $scope.paginationData = PaginationService.getPages($scope.currentPage, totalItems, $scope.pageSize);
                //     $scope.pages = $scope.paginationData.pages;
                ShowPage($scope.currentPage);
                $scope.isLoading = false;
            })
            .catch(function (error) {
                console.error('Error fetching universities:', error);
            });
    }


    function Search(name) {
        $scope.currentName = name;
        $scope.currentPage = 1;
        loadCategories();
    }

    function addCategory() {
        CategoryService.addCategory(function (result) {
            if (result) {
                loadCategories();
                updatePagination();
            }
        });
    }



    function editCategory(categoryId) {
        CategoryService.editCategory(categoryId, function (result) {
            if (result) {
                loadCategories();
            }
        });
    }

    $scope.showDeleteConfirmation = null;

    $scope.confirmDelete = function (productId) {
        $scope.showDeleteConfirmation = productId;
    };

    $scope.cancelDelete = function () {
        $scope.showDeleteConfirmation = null;
    };

    $scope.deleteCategory = function (categoryId) {
        // Your delete logic here
        CategoryService.deleteCategory(categoryId, function (result) {
            if (result) {
                // On success
                $scope.showDeleteConfirmation = null;
                $scope.currentPage = 1;
                loadCategories();
                // Refresh products or remove from array
            }
        }).catch(function (error) {
            // Handle error
        });
    };

}

angular.module('Ecommerce', ['ui.bootstrap'])
    .controller("CategoryManagementController", CategoryManagementController);