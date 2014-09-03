/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "datasetReferencesBrowsingController", ["$scope", "$routeParams", "datasetReferencesService", "peerDatasetReferencesService", "activatedDatasetsService", "datasetsService", "systemStatusService", "$window", "$location", function($scope, $routeParams, datasetReferencesService, peerDatasetReferencesService, activatedDatasetsService, datasetsService, systemStatusService, $window, $location) {
        $scope.peerId = $routeParams.peerId;
        $scope.datasetId = $routeParams.datasetId;
        $scope.keywords = "";
        $scope.aReferences = [];        
        
        $scope.retrieveReferences = function retrieveReferences() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {                   
                    peerDatasetReferencesService.getReferences(
                        $scope.peerId,
                        $scope.datasetId,
                        $window.sessionStorage.token
                    ).success(function(data, status, headers, config) {
                        $scope.aReferences = data;
                        if ($scope.aReferences.length === 0) {
                            $scope.empty = true;
                        }                    
                        callback();
                    }).error(function(data, status, headers, config) {
                        $scope.error = true;
                        systemStatusService.react(status, callback);
                    });                    
                },
                function(callback) {
                    $scope.ready = true;
                    callback();
                }
            ]);
            
            return retrieveReferences;
        }();
    }]
);