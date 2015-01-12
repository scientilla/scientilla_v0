/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("user").controller(
    "userAdditionController", ["$scope", "usersService", "systemStatusService", "$window", "$location", function($scope, usersService, systemStatusService, $window, $location) {
        $scope.oUser = {
            type: "",
            rights: "",
            scientilla_nominative: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            business_name: "",
            birth_date: "",
            birth_city: "",
            birth_state: "",
            birth_country: "",
            sex: "",
            email: "",
            username: "",
            password: "",
            password_repetition: "",
            status: ""
        };
        
        $scope.createUser = function() {
            usersService.createUser({
                type: $scope.oUser.type,
                rights: $scope.oUser.rights,
                scientilla_nominative: $scope.oUser.scientilla_nominative,
                first_name: $scope.oUser.first_name,
                middle_name: $scope.oUser.middle_name,
                last_name: $scope.oUser.last_name,
                business_name: $scope.oUser.business_name,
                birth_date: $scope.oUser.birth_date,
                birth_city: $scope.oUser.birth_city,
                birth_state: $scope.oUser.birth_state,
                birth_country: $scope.oUser.birth_country,
                sex: $scope.oUser.sex,
                email: $scope.oUser.email,
                username: $scope.oUser.username,
                password: $scope.oUser.password,
                password_repetition: $scope.oUser.password_repetition,
                status: $scope.oUser.status
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $location.path("browse-users");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };
    }]
);