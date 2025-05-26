'use strict';
angular.module('Ecommerce')
    .directive('attributeSelector', ['$q', 'CategoryWebApiService', function ($q, CategoryWebApiService) {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                onReady: '=',
                onSelectionChanged: '='
            },
            templateUrl: '/MyDirectives/attributeSelector/attributeSelector.html',
            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                var ctrl = this;
                var ctor = new Ctor(ctrl, $scope, $attrs);
                ctor.initializeController();
            }]
        };

        function Ctor(ctrl, $scope, $attrs) {
            this.initializeController = initializeController;
            var categoryId;
            function initializeController() {
                $scope.scopeModel = {};

                defineAPI();
                setupWatcher();
            }

            function defineAPI() {
                var api = {};

                api.load = function (payload) {
              //      console.log(payload);
                    var promises = [];
                    categoryId = payload.categoryId;
                    var AttributeData = payload.Attributes;

                    loadItemDirective();
                    function loadItemDirective() {
                        var loadDeferred = $q.defer();
                        promises.push(loadDeferred.promise);
                    //    console.log(categoryId);
                        if (!AttributeData) {
                            CategoryWebApiService.getCategoryAttributes(categoryId).then(function (data) {
                                $scope.attributes = data;
                            });
                        }
                        else {
                            $scope.attributes = AttributeData;
                        }
                        $scope.scopeModel.selectedAttribute = payload.selectedAttribute;
                        loadDeferred.resolve();

                        return loadDeferred.promise;
                    }
                    return $q.all(promises);
                };

                api.getData = function () {
                    return $scope.scopeModel.selectedAttribute;
                };



                if ($scope.onReady && typeof $scope.onReady === 'function') {
                    $scope.onReady(api);
                } else {
                    console.error('$scope.onReady callback is not defined or not a function');
                }
            }
            function setupWatcher() {
                $scope.$watch('scopeModel.selectedAttribute', function (newValue) {
                    if ($scope.onSelectionChanged) {
                        $scope.onSelectionChanged(newValue);
                    }
                });
            }
        };

        return directiveDefinitionObject;
    }]);
