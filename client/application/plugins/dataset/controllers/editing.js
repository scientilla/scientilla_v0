/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("dataset").controller(
    "datasetEditingController", ["$scope", "$routeParams", "datasetsService", "systemStatusService", "$window", "$location", function($scope, $routeParams, datasetsService, systemStatusService, $window, $location) {
        $scope.oDataset = {
            name: "",
            status: "",
            initiated_at: "",
            completed_at: ""
        };
        
        $scope.retrieveDataset = function retrieveDataset() {
            datasetsService.getDataset(
                $routeParams.id,
                $window.sessionStorage.token
            ).success(function(data, status, headers, config) {
                for (key in data) {
                    $scope.oDataset[key] = data[key];
                }
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
            
            return retrieveDataset;
        }();
        
        $scope.updateDataset = function() {
            datasetsService.updateDataset({
                name: $scope.oDataset.name,
                status: $scope.oDataset.status,
                initiated_at: $scope.oDataset.initiated_at,
                completed_at: $scope.oDataset.completed_at,
                id: $scope.oDataset._id
            }, $window.sessionStorage.token).success(function(data, status, headers, config) {
                $location.path("browse-datasets");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };       
    }]
);