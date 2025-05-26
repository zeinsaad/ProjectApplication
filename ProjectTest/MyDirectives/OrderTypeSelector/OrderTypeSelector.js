'use strict';
angular.module('Ecommerce')
    .directive('orderTypeSelector', ['$q', 'OrderTypeCT', function ($q, OrderTypeCT) {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                onReady: '=',
                onSelectionChanged: '='
            },
            templateUrl: '/MyDirectives/orderTypeSelector/orderTypeSelector.html',
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
                    var data = Object.values(OrderTypeCT);

                    loadItemDirective();
                    function loadItemDirective() {
                        console.log(data);
                        console.log(payload);
                        var loadDeferred = $q.defer();
                        promises.push(loadDeferred.promise);
                        $scope.orderType = data;
                        $scope.selectedType = payload.selectedType;
                        loadDeferred.resolve();

                        return loadDeferred.promise;
                    }
                    return $q.all(promises);
                };

                api.getData = function () {
                    return $scope.selectedType;
                };



                if ($scope.onReady && typeof $scope.onReady === 'function') {
                    $scope.onReady(api);
                } else {
                    console.error('$scope.onReady callback is not defined or not a function');
                }
            }
            function setupWatcher() {
                $scope.$watch('selectedType', function (newValue) {
                    if ($scope.onSelectionChanged) {
                        console.log(newValue);
                        $scope.onSelectionChanged(newValue);
                    }
                });
            }
        };

        return directiveDefinitionObject;
    }]);
