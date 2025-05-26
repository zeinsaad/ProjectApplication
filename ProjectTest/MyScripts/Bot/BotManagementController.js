angular.module('Ecommerce', ['ui.bootstrap'])
    .controller('ChatBotController', ['$scope', '$http', '$timeout', '$sce', '$uibModal', 'ModalService', 'AuthenticationService',
        function ($scope, $http, $timeout, $sce, $uibModal, ModalService, AuthenticationService) {
            // Initial messages array
            $scope.messages = [];
            $scope.newMessage = '';
            $scope.isTyping = false;
            $scope.suggestions = [];

            // All possible suggestions based on intents
            $scope.allSuggestions = [
                { text: "What products do you have?", intent: "product" },
                { text: "Do you have any discounts?", intent: "discount" },
                { text: "What are your store hours?", intent: "hours" },
                { text: "Where are you located?", intent: "location" },
                { text: "What's your phone number?", intent: "phone" },
                { text: "What's your email address?", intent: "email" },
                { text: "What are your shipping options?", intent: "shipping" },
                { text: "What payment methods do you accept?", intent: "payment" },
                { text: "Can you help me track my order?", intent: "track" }
            ];

            $scope.login = function () {
                ModalService.openModal('/MyModals/authModal.html', AuthenticationController, null, 'xl', function (result) {

                });
            };

            $scope.logout = function () {
                console.log("Logout clicked");
                AuthenticationService.logout();
            }

            // Get current time
            $scope.getCurrentTime = function () {
                return new Date();
            };

            // Update suggestions based on current input
            $scope.updateSuggestions = function () {
                if (!$scope.newMessage || $scope.newMessage.trim().length < 2) {
                    $scope.suggestions = $scope.allSuggestions.slice(0, 5);
                    return;
                }

                var input = $scope.newMessage.toLowerCase();
                var matchedSuggestions = [];

                // Check for specific intent keywords
                if (input.includes('discount') || input.includes('sale') || input.includes('offer')) {
                    matchedSuggestions = $scope.allSuggestions.filter(s => s.intent === 'discount');
                }
                else if (input.includes('hour') || input.includes('open') || input.includes('close')) {
                    matchedSuggestions = $scope.allSuggestions.filter(s => s.intent === 'hours');
                }
                else if (input.includes('location') || input.includes('address') || input.includes('where')) {
                    matchedSuggestions = $scope.allSuggestions.filter(s => s.intent === 'location');
                }
                else if (input.includes('phone') || input.includes('number') || input.includes('call')) {
                    matchedSuggestions = $scope.allSuggestions.filter(s => s.intent === 'phone');
                }
                else if (input.includes('email') || input.includes('contact')) {
                    matchedSuggestions = $scope.allSuggestions.filter(s => s.intent === 'email');
                }
                else if (input.includes('ship') || input.includes('deliver')) {
                    matchedSuggestions = $scope.allSuggestions.filter(s => s.intent === 'shipping');
                }
                else if (input.includes('pay') || input.includes('payment')) {
                    matchedSuggestions = $scope.allSuggestions.filter(s => s.intent === 'payment');
                }
                else if (input.includes('track') || input.includes('order')) {
                    matchedSuggestions = $scope.allSuggestions.filter(s => s.intent === 'track');
                }
                else if (input.includes('product') || input.includes('item')) {
                    matchedSuggestions = $scope.allSuggestions.filter(s => s.intent === 'product' || s.intent === 'search');
                }
                else if (input.includes('category') || input.includes('type')) {
                    matchedSuggestions = $scope.allSuggestions.filter(s => s.intent === 'category');
                }
                else {
                    // Default: show suggestions that partially match the input
                    matchedSuggestions = $scope.allSuggestions.filter(s =>
                        s.text.toLowerCase().includes(input) ||
                        input.includes(s.intent)
                    ).slice(0, 5);
                }

                $scope.suggestions = matchedSuggestions.length > 0 ? matchedSuggestions : [];
            };


            // Select a suggestion
            $scope.selectSuggestion = function (suggestion) {
                $scope.newMessage = suggestion.text;
                $scope.sendMessage();
            };

            // Function to send message
            $scope.sendMessage = function () {
                if (!$scope.newMessage.trim()) return;

                // Add user message to chat
                $scope.messages.push({
                    sender: 'user',
                    text: $sce.trustAsHtml($scope.newMessage),
                    timestamp: new Date()
                });

                // Save the message and clear input
                const userMessage = $scope.newMessage;
                $scope.newMessage = '';
                $scope.suggestions = []; // Clear suggestions when sending

                // Show typing indicator
                $scope.isTyping = true;

                // Scroll to bottom of chat
                $timeout(function () {
                    const chatMessages = document.getElementById('chatMessages');
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 0);

                // Simulate API call (replace with your actual endpoint)
                $http.post("https://localhost:44343/chatBot/sendMessage", { Message: userMessage })
                    .then(function (message) {
                        // Hide typing indicator
                        console.log(message.data);
                        $scope.isTyping = false;

                        const botText = message.data ? message.data.replace(/\n/g, "<br>") : "I received your message. How can I help you further?";
                        $scope.messages.push({
                            sender: 'bot',
                            text: $sce.trustAsHtml(botText),
                            timestamp: new Date()
                        });

                        // Scroll to bottom again after response
                        $timeout(function () {
                            const chatMessages = document.getElementById('chatMessages');
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }, 0);

                        // Show relevant suggestions after bot response
                        $timeout(function () {
                            $scope.updateSuggestions();
                        }, 300);
                    })
                    .catch(function (error) {
                        // Hide typing indicator
                        $scope.isTyping = false;

                        // Show error message
                        $scope.messages.push({
                            sender: 'bot',
                            text: "Sorry, I encountered an error. Please try again later.",
                            timestamp: new Date()
                        });

                        console.error("Error sending message:", error);
                    });
            };

            // Initialize with some suggestions
            // $scope.updateSuggestions();
        }]);