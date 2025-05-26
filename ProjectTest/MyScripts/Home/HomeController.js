"use strict";

HomeController.$inject = ["$scope", 'ModalService', 'PaginationService', '$q', 'CategoryWebApiService', 'AuthenticationService', '$window'];

function HomeController($scope, ModalService, PaginationService, $q, CategoryWebApiService, AuthenticationService, $window) {


    var totalItems;
    defineScope();
    loadData();
    function defineScope() {
        $scope.categories = [];
        $scope.pages = [];
        $scope.currentPage = 1;
        $scope.pageSize = 3;

        $scope.LastPage = 0;
        // $scope.openDrillDowns = [];

        $scope.loadCategories = loadCategories;
        $scope.updatePagination = updatePagination;
        $scope.showPage = ShowPage;
        $scope.Search = Search;
       

       
        $scope.logout = function () {
            console.log("Logout clicked");
            AuthenticationService.logout();
        }

    }

    $scope.login = function () {
        ModalService.openModal('../MyModals/authModal.html', AuthenticationController, null, 'xl', function (result) {

        });
    };


    function loadData() {
        loadCategories();
    }

    function updatePagination() {

        $scope.paginationData = PaginationService.getPages($scope.currentPage, $scope.pageSize, totalItems);
        console.log($scope.paginationData);


        var startIndex = ($scope.currentPage - 1) * $scope.pageSize;
        var endIndex = startIndex + $scope.pageSize;

        var totalPages = Math.ceil(totalItems / $scope.pageSize);
        console.log(totalPages);

        $scope.currentCategories = $scope.categories.slice(startIndex, endIndex);
        // $scope.pages = $scope.paginationData.pages;
        $scope.LastPage = totalPages;

    }

    function ShowPage(pageNumber) {
        $scope.currentPage = pageNumber;
        var data = PaginationService.setPage(pageNumber, $scope.categories);
        $scope.currentCategories = data.dataArray;
        $scope.LastPage = data.totalPages;
        $scope.pages = PaginationService.getPages($scope.currentPage, totalItems);
    }

    function loadCategories() {
        var params = {
            Name: $scope.searchTerm,
        };

        CategoryWebApiService.getCategories(params)
            .then(function (data) {
                $scope.categories = data;
                totalItems = data.length;

                $scope.paginationData = PaginationService.getPages($scope.currentPage, totalItems);
                //     $scope.pages = $scope.paginationData.pages;
              //  ShowPage($scope.currentPage);
              //  console.log($scope.categories);
                console.log($scope.pages);
              //  updatePagination();
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

    $scope.discoverProducts = function (id) {
        if (id) {
            $window.location.href = '/CarShop/ShopPage/' + id;
        } else {
            $window.location.href = '/CarShop/Index';
        }
    }
   

}

angular.module('Ecommerce', ['ui.bootstrap'])
    .controller("HomeController", HomeController);