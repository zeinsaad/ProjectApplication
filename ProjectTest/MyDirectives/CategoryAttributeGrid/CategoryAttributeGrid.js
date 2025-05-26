angular.module("Ecommerce").directive('categoryAttributeGrid', ['$q', function ($q) {
    return {
        restrict: 'E',
        scope: {
            onReady: '=',
        },
        templateUrl: '/MyDirectives/CategoryAttributeGrid/CategoryAttributeGrid.html',
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
            var ctrl = this;
            var ctor = new Ctor(ctrl, $scope, $attrs, $q);
            ctor.initializeController();
        }]
    };

    function Ctor(ctrl, $scope, $attrs, $q) {


        var dataTypeApi = [];
        var dataTypeDeferred = [];
        this.initializeController = function () {


            $scope.scopeModel = {};
            $scope.Attributes = [];
           

            $scope.onDataTypeDirectiveReady = function (api) {
                dataTypeApi = api;
                dataTypeDeferred.resolve();
            }

            function loadDataTypeDirective() {
                var getDeffered = $q.defer();
            }

            function updateRemoveButtonState() {
                if (sharedContext.hobbies && sharedContext.hobbiesDetails) {
                    $scope.scopeModel.isRemoveButtonDisabled =
                        sharedContext.hobbiesDetails.length === sharedContext.hobbies.length;
                }
            };

            $scope.addAttribute = function () {

                var attribute = {
                    Id : generateGuid(),
                    Name: '',
                    DataType: '',
                    Unit : null,
                }
                attribute.onDataTypeDirectiveReady = function (api) {
                    var payload = {};
                    dataTypeApi[attribute.Id] = api;
                    dataTypeApi[attribute.Id].load(payload);
                }
                attribute.onDataTypeSelectionChanged = function (value) {
                    attribute.DataType = value;
                };
                $scope.Attributes.push(attribute);
            };

            // Remove Attribute
            $scope.removeAttribute = function (attribute) {
                const index = $scope.Attributes.indexOf(attribute);
                if (index > -1) {
                    $scope.Attributes.splice(index, 1);
                }
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


            defineApi();
        };

        function defineApi() {
            var api = {

                load: function (payload) {
                    var promises = [];
                    var data = payload.Attributes;



                    loadCategoryAttributesDirective();
                    function loadCategoryAttributesDirective() {
                        var loadDeferred = $q.defer();
                        promises.push(loadDeferred.promise);
                        if (data) {
                            console.log(data);
                            $scope.Attributes = data;
                            $scope.Attributes.forEach(function (att) {
                                
                                dataTypeDeferred[att.Id] = $q.defer();
                                att.onDataTypeDirectiveReady = function (api) {
                                    dataTypeApi[att.Id] = api;
                                    dataTypeDeferred[att.Id].resolve();
                                    var payload = {};
                                    payload.selectedDataType = att.DataType;
                                    dataTypeApi[att.Id].load(payload);
                                }
                                att.onDataTypeSelectionChanged = function (value) {
                                    att.DataType = value;
                                };
                            });
                        }
                        loadDeferred.resolve();
                        return loadDeferred.promise;
                    }
                    return $q.all(promises);
                },

                getData: function () {
                    return $scope.Attributes;
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
