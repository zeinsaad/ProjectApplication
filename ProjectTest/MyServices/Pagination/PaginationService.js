angular.module('Ecommerce')
    .service('PaginationService', function () {
        var service = {};

        var defaultPageSize = 3;  // Default page size if none is provided

        // Function to get the pages
        service.getPages = function (currentPage, totalItems, customPageSize) {
            var pageSize = customPageSize || defaultPageSize; // Use customPageSize if provided, otherwise use defaultPageSize
            console.log(pageSize);
            var pages = [];

            var totalPages = Math.ceil(totalItems / pageSize);
            console.log(totalPages);

            // Define start and end page for pagination
            var startPage = Math.max(1, currentPage - 2);
            var endPage = Math.min(totalPages, startPage + 4);

            // Adjust pages if the range is too small
            if (endPage - startPage < 4) {
                if (startPage === 1) {
                    endPage = Math.min(5, totalPages);
                } else {
                    startPage = Math.max(1, endPage - 4);
                }
            }

            // Add pages to the pages array
            for (var i = startPage; i <= endPage; i++) {
                pages.push({
                    title: i,
                    from: (i - 1) * pageSize + 1,
                    to: Math.min(i * pageSize, totalItems),
                    isLast: i === totalPages,
                    isFirst: i === 1,
                    isPrevious: i === currentPage - 1,
                    isNext: i === currentPage + 1
                });
            }

            return pages;
        };

        // Function to set the current page and get the paged data
        service.setPage = function (currentPage, array, customPageSize) {
            var pageSize = customPageSize || defaultPageSize;  // Use customPageSize if provided, otherwise use defaultPageSize

            var startIndex = (currentPage - 1) * pageSize;
            var endIndex = startIndex + pageSize;

            var totalPages = Math.ceil(array.length / pageSize);
            var pagedArray = array.slice(startIndex, endIndex);

            return {
                totalPages: totalPages,
                dataArray: pagedArray
            };
        };

        return service;
    });
