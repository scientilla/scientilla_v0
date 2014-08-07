/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("reference").controller(
    "activatedDatasetReferencesBrowsingController", ["$scope", "datasetReferencesService", "peerDatasetReferencesService", "activatedDatasetsService", "datasetsService", "systemStatusService", "$window", "$location", function($scope, datasetReferencesService, peerDatasetReferencesService, activatedDatasetsService, datasetsService, systemStatusService, $window, $location) {
        $scope.empty = false;
        $scope.ready = false;
        async.series([
            function(callback) {
                $scope.oActivatedDataset = {};
                activatedDatasetsService.getActivatedDataset($window.sessionStorage.token).success(function(data, status, headers, config) {
                    $scope.oActivatedDataset.id = data.dataset_id;
                    $scope.oActivatedDataset.peerId = data.peer_id;
                    callback();
                }).error(function(data, status, headers, config) {
                    systemStatusService.react(status, callback);
                });
            },
            function(callback) {
                $scope.aReferences = [];
                if ($scope.oActivatedDataset.peerId === "") {
                    datasetReferencesService.getReferences(
                        $scope.oActivatedDataset.id,
                        $window.sessionStorage.token
                    ).success(function(data, status, headers, config) {
                        $scope.aReferences = data;
                        if ($scope.aReferences.length === 0) {
                            $scope.empty = true;
                        }                    
                        callback();
                    }).error(function(data, status, headers, config) {
                        systemStatusService.react(status, callback);
                    });
                } else {
                    peerDatasetReferencesService.getReferences(
                        $scope.oActivatedDataset.peerId,
                        $scope.oActivatedDataset.id,
                        $window.sessionStorage.token
                    ).success(function(data, status, headers, config) {
                        $scope.aReferences = data;
                        if ($scope.aReferences.length === 0) {
                            $scope.empty = true;
                        }                    
                        callback();
                    }).error(function(data, status, headers, config) {
                        systemStatusService.react(status, callback);
                    });                    
                }
            },
            function(callback) {
                $scope.ready = true;
                callback();
            }
        ]);        
    }]
);