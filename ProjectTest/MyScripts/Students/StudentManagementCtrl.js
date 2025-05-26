"use strict";


StudentManagementController.$inject = ["$scope", 'StudentWebApiService', 'StudentService', 'PaginationService', 'GenderEnumCT', 'UniversityService', 'DepartmentWebApiService', '$q', 'UniversityWebApiService'];

function StudentManagementController($scope, StudentWebApiService, StudentService, PaginationService, GenderEnumCT, UniversityService, DepartmentWepApiService, $q, UniversityWebApiService) {



    var genderItemAPI;
    var genderItemReadyDeferred = $q.defer();
    var universityItemAPI;
    var universityItemReadyDeferred = $q.defer();
    var departmentItemApi;
    var departmentItemReadyDeferred = $q.defer();


    defineScope();
    load();
    loadData();


    function defineScope() {

        $scope.scopeModel = {};

        $scope.scopeModel.students = [];
        $scope.scopeModel.pages = [];
        $scope.scopeModel.currentPage = 1;
        $scope.scopeModel.pageSize = 4;
        $scope.scopeModel.totalItems = 0;
        $scope.scopeModel.LastPage = 0;
        $scope.scopeModel.selectedUniversityId = null;
        $scope.scopeModel.selectedUniversity = null;
        $scope.scopeModel.selectedDepartment = null;


        $scope.scopeModel.loadStudents = loadStudents;
        $scope.scopeModel.updatePagination = updatePagination;
        $scope.scopeModel.showPage = ShowPage;
        $scope.scopeModel.Search = Search;
        $scope.scopeModel.addStudent = addStudent;
        $scope.scopeModel.editStudent = editStudent;
        $scope.scopeModel.onUniversitySelectionChange = onUniversitySelectionChange;


        $scope.scopeModel.onGenderItemDirectiveReady = function (api) {
            genderItemAPI = api;
            genderItemReadyDeferred.resolve();
        }

        $scope.scopeModel.onUniversityItemDirectiveReady = function (api) {
            universityItemAPI = api;
            universityItemReadyDeferred.resolve();
        }

        $scope.scopeModel.onDepartmentItemDirectiveReady = function (api) {
            departmentItemApi = api;
            departmentItemReadyDeferred.resolve();
        }

        $scope.scopeModel.getPaymentMethodName = function (paymentMethod) {
            if (!paymentMethod || !paymentMethod.$type) {
                return 'Unknown';
            }

            switch (paymentMethod.$type) {
                case 'StudentApplication.DatabaseManager.Entities.Payment.CashPayment, StudentApplication':
                    return 'Cash';
                case 'StudentApplication.DatabaseManager.Entities.Payment.BankPayment, StudentApplication':
                    return 'Bank';
                default:
                    return 'Unknown';
            }
        };
    }


    function load() {
        function loadAllControls() {
            loadGenderItemDirective();
            loadUniversityItemDirective();
        }
        function loadGenderItemDirective() {
            var payload = {};

            var data = Object.values(GenderEnumCT);
            payload.data = data;
            var loadDeferred = $q.defer();
            genderItemReadyDeferred.promise.then(function () {
                if (genderItemAPI && typeof genderItemAPI.load === 'function') {
                    // console.log("loading");
                    genderItemAPI.load(payload);
                    loadDeferred.resolve();
                }
            });
            return loadDeferred.promise;
        }
        function loadUniversityItemDirective() {
            var payload = {};
            UniversityWebApiService.getAllUniversities().then(function (universities) {
                payload.data = universities;

                var loadDeferred = $q.defer();
                universityItemReadyDeferred.promise.then(function () {
                    if (universityItemAPI && typeof universityItemAPI.load === 'function') {
                        universityItemAPI.load(payload);
                        loadDeferred.resolve();
                    }
                });
                return loadDeferred.promise;
            });
        }
        loadAllControls();
    }
    function loadDepartmentItemDirective(universityId) {
        var payload = {};
        var loadDeferred = $q.defer();
        payload.universityId = universityId;
        departmentItemReadyDeferred.promise.then(function () {
            if (departmentItemApi && typeof departmentItemApi.load === 'function') {
                departmentItemApi.load(payload);
                loadDeferred.resolve();
            }

            return loadDeferred.promise;
        });
    }


    function onUniversitySelectionChange(universityId) {
        // console.log(universityId);
        // console.log($scope.selectedUniversityId);
        if (departmentItemApi) {

            loadDepartmentItemDirective(universityId);

        }

    }

    function loadData() {
        loadStudents(1);

    }

    function updatePagination() {
      
        $scope.scopeModel.pages = PaginationService.getPages($scope.scopeModel.currentPage, $scope.scopeModel.pageSize, $scope.scopeModel.totalItems);
        var data = PaginationService.setPage($scope.scopeModel.currentPage, $scope.scopeModel.totalItems, $scope.scopeModel.students);
        $scope.scopeModel.pagedStudents = data.dataArray;
        $scope.scopeModel.LastPage = data.totalPages;
        //   var startIndex = ($scope.scopeModel.currentPage - 1) * $scope.scopeModel.pageSize;
     //   var endIndex = startIndex + $scope.scopeModel.pageSize;

     //   var totalPages = Math.ceil($scope.scopeModel.totalItems / $scope.scopeModel.pageSize);

       // $scope.scopeModel.pagedStudents = $scope.scopeModel.students.slice(startIndex, endIndex);
     
     //   $scope.scopeModel.LastPage = totalPages;

    }

  //  updatePagination();

    function ShowPage(pageNumber) {
        $scope.scopeModel.currentPage = pageNumber;
        var data = PaginationService.setPage(pageNumber , $scope.scopeModel.students);
        $scope.scopeModel.pagedStudents = data.dataArray;
        $scope.scopeModel.LastPage = data.totalPages;
        $scope.scopeModel.pages = PaginationService.getPages($scope.scopeModel.currentPage, $scope.scopeModel.totalItems);
    }

    function loadStudents(pageNumber) {
        $scope.scopeModel.currentPage = pageNumber;
        var gender = $scope.scopeModel.selectedGender;
        var department = $scope.scopeModel.selectedDepartment;
        var university = $scope.scopeModel.selectedUniversity;
        var params = {
            Name: $scope.scopeModel.searchTerm,
            Gender: gender,
            UniversityId: university,
            DepartmentId: !department || department

        };
        StudentWebApiService.getFilteredStudents(params)
            .then(function (data) {
                //  console.log(data);
                $scope.scopeModel.students = data.map(function (student) {
                    if (student.PaymentMethod && student.PaymentMethod.CurrencyId) {
                        student.PaymentMethod.CurrencyDescription = getCurrencyDescription(student.PaymentMethod.CurrencyId);
                    }
                    return student;
                });
                $scope.scopeModel.totalItems = data.length;
                ShowPage($scope.scopeModel.currentPage);
            })
            .catch(function (error) {
                console.error('Error fetching students:', error);
            });
    }

    function Search() {

        $scope.scopeModel.selectedGender = genderItemAPI.getData();
        $scope.scopeModel.selectedUniversity = universityItemAPI.getData();
        $scope.scopeModel.selectedDepartment = departmentItemApi.getData();

        //  console.log($scope.selectedGender);
        loadStudents(1);
    }
    function addStudent() {
        StudentService.addStudent(function (result) {
            if (result) {
                loadStudents($scope.scopeModel.currentPage);
            }
        });
    }


    function editStudent(studentId) {
        StudentService.editStudent(studentId, function (result) {
            if (result) {
                loadStudents($scope.scopeModel.currentPage);
            }
        });
    }

}
angular.module('StudentTable', ['ui.bootstrap'])
    .controller("StudentManagementController", StudentManagementController);
