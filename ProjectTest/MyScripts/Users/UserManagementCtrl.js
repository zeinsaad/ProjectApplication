"use strict";


UserManagementController.$inject = ["$scope", 'PaginationService', '$q','AuthenticationService'];

function UserManagementController($scope, PaginationService, $q, AuthenticationService) {

    defineScope();
    load();

    function defineScope() {
        $scope.searchUsers = searchUsers;
        $scope.isLoading = true;

        $scope.logout = function () {
            console.log("Logout clicked");
            AuthenticationService.logout();
        }

        $scope.promoteUser = function (userId) {
            var params = {
                userId: userId,
                newRole: 1
            };
            AuthenticationService.updateUserRole(params).then(function (result) {
                loadUsers();
            })
        };

        $scope.demoteUser = function (userId) {
            var params = {
                userId: userId,
                newRole: 0
            };
            AuthenticationService.updateUserRole(params).then(function (result) {
                loadUsers();
            });
        }

        $scope.Activate = function (userId) {
            var params = {
                userId: userId,
                newStatus: false
            }
            AuthenticationService.updateUserStatus(params).then(function (result) {
                loadUsers();
            });
        }

        $scope.Deactivate = function (userId) {
            var params = {
                userId: userId,
                newStatus: true
            }
            AuthenticationService.updateUserStatus(params).then(function (result) {

                loadUsers();
            });
        }
    }
    function load() {
        loadUsers();
    }

    function loadUsers() {
        var params = {
            name: $scope.searchName,
            id: $scope.searchId
           
        }
        console.log(params);
        AuthenticationService.getAllUsers(params).then(function (result) {
            console.log(result);
            $scope.users = result;
            $scope.isLoading = false;
        })
    }

    function searchUsers() {
        loadUsers();
    }
}

angular.module('Ecommerce', ['ui.bootstrap'])
    .controller("UserManagementController", UserManagementController);