/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */
         
angular.module("dataset").controller(
    "activatedPeerDatasetsBrowsingController", ["$scope", "peerDatasetsService", "activatedPeersService", "peersService", "activatedDatasetsService", "systemStatusService", "$window", "$location", function($scope, peerDatasetsService, activatedPeersService, peersService, activatedDatasetsService, systemStatusService, $window, $location) { 
        $scope.empty = false;
        $scope.ready = false;
        async.series([
            function(callback) {
                $scope.oActivatedPeer = {};
                activatedPeersService.getActivatedPeer($window.sessionStorage.token).success(function(data, status, headers, config) {
                    $scope.oActivatedPeer.id = data.peer_id;
                    callback();
                }).error(function(data, status, headers, config) {
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
                $scope.aDatasets = [];
                peerDatasetsService.getDatasets(
                    $scope.oActivatedPeer.id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.aDatasets = data;
                    if ($scope.aDatasets.length === 0) {
                        $scope.empty = true;
                    }                     
                    callback();
                }).error(function(data, status, headers, config) {
                    systemStatusService.react(status, callback);
                });
            },
            function(callback) {
                $scope.ready = true;
                callback();
            }
        ]);
        
        $scope.changingActivatedDatasetId = "";
        $scope.setDatasetAsActivated = function(id, peerId) {
            $scope.changingActivatedDatasetId = id;
            activatedDatasetsService.setDatasetAsActivated(
                id, 
                peerId,
                $window.sessionStorage.token
            ).success(function(data, status, headers, config) {
                $scope.activatedDatasetId = id;
                $scope.activatedDatasetPeerId = peerId;
                $scope.changingActivatedDatasetId = ""; 
            }).error(function(data, status, headers, config) {
                $scope.changingActivatedDatasetId = "";
                systemStatusService.react(status);
            });
        }        
    }]
);