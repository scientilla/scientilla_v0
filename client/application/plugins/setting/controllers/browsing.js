/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("setting").controller(
    "settingsBrowsingController", ["$scope", "settingsService", "$window", "$location", function($scope, settingsService, $window, $location) {
        $scope.aSettings = [];
        $scope.empty = false;
        $scope.ready = false;
        /*
        settingsService.getSettings().success(function(data, status, headers, config) {
            $scope.aSettings = data;
            if ($scope.aSettings.length === 0) {
                $scope.empty = true;
            }            
            $scope.ready = true;
        }).error(function(data, status, headers, config) {
            systemStatusService.react(status);
        });
        */
    }]
);