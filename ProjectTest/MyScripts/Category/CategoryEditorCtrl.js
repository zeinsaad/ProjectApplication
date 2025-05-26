'use strict';

CategoryEditorController.$inject = ['$scope', '$uibModalInstance','CategoryWebApiService','$q','$timeout'];

function CategoryEditorController($scope, $uibModalInstance, CategoryWebApiService,$q,$timeout) {
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
        $scope.scopeModel.save = save;
        $scope.scopeModel.cancel = cancel;

        $scope.imageSrc = '';  // Initialize imageSrc to hold the image preview URL
        $scope.Attributes = [];

        // Trigger the file input dialog when clicked
        $scope.triggerFileInput = function () {
            // Direct click without $timeout
            var el = document.getElementById('photo');
            if (el) el.click();
        };

        $scope.previewImage = function (input) {
            $scope.errorMessage = ''; // Clear previous error

            file = input.files[0];
            const maxSizeMB = 2;
            const allowedTypes = ['image/jpg','image/jpeg', 'image/png'];
            console.log(file);
            if (file) {
                // ❌ Type validation
                if (!allowedTypes.includes(file.type)) {
                    $scope.$apply(() => {
                        $scope.errorMessage = 'Only JPG , PNG and JPEG images are allowed.';
                        $scope.imageSrc = null;
                    });
                    return;
                }

                // ❌ Size validation
                const fileSizeMB = file.size / (1024 * 1024);
                if (fileSizeMB > maxSizeMB) {
                    $scope.$apply(() => {
                        $scope.errorMessage = `File size should not exceed ${maxSizeMB} MB.`;
                        $scope.imageSrc = null;
                    });
                    return;
                }

                // ✅ Valid file: read and preview
                var reader = new FileReader();
                reader.onload = function (e) {
                    $scope.$apply(function () {
                        $scope.imageSrc = e.target.result;
                    });
                };
                reader.readAsDataURL(file);
            } else {
                console.error("No file selected");
                $scope.$apply(() => {
                    $scope.errorMessage = 'No file selected.';
                    $scope.imageSrc = null;
                });
            }
        };




        // Remove the image preview when the remove button is clicked
        $scope.removeImage = function () {
            $scope.imageSrc = '';  // Reset image preview
        };

       

        $scope.CategoryAttributeGridDirectiveReady = function (api) {
            CategoryAttributeGridApi = api;
            CategoryAttributeGridDeferred.resolve();
        }


        $scope.$watch(
            function () {
                if (CategoryAttributeGridApi && typeof CategoryAttributeGridApi.getData === 'function') {
                    var data = CategoryAttributeGridApi.getData();
                    return data ? data.length : 0;
                }
                return 0; // If not ready yet, assume empty
            },
            function (newVal) {
                $scope.isCategoryAttributeGridEmpty = newVal <= 0;
            }
        );

       
    }
    function load() {
        getEntireItem().then(function () {
            loadCategoryAttributeGridDirective();
        });
    }


    function loadCategoryAttributeGridDirective() {
        var payload = {};
        if (category) {
            
            payload.Attributes = category.CategoryAttributes;
            //  payload.hobbyDetails = employee.HobbyDetails;

        }
        CategoryAttributeGridDeferred.promise.then(function () {
            CategoryAttributeGridApi.load(payload);
        });

    }

    function getEntireItem() {
        var getDeferred = $q.defer();
        if (categoryId) {
            CategoryWebApiService.getCategoryById(categoryId).then(function (data) {
                $scope.scopeModel.Name = data.Name;
                $scope.scopeModel.Description = data.Description;
                $scope.imageSrc = data.FilePath;
                category = data;
                getDeferred.resolve();
            });
        }
        else {
            getDeferred.resolve();
        }
        return getDeferred.promise;
    }
    function loadParameters() {
        categoryId = $scope.parameters.categoryId;
    }


    function save() {
        if (!$scope.parameters.category) {
            $scope.parameters.category = {};
        }

        $scope.parameters.category.Id = $scope.parameters.categoryId;
        $scope.parameters.category.Name = $scope.scopeModel.Name;
        $scope.parameters.category.Description = $scope.scopeModel.Description;
        $scope.parameters.category.CategoryAttributes = CategoryAttributeGridApi.getData();


        console.log(file);

        if (file) {
            var reader = new FileReader();
            reader.onloadend = function () {
                var base64String = reader.result.split(',')[1];
                console.log("Base64 String (first 100 chars):", base64String.substring(0, 100));

                $scope.parameters.category.FilePath = base64String;
                console.log($scope.parameters);
                $uibModalInstance.close($scope.parameters);
            };
            reader.readAsDataURL(file);
        } else {
            // If no new file was selected, use existing image path or leave it as is
            $scope.parameters.category.FilePath = $scope.imageSrc;
            console.log($scope.parameters);
            $uibModalInstance.close($scope.parameters);
        }
    }




    function cancel() {
        console.log("cancel");
        $uibModalInstance.dismiss('cancel');
    }

    console.log($scope.modalTitle);
}

angular.module('Ecommerce')
    .controller("CategoryEditorController", CategoryEditorController);
