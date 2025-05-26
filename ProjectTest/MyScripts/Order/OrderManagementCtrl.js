"use strict";

OrderManagementController.$inject = ["$scope", 'ModalService', 'PaginationService', '$q', 'ShopWebApiService', 'AuthenticationService', 'ShopService'];

function OrderManagementController($scope, ModalService, PaginationService, $q, ShopWebApiService, AuthenticationService, ShopService) {


    var totalItems;

    var orderStatusSelectorApi;
    var orderStatusSelectorReady = $q.defer();
    var orderTypeSelectorApi;
    var orderTypeSelectorReady = $q.defer();
    defineScope();
    loadData();
    load();

    function defineScope() {

        $scope.isLoading = true;
        $scope.pages = [];
        $scope.currentPage = 1;
        $scope.pageSize = 3;

        $scope.LastPage = 0;
        // $scope.openDrillDowns = [];

    
        $scope.showPage = ShowPage;
       // $scope.Search = Search;


        $scope.login = function () {
            ModalService.openModal('../MyModals/authModal.html', AuthenticationController, null, 'sm', function (result) {

            });
        };

        $scope.logout = function () {
            console.log("Logout clicked");
            AuthenticationService.logout();
        }

        $scope.onOrderStatusDirectiveReady = function (api) {
            orderStatusSelectorApi = api;
            orderStatusSelectorReady.resolve();
        }

        $scope.onOrderTypeDirectiveReady = function (api) {
            orderTypeSelectorApi = api;
            orderTypeSelectorReady.resolve();
        }

        $scope.onOrderTypeDirectiveChange = function (value) {
            var payload = {};
            payload.OrderType = value;
            payload.selectedStatus = orderStatusSelectorApi && orderStatusSelectorApi.getData() ? orderStatusSelectorApi.getData() : null;
            loadOrderStatusSelector(payload);
        }
    }



    function loadData() {
        loadOrders();
    }

    function loadOrderStatusSelector(payload) {
        orderStatusSelectorReady.promise.then(function () {

            orderStatusSelectorApi.load(payload);
        });
    }
    function load() {
        loadOrderStatusSelector();
        loadOrderTypeSelector();
        function loadOrderStatusSelector(payload) {
            orderStatusSelectorReady.promise.then(function () {
                
                orderStatusSelectorApi.load(payload);
            });
        }

        function loadOrderTypeSelector() {
            orderTypeSelectorReady.promise.then(function () {
                var payload = {};
                orderTypeSelectorApi.load(payload);
            });
        }
    }

    function updatePagination() {

        $scope.paginationData = PaginationService.getPages($scope.currentPage, $scope.pageSize, totalItems);
        console.log($scope.paginationData);


        var startIndex = ($scope.currentPage - 1) * $scope.pageSize;
        var endIndex = startIndex + $scope.pageSize;

        var totalPages = Math.ceil(totalItems / $scope.pageSize);
       

        $scope.currentOrders = $scope.orders.slice(startIndex, endIndex);
        // $scope.pages = $scope.paginationData.pages;
        $scope.LastPage = totalPages;
        console.log($scope.LastPage);;
    }

    function ShowPage(pageNumber) {
        $scope.currentPage = pageNumber;
        var data = PaginationService.setPage(pageNumber, $scope.orders);
        $scope.currentOrders = data.dataArray;
        $scope.LastPage = data.totalPages;
        $scope.pages = PaginationService.getPages($scope.currentPage, totalItems);
    }

    function loadOrders() {
        var params = {
            CustomerName: $scope.searchCustomerName,           
            OrderDate: $scope.searchDate,
            OrderId: $scope.searchOrderId,
           
        };
        var status = orderStatusSelectorApi && orderStatusSelectorApi.getData() ? orderStatusSelectorApi.getData() : null;
        if (status !== null && status !== undefined && status !== '') {
            params.Status = parseInt(status);
        }

        var orderType = orderTypeSelectorApi && orderTypeSelectorApi.getData() ? orderTypeSelectorApi.getData() : null;
        if (orderType !== null && orderType !== undefined && orderType !== '') {
            params.OrderType = parseInt(orderType);
        }

        ShopWebApiService.getAllOrders(params)
            .then(function (data) {
                console.log(data);
                $scope.orders = data;
               
                $scope.orders.forEach(function (order) {
                    order.onOrderStatusDirectiveReady = function (api) {
                        order.orderStatusSelectorApi = api;
                        var payload = {};
                        payload.selectedStatus = order.Status;
                        payload.OrderType = order.orderType;
                        order.orderStatusSelectorApi.load(payload);
                       
                    };

                    order.onOrderStatusSelectionChanged = function (value) {
                        order.Status = value;
                    }
                });
                totalItems = data.length;

                $scope.paginationData = PaginationService.getPages($scope.currentPage, totalItems);
                //     $scope.pages = $scope.paginationData.pages;
                ShowPage($scope.currentPage);

                updatePagination();

                $scope.isLoading = false;

               
            })
            .catch(function (error) {
                console.error('Error fetching orders:', error);
            });

       
    }

    $scope.createOrder = function () {
        ModalService.openModal('../MyModals/adminCreateOrderModal.html', CreateOrderController, null,'lg', function (result) {
            loadOrders();
        });
    }
    $scope.saveChanges = function (order) {
        var parameters = {
            orderId: order.Id,
            status: order.orderStatusSelectorApi.getData(),
            isPaid : order.isPaid
        }
        ShopService.updateOrder(parameters);
        loadOrders();
    }

    $scope.printInvoice = function (order) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice #${order.Id}</title>
            <style>
                body { font-family: Arial; font-size: 12px; padding: 15px; }
                h2 { margin: 0 0 5px 0; color: #333; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th { text-align: left; padding: 5px; border-bottom: 1px solid #ddd; }
                td { padding: 5px; border-bottom: 1px solid #eee; }
                .text-right { text-align: right; }
                .total { font-weight: bold; margin-top: 10px; }
                .header { display: flex; justify-content: space-between; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>INVOICE #${order.Id}</h2>
                <p>Date: ${new Date(order.OrderDate).toLocaleDateString()}</p>
            </div>
            
            <div style="margin: 15px 0;">
                <p><strong>Customer:</strong> ${order.UserName || 'Customer #' + order.UserId}</p>
                <p>${order.Address}, ${order.City}</p>
                <p>${order.PhoneNumber}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="text-right">Price</th>
                        <th>Qty</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.OrderItems.map(item => `
                        <tr>
                            <td>${item.ProductName}</td>
                            <td class="text-right">${item.Price.toFixed(2)}</td>
                            <td>${item.Quantity}</td>
                            <td class="text-right">${(item.Price * item.Quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
           <div class="text-right" style="margin-top: 20px;">
    <p>
        Subtotal:
        ${ (order.orderType === 2
                ? order.TotalPrice
                : (order.TotalPrice - (order.ShippingFee || 10))
            ).toFixed(2)}
    </p>

    <p>
    Shipping:
    ${ (order.orderType === 2
                ? 0.00
                : (order.ShippingFee || 10)
            ).toFixed(2) }
</p>

    <p class="total">TOTAL: ${order.TotalPrice.toFixed(2)}</p>
</div>

            
            <script>
                setTimeout(() => window.print(), 100);
            </script>
        </body>
        </html>
    `);
        printWindow.document.close();
    };


    // Add this function to your controller
    $scope.updatePaymentStatus = function (order) {
        console.log(order.IsPaid);
    };

    $scope.search = function () {
        $scope.currentPage = 1;
        loadOrders();
    }

}

angular.module('Ecommerce', ['ui.bootstrap'])
    .controller("OrderManagementController", OrderManagementController);