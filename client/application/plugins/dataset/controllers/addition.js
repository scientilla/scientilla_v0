/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("dataset").controller(
    "datasetAdditionController", ["$scope", "datasetsService", "systemStatusService", "$window", "$location", function($scope, datasetsService, systemStatusService, $window, $location) {
        $scope.oDataset = {
            name: "",
            status: "",
            initiated_at: "",
            completed_at: ""
        };
        
        $scope.createDataset = function() {
            datasetsService.createDataset({
                name: $scope.oDataset.name,
                status: $scope.oDataset.status,
                initiated_at: $scope.oDataset.initiated_at,
                completed_at: $scope.oDataset.completed_at
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $location.path("browse-datasets");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };       
    }]
);