AuthenticationController.$inject = ['$scope', '$q', 'ModalService', 'AuthenticationService','$uibModalInstance'];

function AuthenticationController($scope, $q, ModalService, AuthenticationService, $uibModalInstance) {

    console.log("AuthenticationController loaded");

    var verificationSentCode;
    $scope.activeTab = 'login';
    $scope.parameters = {};
    $scope.loginData = {};
    $scope.signupData = {};
    $scope.verificationDigits = ['', '', '', '', '', ''];
    $scope.switchTab = function (tab) {
        $scope.activeTab = tab;
        $scope.loginPhoneNumber = "";
        $scope.loginPassword = "";
        $scope.signupName = "";
        $scope.signupPhoneNumber = "";
        $scope.signupPassword = "";
        $scope.signupConfirmPassword = "";
    };

  /*  $scope.sendOtp = function () {
        var phoneNb = "+961" + $scope.signupPhoneNumber;
        var otp = Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
        $scope.generatedOtp = otp; // Save the OTP for verification
        AuthenticationService.sendOtp(phoneNb, otp, function (success) {
            if (success) {
                $scope.isVerificationStep = true;
                alert('OTP sent successfully!');
            } else {
                alert('Failed to send OTP.');
            }
        });
    }

    $scope.signup = function () {
        // Check if the user has entered the OTP
        if (!$scope.verificationCode) {
            alert("Please enter the OTP sent to your phone.");
            return;
        }

        // Verify if the entered OTP matches the generated OTP
        if ($scope.verificationCode == $scope.generatedOtp) {
            // Proceed with signup if OTP is correct
            $scope.parameters.user = {};
            $scope.parameters.user.FullName = $scope.signupName;
            $scope.parameters.user.PhoneNumber = $scope.signupPhoneNumber;
            $scope.parameters.user.Password = $scope.signupPassword;

            console.log($scope.parameters);

            AuthenticationService.signUp($scope.parameters, function (success) {
                if (success) {
                    // Update scope with success message
                    $scope.signupMessage = "Signup successful! Welcome to PremiumStore!";
                    $scope.signupMessageClass = "success"; // This can be used to style the success message
                } else {
                    // Update scope with error message
                    $scope.signupMessage = "An error occurred during signup. Please try again.";
                    $scope.signupMessageClass = "error"; // This can be used to style the error message
                }
                $scope.isVerificationStep = false;
            });
        } else {
            // OTP is incorrect
            alert("Incorrect OTP. Please try again.");
        }
    };
    */
    $scope.sendOtp = function () {
        if ($scope.lastOtpPhoneNumber && $scope.signupPhoneNumber !== $scope.lastOtpPhoneNumber) {
            // If the phone number has changed, reset confirmation state and prompt the user to confirm again.
            $scope.isConfirmed = false;
            $scope.isAwaitingUserConfirmation = true; // This shows the confirmation message
            $scope.verificationMessage = "Please navigate to WhatsApp +14155238886 and send 'join mean-contrast' to receive the code.";
            $scope.verificationMessageClass = "info";

            $scope.countdown = 120;
            $scope.lastOtpPhoneNumber = $scope.signupPhoneNumber; // Update the last OTP phone number.
            return; // Stop further execution to wait for confirmation.
        }
        // Show "Awaiting User Confirmation" message
        if (!$scope.isConfirmed) {
            // Display awaiting confirmation message to the user
            $scope.isAwaitingUserConfirmation = true; // This shows the confirmation message
            $scope.verificationMessage = "Please navigate to WhatsApp +14155238886 and send 'join mean-contrast' to receive the code.";
            $scope.verificationMessageClass = "info";
            return; // Stop the OTP process until the user confirms
        }

        if (!$scope.signupName || !$scope.signupPhoneNumber || !$scope.signupPassword || !$scope.signupConfirmPassword) {
            $scope.signupMessage = 'Please fill in all fields';
            $scope.signupMessageClass = 'error';
            return;
        }

        if ($scope.signupPassword !== $scope.signupConfirmPassword) {
            $scope.signupMessage = 'Passwords do not match';
            $scope.signupMessageClass = 'error';
            return;
        }

        // If countdown is active and phone number is the same, navigate to verify without sending new OTP
        if ($scope.otpTimerActive && $scope.countdown > 0 && $scope.signupPhoneNumber === $scope.lastOtpPhoneNumber) {
            $scope.isVerificationStep = true;
            return;
        }

       

        // Proceed to send OTP if countdown is not active or phone number is different
        AuthenticationService.getUserByPhoneNb($scope.signupPhoneNumber).then(function (response) {
            if (response && response.Id) {
                $scope.signupMessage = 'Phone number already exists!';
                $scope.signupMessageClass = 'error';
                return;
            } else {
                $scope.signupMessage = '';
                $scope.signupMessageClass = '';
                $scope.isSendingOtp = true;
                var phoneNb = "+961" + $scope.signupPhoneNumber;
                $scope.generatedOtp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
                $scope.lastOtpPhoneNumber = $scope.signupPhoneNumber; // Save phone number for verification

                // Display the WhatsApp instructions message
                $scope.verificationMessage = "Please navigate to WhatsApp +14155238886 and send 'join mean-contrast' to receive the code.";
                $scope.verificationMessageClass = "info"; // You can add CSS for this class

                // Send OTP using AuthenticationService
                AuthenticationService.sendOtp(phoneNb, $scope.generatedOtp, function (success) {
                    $scope.isSendingOtp = false;
                    if (success) {
                        $scope.isVerificationStep = true;
                        $scope.startCountdown();
                        $scope.verificationMessage = 'Verification code sent successfully!';
                        $scope.verificationMessageClass = 'success';
                    } else {
                        $scope.verificationMessage = 'Failed to send OTP. Please try again.';
                        $scope.verificationMessageClass = 'error';
                    }
                });

                // Reset countdown if phone number is different
                if ($scope.signupPhoneNumber !== $scope.lastOtpPhoneNumber) {
                    $scope.countdown = 120; // Ensure the counter resets
                    $scope.isConfirmed = false;
                }

                return;
            }
        });
    };

    // This function gets triggered when the user confirms they have received the WhatsApp message
    $scope.confirmMessageSent = function () {
        $scope.isConfirmed = true; // Mark confirmation as true
        $scope.isAwaitingUserConfirmation = false; // Hide the "Awaiting User Confirmation" message
        $scope.verificationMessage = "";
        $scope.verificationMessageClass = "";
        // Now, send the OTP after confirmation
        $scope.sendOtp(); // Call sendOtp function to proceed with OTP sending
    };



    $scope.verifyOtp = function () {
        var enteredCode = $scope.verificationDigits.join('');

        if (enteredCode.length !== 6) {
            $scope.verificationMessage = 'Please enter the full 6-digit code';
            $scope.verificationMessageClass = 'error';
            return;
        }

        $scope.isVerifying = true;

        if (enteredCode == $scope.generatedOtp) {
            $scope.isVerificationStep = false;
            $scope.parameters.user = {};
            $scope.parameters.user.FullName = $scope.signupName;
            $scope.parameters.user.PhoneNumber = $scope.signupPhoneNumber;
            $scope.parameters.user.Password = $scope.signupPassword;

            AuthenticationService.signUp($scope.parameters, function (success) {
                $scope.isVerifying = false;
                if (success) {
                    // Update scope with success message
                    $scope.signupMessage = "Signup successful! Welcome to PremiumStore!";
                    $scope.signupMessageClass = "success"; // This can be used to style the success message
                    $scope.signupName = "";
                    $scope.signupPassword = "";
                    $scope.signupConfirmPassword = "";
                    $scope.signupPhoneNumber = "";
                } else {
                    // Update scope with error message
                    $scope.signupMessage = "An error occurred during signup. Please try again.";
                    $scope.signupMessageClass = "error"; // This can be used to style the error message
                }
            });
        } else {
            $scope.isVerifying = false;
            $scope.verificationMessage = "Incorrect verification code. Please try again.";
            $scope.verificationMessageClass = "error";
        }
    };

    $scope.resendOtp = function () {
        var phoneNb = "+961" + $scope.signupPhoneNumber;
        $scope.generatedOtp = Math.floor(100000 + Math.random() * 900000);

        AuthenticationService.sendOtp(phoneNb, $scope.generatedOtp, function (success) {
            if (success) {
                $scope.verificationMessage = 'New verification code sent!';
                $scope.verificationMessageClass = 'success';
                $scope.startCountdown();
            } else {
                $scope.verificationMessage = 'Failed to resend code. Please try again.';
                $scope.verificationMessageClass = 'error';
            }
        });
    };

    $scope.startCountdown = function () {
        if ($scope.otpTimerActive) return; // Prevent starting multiple timers

        $scope.otpTimerActive = true;
        $scope.canResend = false;
        if (!$scope.countdown || $scope.countdown <= 0) {
            $scope.countdown = 120; // Default countdown value
        }

        var timer = setInterval(function () {
            $scope.$apply(function () {
                $scope.countdown--;
                if ($scope.countdown <= 0) {
                    clearInterval(timer);
                    $scope.canResend = true;
                    $scope.otpTimerActive = false;
                }
            });
        }, 1000);
    };

    $scope.focusNext = function (index) {
        if ($scope.verificationDigits[index] && index < 5) {
            var nextInput = document.querySelectorAll('.verification-input')[index + 1];
            nextInput.focus();
        }
    };

    $scope.goBackToSignup = function () {
        $scope.isVerificationStep = false;
        $scope.verificationDigits = ['', '', '', '', '', ''];
        $scope.verificationMessage = '';
    };

    $scope.login = function () {
   

        // Validate user input
        if (!$scope.loginPhoneNumber || !$scope.loginPassword) {
            $scope.loginMessage = "Phone number and password are required.";
            $scope.loginMessageClass = "error";
            return;
        }

        if ($scope.loginPassword.length < 8) {
            $scope.loginMessage = "Password must be at least 8 characters long.";
            $scope.loginMessageClass = "error";
            return;
        }

        // Prepare user parameters
        $scope.parameters.user = {
            PhoneNumber: $scope.loginPhoneNumber,
            Password: $scope.loginPassword
        };

        console.log($scope.parameters);

        // Attempt login
        AuthenticationService.login($scope.parameters, function (result) {
            console.log("Login result:", result);

            if (result === true) {
                console.log("Login Sucessfully");
                // Login successful
                $uibModalInstance.close(); // Close modal
            } else if (result === "Deactivated") {
                // User is deactivated
                $scope.loginMessage = "Your account has been deactivated. Please contact support.";
                $scope.loginMessageClass = "error";
                // Optionally, keep the modal open for user to see the message
            } else {
                // Login failed
                $scope.loginMessage = "Invalid phone number or password. Please try again.";
                $scope.loginMessageClass = "error";
            }
        });
    };



    $scope.closeModal = function () {
        console.log("modal closed");
        $uibModalInstance.close();
    }

    function formatLebanesePhone(localPhone) {
        // Remove all non-digit characters
        localPhone = localPhone.replace(/\D/g, '');

        if (localPhone.startsWith('0')) {
            return '+961' + localPhone.substring(1);
        } else if (localPhone.startsWith('961')) {
            return '+' + localPhone;
        } else if (localPhone.startsWith('7') && localPhone.length === 8) {
            // Assume it's a mobile number missing the leading zero
            return '+961' + localPhone;
        } else if (localPhone.startsWith('+961')) {
            return localPhone;
        }

        return null; // invalid format
    }
    $scope.onlyDigits = function (event) {
        // Allow only digits (0-9)
        var keyCode = event.which || event.keyCode;

        // Prevent non-digit keys (except backspace)
        if ((keyCode < 48 || keyCode > 57) && keyCode !== 8) {
            event.preventDefault();
        }

        // Prevent space key
        if (keyCode === 32) {
            event.preventDefault();
        }
    };

    $scope.addWhatsAppLink = function () {
        // Add the WhatsApp link and icon dynamically to the message
        var messageElement = document.getElementById("verification-message");
        if (messageElement) {
            messageElement.innerHTML = "Please navigate to <a href='https://wa.me/14155238886' target='_blank'>" +
                "<img src='https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' alt='WhatsApp' style='width: 20px; height: 20px; vertical-align: middle;' />" +
                "+14155238886</a> and send 'join mean-contrast' to receive the code.";
        }
    };
};


angular.module('Ecommerce')
    .controller("AuthenticationController", AuthenticationController);
