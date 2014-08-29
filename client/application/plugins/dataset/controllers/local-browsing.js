/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */
         
angular.module("dataset").controller(
    "localDatasetsBrowsingController", ["$scope", "datasetsService", "activatedDatasetsService", "peersService", "peerReferencesService", "datasetReferencesService", "systemStatusService", "$window", "$location", function($scope, datasetsService, activatedDatasetsService, peersService, peerReferencesService, datasetReferencesService, systemStatusService, $window, $location) {
        $scope.changingCollectedDatasetId = "";
        $scope.changingSharedDatasetId = "";
        $scope.aDatasets = [];        
        
        $scope.generateDatasetIdsSharingMap = function(aDatasets) {
            var datasetIdsSharingMap = {};
            for (lpKey in aDatasets) {
                datasetIdsSharingMap[aDatasets[lpKey]._id] = aDatasets[lpKey].sharing_status;
            }
            return datasetIdsSharingMap;
        }
        
        $scope.collect = function(id) {

        }        
        
        $scope.setDatasetAsActivated = function(id) {
            $scope.changingActivatedDatasetId = id;
            activatedDatasetsService.setDatasetAsActivated(
                id, 
                "",
                $window.sessionStorage.token
            ).success(function(data, status, headers, config) {
                $scope.activatedDatasetId = id;
                $scope.activatedDatasetPeerId = "";
                $scope.changingActivatedDatasetId = ""; 
            }).error(function(data, status, headers, config) {
                $scope.changingActivatedDatasetId = "";
                systemStatusService.react(status);
            });
        }
        
        $scope.switchDatasetSharingStatus = function(id) {
            $scope.changingSharedDatasetId = id;
            if (!$scope.datasetIdsSharingMap[id]) {
                datasetsService.setDatasetAsShared(
                    id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.datasetIdsSharingMap[id] = true;
                    $scope.changingSharedDatasetId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedDatasetId = "";
                    systemStatusService.react(status);
                });
            } else {
                datasetsService.setDatasetAsNotShared(
                    id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.datasetIdsSharingMap[id] = false;
                    $scope.changingSharedDatasetId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedDatasetId = "";
                    systemStatusService.react(status);
                });
            }
        }
        
        $scope.retrieveDatasets = function retrieveDatasets() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    datasetsService.getDatasets($window.sessionStorage.token).success(function(data, status, headers, config) {
                        $scope.aDatasets = data;
                        if ($scope.aDatasets.length === 0) {
                            $scope.empty = true;
                        }                    
                        callback();
                    }).error(function(data, status, headers, config) {
                        $scope.error = true;
                        systemStatusService.react(status, callback);
                    });
                },
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
                    $scope.activatedDatasetId = $scope.oActivatedDataset.id;
                    $scope.activatedDatasetPeerId = $scope.oActivatedDataset.peerId;
                    callback();
                },
                function(callback) {
                    $scope.datasetIdsSharingMap = $scope.generateDatasetIdsSharingMap($scope.aDatasets);
                    callback();
                },
                function(callback) {
                    $scope.ready = true;
                    callback();
                }
            ]);
            
            return retrieveDatasets;
        }();
    }]
);