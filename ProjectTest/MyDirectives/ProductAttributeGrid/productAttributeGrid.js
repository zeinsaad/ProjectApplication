angular.module("Ecommerce").directive('productAttributeGrid', ['$q', 'CategoryWebApiService', function ($q, CategoryWebApiService) {
    return {
        restrict: 'E',
        scope: {
            onReady: '=',
        },
        templateUrl: '/MyDirectives/ProductAttributeGrid/productAttributeGrid.html',
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
            var ctrl = this;
            var ctor = new Ctor(ctrl, $scope, $attrs, $q);
            ctor.initializeController();
        }]
    };

    function Ctor(ctrl, $scope, $attrs, $q) {

        function updateAvailableAttributes() {
            if (!$scope.categoryId) return;

            CategoryWebApiService.getCategoryAttributes($scope.categoryId).then(function (allAttributes) {
                var selectedIds = $scope.Attributes.map(attr => attr.CategoryAttributeId);

                $scope.Attributes.forEach(function (attributeDetail) {
                    var api = attributeSelectorApis[attributeDetail.Id];
                    if (!api) {
                        console.warn(`API for attributeId ${attributeDetail.Id} is not initialized.`);
                        return;
                    }

                    var currentSelectionId = attributeDetail.CategoryAttributeId;

                    // Exclude other selected IDs, keep current one in the list
                    var availableAttributes = allAttributes.filter(attr =>
                        !selectedIds.includes(attr.Id) || attr.Id == currentSelectionId // loose comparison in case of type mismatch
                    );

                    var payload = {
                        Attributes: availableAttributes,
                        selectedAttribute: currentSelectionId
                    };

                    api.load(payload);
                });
                $scope.isAddButtonDisabled = $scope.Attributes.length >= allAttributes.length;
            });
        }




        var attributeSelectorApis = [];
        var attributeSelectorDeferred = [];
        var categoryId;
        this.initializeController = function () {


            $scope.scopeModel = {};
            $scope.Attributes = [];

            

          
            $scope.addAttribute = function () {

                var attribute = {
                    Id: generateGuid(),
                    CategoryAttributeId : '',
                    Value: '',
                }
               // attributeSelectorDeferred[attribute.Id] = $q.defer();
                attribute.onAttributeSelectorDirectiveReady = function (api) {
                  //  console.log(api);
                    var payload = {};
                    payload.categoryId = $scope.categoryId;
                    attributeSelectorApis[attribute.Id] = api;
                    attributeSelectorApis[attribute.Id].load(payload);
                }
                attribute.onAttributeSelectionChanged = function (value) {
                   // console.log(value);
                    attribute.CategoryAttributeId = value;
                   // updateAvailableAttributes();
                };
              //  updateAvailableAttributes();
                $scope.Attributes.push(attribute);
            };

            // Remove Attribute
            $scope.removeAttribute = function (Id) {
                console.log(Id);

                var index = $scope.Attributes.findIndex(function (attr) {
                    return attr.Id === Id
                });
                console.log(index);
                if (index > -1) {
                    delete attributeSelectorApis[Id];
                    $scope.Attributes.splice(index, 1);
                }
                console.log($scope.Attributes);
            };




            function generateGuid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }

            $scope.$watch(
                function () { return $scope.Attributes; },
                function (newValue) {
                    if (newValue) {
                        updateAvailableAttributes();
                        $scope.Attributes.forEach(function (attr) {
                            if (attr.CategoryAttributeId) {
                                // Assuming CategoryAttributeId is an ID, and you're assigning data to a new property
                                CategoryWebApiService.getCategoryAttributesById(attr.CategoryAttributeId)
                                    .then(function (data) {
                                        // Store the API result in a new property, like 'CategoryAttributeData'
                                        attr.CategoryAttributeData = data;
                                        console.log(attr.CategoryAttributeData.DataType);
                                        $scope.parseAttrValue(attr);
                                        // console.log('Updated attribute with ID:', attr.CategoryAttributeId, data);
                                    }).catch(function (error) {
                                        console.error('Error fetching category attribute:', error);
                                    });
                            }
                            else {
                                attr.CategoryAttributeData.DataType = null;
                            }
                            console.log(attr);
                        });

                        //   console.log($scope.Attributes);
                    }
                },
                true
            );

            $scope.parseAttrValue = function (att) {
                console.log('Parsing attribute:', att);

                var val = att.Value;

                switch (att.CategoryAttributeData.DataType) {
                    case 1: // String
                        att.Value = val || '';
                        break;

                    case 2: // Number
                        att.Value = val ? parseFloat(val) : null;  // null for empty
                        break;

                    case 3: // Boolean
                        if (val === undefined || val === null || val === '') {
                            att.Value = false; // default false when adding
                        } else {
                            att.Value = (val === 'true' || val === true);
                        }
                        break;

                    case 4: // Date
                        if (val) {
                            var parsedDate = new Date(val);
                            att.Value = isNaN(parsedDate.getTime()) ? null : parsedDate;
                        } else {
                            att.Value = null;
                        }
                        break;

                    default:
                        att.Value = val; // fallback
                }
                
                console.log('Parsed value:', att.Value);
            };




            defineApi();
        };

        function defineApi() {
            var api = {

                load: function (payload) {
                    var promises = [];

                    $scope.categoryId = payload.categoryId;
                    var data = payload.Attributes;

                    console.log(payload);

                    // Check if categoryId is valid
                    if (!$scope.categoryId) {
                        console.error("Cannot load attributes: categoryId is missing.");
                        return $q.reject("categoryId is required to load attributes.");
                    }

                    loadProductAttributesDirective();

                    function loadProductAttributesDirective() {
                        $scope.Attributes = [];
                        var loadDeferred = $q.defer();
                        promises.push(loadDeferred.promise);

                        $scope.Attributes = data;
                        $scope.Attributes.forEach(function (att) {

                            attributeSelectorDeferred[att.Id] = $q.defer();

                            att.onAttributeSelectorDirectiveReady = function (api) {
                                attributeSelectorApis[att.Id] = api;
                                attributeSelectorDeferred[att.Id].resolve();

                                var attPayload = {
                                    selectedAttribute: att.CategoryAttributeId,
                                    categoryId: $scope.categoryId
                                };

                                attributeSelectorApis[att.Id].load(attPayload);
                            };

                           
                            att.onAttributeSelectionChanged = function (value) {
                                att.CategoryAttributeId = value;
                                updateAvailableAttributes();
                                
                            };
                            // parse it based on its DataTypeCT
                            
                        });

                        loadDeferred.resolve();
                        return loadDeferred.promise;
                    }

                    return $q.all(promises);
                },


                getData: function () {
                    return $scope.Attributes;
                },
                setCategoryId: function (id) {
                    if (id)
                        $scope.categoryId = id;
                   // $scope.Attributes = [];
                }

            };


            if ($scope.onReady && typeof $scope.onReady === 'function') {
                $scope.onReady(api);
            } else {
                console.error('onReady callback is not defined or not a function');
            }
        }



    }

    return directiveDefinitionObject;
}]);
