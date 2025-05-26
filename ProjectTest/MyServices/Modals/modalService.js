// modalService.js
angular.module('Ecommerce')
    .service('ModalService', ['$uibModal', '$rootScope', function ($uibModal, $rootScope) {
        this.openModal = function (templateUrl, controller, parameters, size, callback) {
        var newScope = $rootScope.$new();
            newScope.parameters = parameters || {};
            console.log(size);
        var modalInstance = $uibModal.open({
            templateUrl: templateUrl,
            controller: controller,
            scope: newScope,
            size: size || 'lg',
            backdrop: 'static',  // Prevent modal from closing when clicking outside
            keyboard: false 
        });

        newScope.close = function () {
            modalInstance.close();
            newScope.$destroy();
        };

        modalInstance.result.then(function (result) {
            if (callback) {
                callback(result);
            }
        });

        return modalInstance;
    };
}]);