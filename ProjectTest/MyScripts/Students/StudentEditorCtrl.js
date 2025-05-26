'use strict';

StudentEditorController.$inject = ['$scope', '$uibModalInstance', '$q', 'GenderEnumCT', 'UniversityWebApiService', 'DepartmentWebApiService', 'paymentEnum', 'CurrencyEnumCT', 'StudentService', '$timeout', 'financialEnum', 'StudentWebApiService'];

function StudentEditorController($scope, $uibModalInstance, $q, GenderEnumCT, UniversityWebApiService, DepartmentWebApiService, paymentEnum, CurrencyEnumCT, StudentService, $timeout, financialEnum, StudentWebApiService) {



    var studentId;
    var student;

    var genderItemAPI;
    var genderItemReadyDeferred = $q.defer();
    var universityItemAPI;
    var universityItemReadyDeferred = $q.defer();
    var departmentItemApi;
    var departmentItemReadyDeferred = $q.defer();
    var paymentItemAPI;
    var paymentItemReadyDeferred = $q.defer();
    var financialItemApi;
    var financialItemReadyDeferred = $q.defer();



    var context = {};



    defineScope();
    loadParameters();
    load();




    function defineScope() {

        $scope.scopeModel = {};


        $scope.scopeModel.modalTitle = $scope.parameters.Id ? 'Edit Student' : 'Add Student';
        $scope.scopeModel.save = save;
        $scope.scopeModel.cancel = cancel;


        $scope.scopeModel.handleUniversityChange = handleUniversityChange;

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

        $scope.scopeModel.onPaymentItemDirectiveReady = function (api) {
            paymentItemAPI = api;
            paymentItemReadyDeferred.resolve();
            //   paymentItemAPI.setContext(context);
        }

        $scope.scopeModel.onFinancialItemDirectiveReady = function (api) {
            financialItemApi = api;
            financialItemReadyDeferred.resolve();
            // financialItemApi.setContext(context);
        }



    }


    function load() {
        function loadAllControls() {
            getEntireItem().then(function () {
                loadGenderItemDirective();
                loadUniversityItemDirective();
                loadPaymentItemDirective();
                loadFinancialItemDirective();
            });

        }

        function getEntireItem() {
            var getDeferred = $q.defer();
            if (studentId) {
                StudentWebApiService.getStudentById(studentId).then(function (data) {
                    student = data;
                    $scope.scopeModel.Name = data.Name;
                    getDeferred.resolve();
                });
            }
            else {
                getDeferred.resolve();
            }
            return getDeferred.promise;
        }
        function loadGenderItemDirective() {
            var payload = {};
            var data = Object.values(GenderEnumCT);
            payload.data = data;
            if (student) {
                payload.selectedGender = student.Gender;
            }

            var loadDeferred = $q.defer();
            genderItemReadyDeferred.promise.then(function () {
                if (genderItemAPI && typeof genderItemAPI.load === 'function') {
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
                if (student) {
                    payload.selectedUniversity = student.UniversityId;
                }
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

        function loadPaymentItemDirective() {
             var payload = {};
            var data = Object.values(paymentEnum);
            payload.data = data;
            if (student) {
                payload.selectedPayment = student.PaymentMethod.$type
                payload.studentData = student.PaymentMethod;

            }
            payload.context = context;
            var loadDeferred = $q.defer();
            paymentItemReadyDeferred.promise.then(function () {
                if (paymentItemAPI && typeof paymentItemAPI.load === 'function') {
                    paymentItemAPI.load(payload);
                    loadDeferred.resolve();
                }
            });
            return loadDeferred.promise;
        }

        function loadFinancialItemDirective() {
            var payload = {};
            var data = Object.values(financialEnum);
            payload.data = data;
            if (student) {
                payload.selectedFinancial = student.financialAid.AidType.$type;
                payload.studentFinancialData = student.financialAid;
            }
            payload.context = context;
            var loadDeferred = $q.defer();
            financialItemReadyDeferred.promise.then(function () {
                if (financialItemApi && typeof financialItemApi.load === 'function') {
                    financialItemApi.load(payload);
                    loadDeferred.resolve();
                }
            });
            return loadDeferred.promise;
        }




        loadAllControls();
    }

    function loadDepartmentItemDirective(universityId) {
        var payload = {};
        var loadDeferred = $q.defer();
        payload.universityId = universityId;
        if (student) {
            payload.selectedDepartment = student.DepartmentId;
        }
        departmentItemReadyDeferred.promise.then(function () {
            if (departmentItemApi && typeof departmentItemApi.load === 'function') {
                departmentItemApi.load(payload);
                loadDeferred.resolve();
            }

            return loadDeferred.promise;
        });
    }

    function loadParameters() {
        if ($scope.parameters.Id) {
            studentId = $scope.parameters.Id;
        }
    }




    function handleUniversityChange(universityId) {
        if (departmentItemApi) {
            loadDepartmentItemDirective(universityId);

        }
    }

  

    function save() {

        //   console.log($scope.parameters.student);

        if (!$scope.parameters.student) {
            $scope.parameters.student = {};
        }

        $scope.parameters.student.Id = $scope.parameters.Id;

        $scope.parameters.student.Name = $scope.scopeModel.Name;

        if (genderItemAPI) {
            var selectedGender = genderItemAPI.getData();
            $scope.parameters.student.Gender = selectedGender ? selectedGender : null;
        }

        if (universityItemAPI) {
            var selectedUniversity = universityItemAPI.getData();
            $scope.parameters.student.UniversityId = selectedUniversity ? selectedUniversity : null;
        }

        if (departmentItemApi) {
            var selectedDepartment = departmentItemApi.getData();
            $scope.parameters.student.DepartmentId = selectedDepartment ? selectedDepartment : null;
        }

        if (paymentItemAPI) {
            var data = paymentItemAPI.getData();
            $scope.parameters.student.PaymentMethod = data;
        }
        if (financialItemApi) {
            var data = financialItemApi.getData();
            $scope.parameters.student.FinancialAid = data;
        }
        $uibModalInstance.close($scope.parameters);
    }

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }

}

angular.module('StudentTable')
    .controller("StudentEditorController", StudentEditorController);
