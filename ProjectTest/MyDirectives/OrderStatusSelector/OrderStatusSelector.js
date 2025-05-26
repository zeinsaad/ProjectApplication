'use strict';
angular.module('Ecommerce')
    .directive('orderStatusSelector', ['$q', 'OrderStatusCT', function ($q, OrderStatusCT) {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                onReady: '=',
                onSelectionChanged: '='
            },
            templateUrl: '/MyDirectives/orderStatusSelector/orderStatusSelector.html',
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
                    var data = [];
                    payload = payload || {};
                    // Load statuses based on OrderType
                    if (payload && payload.OrderType === 1) {
                        data = [
                            OrderStatusCT.Pending,
                            OrderStatusCT.Shipped,
                            OrderStatusCT.Delivered,
                            OrderStatusCT.Cancelled
                        ];
                    } else if (payload && payload.OrderType === 2) {
                        data = [
                            OrderStatusCT.Served,
                            OrderStatusCT.Cancelled
                        ];
                    } else {
                        // If OrderType is null, undefined, or not matched → load all
                        data = Object.values(OrderStatusCT);
                    }

                    loadItemDirective();

                    function loadItemDirective() {
                        var loadDeferred = $q.defer();
                        promises.push(loadDeferred.promise);

                        $scope.orderStatus = data;
                        $scope.selectedStatus = payload.selectedStatus;
                        loadDeferred.resolve();

                        return loadDeferred.promise;
                    }

                    return $q.all(promises);
                };

                api.getData = function () {
                    return $scope.selectedStatus;
                };

                if ($scope.onReady && typeof $scope.onReady === 'function') {
                    $scope.onReady(api);
                } else {
                    console.error('$scope.onReady callback is not defined or not a function');
                }
            }

            function setupWatcher() {
                $scope.$watch('selectedStatus', function (newValue) {
                    if ($scope.onSelectionChanged) {
                    //    console.log(newValue);
                        $scope.onSelectionChanged(newValue);
                    }
                });
            }
        };

        return directiveDefinitionObject;
    }]);
