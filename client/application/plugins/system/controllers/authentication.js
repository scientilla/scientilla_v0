/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("system").controller(
    "systemAuthenticationController", ["$scope", "usersService", "systemStatusService", "$window", "$location", function($scope, usersService, systemStatusService, $window, $location) {
        $scope.oUser = {
            username: "", 
            password: ""
        };
        
        $scope.login = function() {
            usersService.loginUser({
                username: $scope.oUser.username,
                password: $scope.oUser.password
            }).success(function(data, status, headers, config) {
                usersService.updateUserInfo(data);
                $scope.$emit("successful-login");
                $location.path("browse-references");
            }).error(function(data, status, headers, config) {
                usersService.deleteUserInfo();
                systemStatusService.react(status);
            });
        };
        
        $scope.logout = function() {            
            delete $window.sessionStorage.token;
            delete $window.sessionStorage.userType;
            delete $window.sessionStorage.userRights;
            delete $window.sessionStorage.userScientillaNominative;
            delete $window.sessionStorage.peerMode;
            $window.location.href = "/";
        };
    }]
);