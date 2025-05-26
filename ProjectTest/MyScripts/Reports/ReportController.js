"use strict";

ReportController.$inject = ["$scope",'$q', 'CategoryWebApiService', 'ProductWebApiService', '$window','AuthenticationService'];

function ReportController($scope,$q, CategoryWebApiService, ProductWebApiService, $window, AuthenticationService) {
    var colorCache = {};
    var chart;
    defineScope();
    loadData();

    function defineScope() {
        $scope.totalSalesByCategories = [];
        $scope.totalSales = 0;
        $scope.totalQuantity = 0;

        $scope.toggleSalesCategory = toggleCategory.bind(null, 'Sales');
        $scope.toggleQuantityCategory = toggleCategory.bind(null, 'Quantity');

        $scope.chartType = 'bar';
        
        $scope.isLoading = true;


       
        $scope.initCharts = function () {
            // Sales Chart
            const salesCtx = document.getElementById('salesChart').getContext('2d');
            $scope.salesChart = new Chart(salesCtx, {
                type: 'doughnut',
                data: getChartData('sales'),
                options: getChartOptions('$')
            });

            // Quantity Chart
            const quantityCtx = document.getElementById('quantityChart').getContext('2d');
            $scope.quantityChart = new Chart(quantityCtx, {
                type: 'doughnut',
                data: getChartData('quantity'),
                options: getChartOptions('')
            });
        }


        
    }

    $scope.login = function () {
        ModalService.openModal('/MyModals/authModal.html', AuthenticationController, null, 'sm', function (result) {

        });
    };

    $scope.logout = function () {
        AuthenticationService.logout();
    }
    function destroyChart() {
        if (chart) {
            chart.destroy();
        }
    }
    function createChart() {
        var ctx = document.getElementById('monthlyRevenueChart').getContext('2d');

        // Extract month labels and revenue values
        var labels = $scope.monthlyRevenueData.map(item => item.Month);
        var data = $scope.monthlyRevenueData.map(item => item.TotalRevenue);

        var commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return '$' + context.raw.toLocaleString();
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };

        if ($scope.chartType === 'bar') {
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue ($)',
                        data: data,
                        backgroundColor: '#e74c3c',
                        borderColor: '#c0392b',
                        borderWidth: 1,
                        hoverBackgroundColor: '#c0392b'
                    }]
                },
                options: commonOptions
            });
        } else {
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue ($)',
                        data: data,
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        borderColor: '#e74c3c',
                        borderWidth: 3,
                        pointBackgroundColor: '#e74c3c',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: '#c0392b',
                        pointHoverBorderColor: '#fff',
                        pointHitRadius: 10,
                        pointBorderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: commonOptions
            });
        }
    }

    


    // Watch for chart type changes
    $scope.$watch('chartType', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            console.log(newVal);
            destroyChart();
            createChart();
        }
    });
    function getConsistentColor(name) {
        if (!colorCache[name]) {
            // Organized color palette with good visual separation
            const brandColors = [
                '#e74c3c', // Vivid red
                '#2c3e50', // Dark navy (good for text/headers)
                '#f39c12', // Bright orange
                '#27ae60', // Medium green (more distinct from blues)
                '#9b59b6', // Purple
                '#3498db', // Bright blue (now more separated from green)
                '#1abc9c', // Teal (shifted position)
                '#e67e22', // Dark orange
                '#34495e', // Dark slate blue
                '#16a085', // Darker teal
                '#d35400', // Rust orange
                '#2980b9'  // Deeper blue
            ];

            // Create a hash from the name
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }

            // Use the hash to select a color, but ensure colors are well-distributed
            const index = Math.abs(hash) % brandColors.length;
            colorCache[name] = brandColors[index];

            // Optional: You could add logic here to prevent similar colors being assigned consecutively
        }
        return colorCache[name];
    }

    function loadData() {
        $scope.isLoading = true;

        var revenuePromise = ProductWebApiService.getMonthlySalesRevenue({}).then(function (data) {
            $scope.monthlyRevenueData = data;
            createChart();
        });

        var summaryPromise = ProductWebApiService.getSalesSummary({}).then(function (data) {
            $scope.SummaryTotalSales = data.TotalSales;
            $scope.SummaryTotalOrders = data.TotalOrders;
            $scope.SummaryProductsSold = data.ProductsSold;
        });

        var productSalesPromise = ProductWebApiService.getProductSalesReport({ TopN: 5 }).then(function (data) {
            $scope.TopSellingProducts = data.TopSelling;
            $scope.LowSellingProducts = data.LowestSelling;
        });

        var categoryPromise = CategoryWebApiService.getSalesByCategories({}).then(function (data) {
            $scope.totalSalesByCategories = data.map(category => ({
                ...category,
                Color: getConsistentColor(category.Name),
                SalesVisible: true,
                QuantityVisible: true
            }));

            $scope.totalSales = $scope.totalSalesByCategories.reduce((sum, cat) => sum + cat.TotalSales, 0);
            $scope.totalQuantity = $scope.totalSalesByCategories.reduce((sum, cat) => sum + cat.TotalQuantity, 0);

            $scope.initCharts();
        });

        // Wait for all to finish
        $q.all([revenuePromise, summaryPromise, productSalesPromise, categoryPromise])
            .finally(function () {
                $scope.isLoading = false;
            });
    }


    function toggleCategory(type, index) {
        const visibilityProp = type + 'Visible';
        $scope.totalSalesByCategories[index][visibilityProp] = !$scope.totalSalesByCategories[index][visibilityProp];

        // Update the appropriate total
        if (type === 'Sales') {
            $scope.totalSales = $scope.totalSalesByCategories
                .filter(cat => cat.SalesVisible)
                .reduce((sum, cat) => sum + cat.TotalSales, 0);
        } else {
            $scope.totalQuantity = $scope.totalSalesByCategories
                .filter(cat => cat.QuantityVisible)
                .reduce((sum, cat) => sum + cat.TotalQuantity, 0);
        }

        updateChart(type.toLowerCase());
    }

    function updateChart(type) {
        const chart = type === 'sales' ? $scope.salesChart : $scope.quantityChart;
        const visibilityProp = type === 'sales' ? 'SalesVisible' : 'QuantityVisible';
        const valueProp = type === 'sales' ? 'TotalSales' : 'TotalQuantity';

        const visibleCategories = $scope.totalSalesByCategories.filter(c => c[visibilityProp]);

        if (chart) {
            chart.data.labels = visibleCategories.map(c => c.Name);
            chart.data.datasets[0].data = visibleCategories.map(c => c[valueProp]);
            chart.data.datasets[0].backgroundColor = visibleCategories.map(c => c.Color);
            chart.update();
        }
    }

   

        function getChartData(type) {
            const visibilityProp = type === 'sales' ? 'SalesVisible' : 'QuantityVisible';
            const valueProp = type === 'sales' ? 'TotalSales' : 'TotalQuantity';

            const visibleCategories = $scope.totalSalesByCategories.filter(c => c[visibilityProp]);

            return {
                labels: visibleCategories.map(c => c.Name),
                datasets: [{
                    data: visibleCategories.map(c => c[valueProp]),
                    backgroundColor: visibleCategories.map(c => c.Color),
                    borderWidth: 0
                }]
            };
        }

        function getChartOptions(prefix) {
            return {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total * 100) * 10) / 10;
                                return `${label}: ${prefix}${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            };
        }
    $scope.downloadTopSellingPDF = function () {
        const element = document.getElementById('ProductTopSelling');

        html2canvas(element, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("TopSellingProducts.pdf");
        });
    };

    $scope.downloadLowestSellingPDF = function () {
        const element = document.getElementById('ProductLowestSelling');

        html2canvas(element, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("LowestSellingProducts.pdf");
        });
    };

  
    };


angular.module('Ecommerce', ['ui.bootstrap'])
    .controller("ReportController", ReportController);