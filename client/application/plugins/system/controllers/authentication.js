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
                $window.sessionStorage.token = data.token;
                $window.sessionStorage.userType = data.user_type;
                $window.sessionStorage.userRights = data.user_rights;
                $window.sessionStorage.userScientillaNominative = data.user_scientilla_nominative;
                $window.sessionStorage.peerMode = data.peer_mode;
                $scope.$emit("successful-login");
                $location.path("browse-references");
            }).error(function(data, status, headers, config) {
                delete $window.sessionStorage.token;
                delete $window.sessionStorage.userType;
                delete $window.sessionStorage.userRights;
                delete $window.sessionStorage.userScientillaNominative;
                delete $window.sessionStorage.peerMode;
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