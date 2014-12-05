/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("user").controller(
    "usersBrowsingController", 
    ["$scope", "usersService", "systemStatusService", "$window", "$location", "notificationService", 
    function($scope, usersService, systemStatusService, $window, $location, notificationService) {
        $scope.aUsers = [];
        
        $scope.deleteUser = function(userId) {
            usersService.deleteUser(userId, $window.sessionStorage.userToken)
                .success(function(data, status, headers, config) {
                    _.remove($scope.aUsers, {_id: userId} );
                    notificationService.info("User deleted");
                })
                .error(function(data, status, headers, config) {
                    switch(status) {
                        case 400:
                            systemStatusService.react(status);
                            notificationService.warning('User cannot be delete.');
                            break;
                        case 500:
                            systemStatusService.react(status);
                            notificationService.error('An error happened');
                            break;
                        default:
                            systemStatusService.react(status);
                            notificationService.error('An error happened');
                    }
                });
        };
        
        $scope.retrieveUsers = function retrieveUsers() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            usersService.getUsers($window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $scope.aUsers = data;
                if ($scope.aUsers.length === 0) {
                    $scope.empty = true;
                }            
                $scope.ready = true;
            }).error(function(data, status, headers, config) {
                $scope.error = true;
                systemStatusService.react(status);
            });
            
            return retrieveUsers;
        }();
    }]
);