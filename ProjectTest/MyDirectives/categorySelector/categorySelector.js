'use strict';
angular.module('Ecommerce')
    .directive('categorySelector', ['$q', 'CategoryWebApiService', function ($q, CategoryWepApiService) {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                onReady: '=',
                onSelectionChanged: '='
              //  onSelectionChanged: '='
            },
            templateUrl: '/MyDirectives/CategorySelector/categorySelector.html',
            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                var ctrl = this;
                var ctor = new Ctor(ctrl, $scope, $attrs);
                ctor.initializeController();
            }]
        };

        function Ctor(ctrl, $scope, $attrs) {
            this.initializeController = initializeController;
    

            function initializeController() {
                $scope.scopeModel = {};

                defineAPI();
                setupWatcher();
            }

            function defineAPI() {
                var api = {};

                


                api.load = function (payload) {
                    var promises = [];

                    loadCategoryItemDirective();
                    function loadCategoryItemDirective() {
                        var loadDeferred = $q.defer();
                        promises.push(loadDeferred.promise);
                        return CategoryWepApiService.getCategoriesInfo()
                            .then(function (data) {
                                console.log(payload);
                                $scope.categories = data;
                                console.log("Setting selected Category : " + payload.selectedCategory);
                                $scope.scopeModel.selectedCategory = payload.selectedCategory;
                                loadDeferred.resolve();
                            });
                       
                        return loadDeferred.promise;
                    }
                    return $q.all(promises);
                };
                api.getData = function () {
                    return $scope.scopeModel.selectedCategory;
                };

     

                if ($scope.onReady && typeof $scope.onReady === 'function') {
                    $scope.onReady(api);
                } else {
                    console.error('onReady callback is not defined or not a function');
                }
            }
            function setupWatcher() {
                $scope.$watch('scopeModel.selectedCategory', function (newValue) {
                    if (typeof $scope.onSelectionChanged === 'function') {
                        $scope.onSelectionChanged(newValue);
                    }
                });
            }
            
        };

        return directiveDefinitionObject;
    }]);
