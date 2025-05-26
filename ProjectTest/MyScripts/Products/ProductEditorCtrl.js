'use strict';

ProductEditorController.$inject = ['$scope','$q', '$uibModalInstance', 'ProductWebApiService','CategoryWebApiService'];

function ProductEditorController($scope, $q, $uibModalInstance, ProductWebApiService, CategoryWebApiService) {
    var productId;
    var payload = {};
    var productGridPayload = {};
    
    var categoryItemAPI;
    var categoryItemReadyDeferred = $q.defer();
    var productAttributeGridApi;
    var productAttributeGridDeferred = $q.defer();
    var discountTypeSelectorApi;
    var discountTypeReadyDeferred = $q.defer();


    defineScope();
    loadParameters();
    load();
    

    function defineScope() {
        $scope.today = new Date();
        $scope.hasDiscount = false;

        $scope.discount = {
            DiscountValue: 0,
            DiscountType: 0,
            DiscountStartDate: null,
            DiscountEndDate: null
        };

        $scope.discount = $scope.discount || {};

        $scope.scopeModel = {};

        $scope.toEdit = $scope.parameters.productId ? true : false;
        $scope.modalTitle = $scope.parameters.productId ? 'Edit Product' : 'Add Product';
        $scope.save = save;
        $scope.cancel = cancel;
        $scope.photos = [];

        $scope.onCategorySelectorDirectiveReady = function (api) {
            categoryItemAPI = api;
            categoryItemReadyDeferred.resolve();
        };

        $scope.onProductAttributeGridReady = function (api) {
            productAttributeGridApi = api;
            productAttributeGridDeferred.resolve();
        }

        $scope.onDiscountTypeSelectorReady = function (api) {
            discountTypeSelectorApi = api;
            discountTypeReadyDeferred.resolve();
        }

        $scope.onDiscountSelectionChanged = function (value) {
            $scope.discount.DiscountType = value;
        }
        $scope.triggerFileInput = function () {
            document.getElementById('photo').click();
        };

        $scope.uploadImages = function (input) {
            if (input.files) {
                console.log($scope.photos);
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                const maxSize = 2 * 1024 * 1024; // 2MB in bytes

                Array.from(input.files).forEach(file => {
                    const fileType = file.type.toLowerCase();

                    // Check for allowed file types and size
                    if ($scope.photos.length < 4 && allowedTypes.includes(fileType)) {
                        if (file.size <= maxSize) {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                $scope.$apply(() => {
                                    $scope.photos.push(e.target.result);
                                    $scope.errorMessage = ''; // Reset error message on success
                                });
                            };
                            reader.readAsDataURL(file);
                        } else {
                            $scope.$apply(() => {
                                $scope.errorMessage = 'File size exceeds 2MB limit.';
                            });
                        }
                    } else if (!allowedTypes.includes(fileType)) {
                        $scope.$apply(() => {
                            $scope.errorMessage = 'Only JPG, JPEG, and PNG images are allowed.';
                            console.log($scope.errorMessage);
                        });
                    }
                });
            }
        };




        $scope.removePhoto = function (index) {
            $scope.photos.splice(index, 1);
        };

        $scope.dragOver = function (event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        };

        $scope.dropImages = function (event) {
            event.preventDefault();
            let files = event.dataTransfer.files;
            if (files.length > 0) {
                $scope.uploadImages({ files });
            }
        };

        $scope.onCategorySelectorChange = function (value) {
            const isEdit = productId ? true : false;
            const categoryChanged = productGridPayload.categoryId !== value;

            productGridPayload.selectedCategory = value;
            productGridPayload.categoryId = value;

            if (productAttributeGridApi) {
                productAttributeGridApi.setCategoryId(value);

                if (!isEdit || categoryChanged) {
                    productGridPayload.Attributes = [];
                }

                productAttributeGridApi.load(productGridPayload);
            }
        };

        $scope.$watch('photos', function (newVal) {
            if (newVal) {
                $scope.nbOfPhotos = newVal.length;
            } else {
                $scope.nbOfPhotos = 0;
            }
        }, true); // Use `true` for deep watching if needed


        $scope.$watch(
            function () {
                var productLength = 0;
                var categoryData = null;

                if (productAttributeGridApi && typeof productAttributeGridApi.getData === 'function') {
                    var productData = productAttributeGridApi.getData();
                    productLength = productData ? productData.length : 0;
                }

                if (categoryItemAPI && typeof categoryItemAPI.getData === 'function') {
                    categoryData = categoryItemAPI.getData();
                }

                // Return an array of both values to watch them both
                return [productLength, categoryData];
            },
            function (newValues) {
                var productLength = newValues[0];
                var categoryData = newValues[1];

                console.log('Product Length:', productLength);
                console.log('Category Data:', categoryData);

                // Your logic here
                if (categoryData != null && !isNaN(parseInt(categoryData))) {
                    CategoryWebApiService.getCategoryAttributes(parseInt(categoryData)).then(function (result) {
                        console.log(productLength);
                        console.log(result.length);
                        if (result.length !== productLength) {
                            $scope.disable = true;
                        } else {
                            $scope.disable = false;
                        }
                    }).catch(function (error) {
                        console.error('Error fetching category attributes:', error);
                        $scope.disable = true;
                    });
                } else {
                    console.warn('Invalid category data');
                    $scope.disable = true;
                }
            },
            true // Deep watch array
        );




        $scope.toggleDiscount = function () {

            console.log($scope.hasDiscount);
            if ($scope.hasDiscount === true) {
                loadDiscountTypeSelectorDirective();
            } else {
                 discountTypeSelectorApi = null;
                 discountTypeReadyDeferred = $q.defer();
            }
        };
        

    }

   
    function load() {

        getEntireItem().then(function () { 
             loadCategorySelectorDirective();
            loadProductAttributeGridDirective();        
            loadDiscountTypeSelectorDirective()
        }); 


        function loadCategorySelectorDirective() {
            var loadDeferred = $q.defer();
            categoryItemReadyDeferred.promise.then(function () {
                if (categoryItemAPI && categoryItemAPI.load) {
                    categoryItemAPI.load(payload);
                }
            });
            return loadDeferred.promise;
        }

        function loadProductAttributeGridDirective() {
            var loadDeferred = $q.defer();
            productAttributeGridDeferred.promise.then(function () {
                if (productAttributeGridApi) {
                    console.log(productGridPayload);
                    productAttributeGridApi.load(productGridPayload);
                }
            });
            return loadDeferred.promise;
        }

       
    }
    function loadDiscountTypeSelectorDirective() {
        var payload = {};
        payload.selectedDiscountType = $scope.discount.DiscountType;
        var loadDeferred = $q.defer();
        discountTypeReadyDeferred.promise.then(function () {
            if (discountTypeSelectorApi) {
                
                discountTypeSelectorApi.load(payload);
            }
        });
        return loadDeferred.promise;
    }
   

    function loadParameters() {
        productId = $scope.parameters.productId;
        if ($scope.toEdit) {
            productId = $scope.parameters.productId;
          
        }
    }
    function getEntireItem() {
        var getDeferred = $q.defer();
        if (productId) {
            ProductWebApiService.getProductById(productId).then(function (product) {
                console.log(product);
                $scope.Name = product.Name;
                $scope.Description = product.Description;
                $scope.Price = product.Price;
                $scope.Quantity = product.Quantity
                $scope.IsActive = product.IsActive;
                payload.selectedCategory = product.CategoryId;
                productGridPayload.Attributes = product.ProductAttributes;
                productGridPayload.categoryId = product.CategoryId;
                $scope.hasDiscount = product.Discount ? true : false;
                if (product.Discount) {
                    $scope.discount.DiscountType = product.Discount.DiscountType;
                    $scope.discount.DiscountValue = product.Discount.DiscountValue;
                    $scope.discount.DiscountStartDate = new Date(product.Discount.StartDate);
                    $scope.discount.DiscountEndDate = new Date(product.Discount.EndDate);
                }

                console.log($scope.discount);
                $scope.photos = product.ProductImages.map(function (img) {
                    return img.ImagePath;
                });
                getDeferred.resolve();
            });


        }
        else {
            getDeferred.resolve();
        }
        return getDeferred.promise;
       
    }

    function save() {
        if (!$scope.parameters.product) {
            $scope.parameters.product = {};
        }

        $scope.parameters.product.Id = $scope.parameters.productId;
        $scope.parameters.product.Name = $scope.Name;
        $scope.parameters.product.Description = $scope.Description;
        $scope.parameters.product.Quantity = $scope.Quantity;
        $scope.parameters.product.CategoryId = categoryItemAPI.getData();
        $scope.parameters.product.Price = $scope.Price;
        $scope.parameters.product.IsActive = $scope.IsActive;
        $scope.parameters.product.ProductAttributes = productAttributeGridApi.getData();

        console.log($scope.photos);

        // Check if at least one image is selected
        if ($scope.photos.length === 0) {
            alert("Please select at least one image.");
            return;
        }

        $scope.parameters.product.ProductImages = $scope.photos.map(function (photo) {
            let base64String;

            // If photo is a data URL (data:image/jpeg;base64,...), extract the Base64 part
            if (photo && photo.indexOf(',') > 0 && photo.startsWith('data:image')) {
                base64String = photo.split(',')[1];
            } else {
                base64String = photo; // Assume it's already a Base64 string
            }

            return { ImagePath: base64String };
        });
        $scope.parameters.product.Discount = $scope.parameters.product.Discount || {};
        console.log($scope.hasDiscount);
        if ($scope.hasDiscount) {
            $scope.parameters.product.Discount = {
                DiscountType: discountTypeSelectorApi.getData(),
                DiscountValue: $scope.discount.DiscountValue,
                StartDate: $scope.discount.DiscountStartDate,
                EndDate: $scope.discount.DiscountEndDate
            };

        }

        console.log($scope.parameters.product);

        $uibModalInstance.close($scope.parameters); // Close the modal and pass the data
    };



    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }

}

angular.module('Ecommerce')
    .controller("ProductEditorController", ProductEditorController);
