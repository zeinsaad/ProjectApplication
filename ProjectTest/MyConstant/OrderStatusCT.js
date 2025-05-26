// genderEnum.js
angular.module('Ecommerce').constant('OrderStatusCT', {
    Pending: { value: 1, description: "Pending" },
    Shipped: { value: 2, description: "Shipped" },
    Delivered: { value: 3, description: "Delivered" },
    Cancelled: { value: 4, description: "Cancelled" },
    Served: { value: 5, description: "Served" }
});
