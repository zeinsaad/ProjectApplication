'use strict';
angular.module('Ecommerce')
    .directive('datatypeSelector', ['$q', 'DataTypeCT', function ($q, DataTypeCT) {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                onReady: '=',
                onSelectionChanged: '='
            },
            templateUrl: '/MyDirectives/dataTypeSelector/dataTypeSelector.html',
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
                    console.log("Load called");
                    var promises = [];
                    var data = Object.values(DataTypeCT);

                    loadItemDirective();
                    function loadItemDirective() {
                        var loadDeferred = $q.defer();
                        promises.push(loadDeferred.promise);
                        console.log(data);
                        $scope.dataTypes = data;
                        $scope.scopeModel.selectedDataType = payload.selectedDataType;
                        loadDeferred.resolve();

                        return loadDeferred.promise;
                    }
                    return $q.all(promises);
                };

                api.getData = function () {
                    return $scope.scopeModel.selectedDataType;
                };



                if ($scope.onReady && typeof $scope.onReady === 'function') {
                    $scope.onReady(api);
                } else {
                    console.error('$scope.onReady callback is not defined or not a function');
                }
            }
            function setupWatcher() {
                $scope.$watch('scopeModel.selectedDataType', function (newValue) {
                    if ($scope.onSelectionChanged) {
                        $scope.onSelectionChanged(newValue);
                    }
                });
             }
        };

        return directiveDefinitionObject;
    }]);
