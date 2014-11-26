/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("system").controller(
    "systemAuthenticationController", ["$scope", "usersService", "settingsService", "systemStatusService", "$window", "$location", function($scope, usersService, settingsService, systemStatusService, $window, $location) {
        $scope.oUser = {
            username: "", 
            password: ""
        };
        
        $scope.login = function() {
            usersService.loginUser({
                username: $scope.oUser.username,
                password: $scope.oUser.password
            }).success(function(data, status, headers, config) {
                usersService.updateExchangedInformation(data, function() {
                    settingsService.updateExchangedInformation(data, function() {
                        $scope.$emit("successful-login");                        
                        $scope.$emit("exchanged-information-modification");
                        $location.path("browse-references");
                    });
                });
            }).error(function(data, status, headers, config) {
                usersService.deleteExchangedInformation();
                settingsService.deleteExchangedInformation();
                systemStatusService.react(status);
            });
        };
        
        $scope.logout = function() {
            usersService.deleteExchangedInformation(function() {
                settingsService.deleteExchangedInformation(function() {
                    $scope.$emit("successful-logout");
                    // $window.location.href = "/";
                    $location.path("login");
                });
            });
        };
    }]
);