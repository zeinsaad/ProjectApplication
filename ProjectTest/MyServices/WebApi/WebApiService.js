angular.module('Ecommerce').service('WebApiService', ['$http', function ($http) {
    this.get = function (url, parameters) {
      //  console.log(parameters);
        return $http.get(url, parameters);
    };

    this.post = function (url, parameters) {
        //console.log(parameters);
        return $http.post(url, parameters); 
    };
}]);
