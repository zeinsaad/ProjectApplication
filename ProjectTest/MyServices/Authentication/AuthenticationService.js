angular.module('Ecommerce')
    .service('AuthenticationService', ['ModalService', '$http', 'WebApiService', function (ModalService, $http, WebApiService) {

        var baseUrl = 'https://localhost:44343/User/';
        this.signUp = function (parameters, callback) {
            console.log(parameters);
            var url = baseUrl + 'Signup';
           
                    return WebApiService.post(url, parameters.user)
                        .then(function (response) {
                           
                            // console.log('department added successfully:', response.data);
                            if (callback) {
                                callback(true);
                            }
                        })
                        .catch(function (error) {
                            console.error('Error sign up:', error);
                            if (callback) {
                                callback(false);
                            }
                        });    
        };


        this.login = function (parameters, callback) {
            console.log(parameters);
            var url = baseUrl + 'Login';
            var self = this;

            return WebApiService.post(url, parameters.user)
                .then(function (response) {
                    console.log(response);

                    if (!response || !response.data) {
                        console.log("Invalid credentials or user not found.");
                        if (callback) callback(false);
                        return;
                    }

                    // Proceed with checking the current user after a successful login
                    self.current().then(function (user) {
                        console.log(user);

                        if (user && user.isDeactivated) {
                            console.log("User is deactivated.");
                            if (callback) callback("Deactivated");
                            return;
                        }

                        if (callback) callback(true);

                        if (user && user.Role === 1) {
                            window.location.href = '/AdminDashboard/Category';
                        } else if (user && user.Role === 0) {
                            location.reload();
                        }
                    }).catch(function (error) {
                        console.error('Error fetching current user:', error);
                        if (callback) callback(false);
                    });
                })
                .catch(function (error) {
                    console.error('Error login:', error);
                    if (callback) callback(false);
                });
        };




        this.logout = function (callback) {
            var url = baseUrl + 'Logout';

            return WebApiService.post(url)
                .then(function (response) {

                     console.log( "Logout");
                    if (callback) {
                        callback(true);
                    }
                    window.location.href = '/CarShop/Index';
                })
                .catch(function (error) {
                    console.error('Error logout:', error);
                    if (callback) {
                        callback(false);
                    }
                });
        };

        this.current = function (callback) {
            var url = baseUrl + 'current';

            return WebApiService.get(url)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error logout:', error);
                    if (callback) {
                        callback(false);
                    }
                });
        };

        this.getUserById = function (userId, callback) {
            var url = baseUrl + 'getUserById/' + userId;

            return WebApiService.get(url)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error fetching user by ID:', error);
                    if (callback) {
                        callback(false);
                    }
                });
        };

        this.getUserByPhoneNb = function (phoneNb, callback) {
            var url = baseUrl + 'getUserByPhoneNb/' + phoneNb;

            return WebApiService.get(url)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error fetching user by ID:', error);
                    if (callback) {
                        callback(false);
                    }
                });
        };

        this.sendOtp = function (phoneNumber, otp, callback) {
            var url = baseUrl + 'sendOtp';
            var params = {
                PhoneNumber: phoneNumber,
                Otp: otp
            };

            return WebApiService.post(url, params)
                .then(function (response) {
                    console.log('OTP sent successfully:', response);
                    if (callback) {
                        callback(true);  // Success callback
                    }
                })
                .catch(function (error) {
                    console.error('Error sending OTP:', error);
                    if (callback) {
                        callback(false);  // Failure callback
                    }
                });
        };

        this.checkJoinStatus = function (phoneNumber) {
            return $http.get('/User/checkJoinStatus', { params: { phoneNumber: phoneNumber } });
        };

        this.getAllUsers = function (params) {
            console.log(params)
            var url = baseUrl + 'getAllUsers';
            //  console.log(url + '/' + params);
            return WebApiService.get(url, { params: params })
                .then(function (response) {
                    // console.log(response.data);
                    return response.data;
                })
                .catch(function (error) {
                    console.error('Error fetching users:', error);
                });
        }

        this.updateUserRole = function (params, callback) {
            var url = baseUrl + 'updateUserRole';

            return WebApiService.post(url,  params)
                .then(function (response) {
                    if (callback) callback(true);
                })
                .catch(function (error) {
                    console.error('Error fetching users:', error);
                });
        };

        this.updateUserStatus = function (params, callback) {
            var url = baseUrl + 'updateUserStatus';

            return WebApiService.post(url, params)
                .then(function (response) {
                    if (callback) callback(true);
                })
                .catch(function (error) {
                    console.error('Error fetching users:', error);
                });
        };


    }]);
