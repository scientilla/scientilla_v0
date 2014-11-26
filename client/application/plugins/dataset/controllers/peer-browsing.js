/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */
         
angular.module("dataset").controller(
    "peerDatasetsBrowsingController", ["$scope", "$routeParams", "peerDatasetsService", "activatedPeersService", "peersService", "activatedDatasetsService", "systemStatusService", "$window", "$location", function($scope, $routeParams, peerDatasetsService, activatedPeersService, peersService, activatedDatasetsService, systemStatusService, $window, $location) { 
        $scope.peerId = $routeParams.peerId;
        $scope.changingActivatedDatasetId = "";
        $scope.keywords = "";
        $scope.aDatasets = [];
        $scope.startPageNumber = 1;
        $scope.currentPageNumber = 1;
        $scope.numberOfItemsPerPage = 25;
        $scope.totalNumberOfItems = 10000;        
        
        $scope.retrieveDatasets = function retrieveDatasets() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    $scope.oActivatedDataset = {};
                    activatedDatasetsService.getActivatedDataset($window.sessionStorage.userToken).success(function(data, status, headers, config) {
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
                    peerDatasetsService.getDatasets(
                        $scope.peerId,
                        $scope.keywords,
                        $window.sessionStorage.userToken
                    ).success(function(data, status, headers, config) {
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
                    $scope.ready = true;
                    callback();
                }
            ]);
            
            return retrieveDatasets 
        }();
        
        $scope.setDatasetAsActivated = function(id, peerId) {
            $scope.changingActivatedDatasetId = id;
            activatedDatasetsService.setDatasetAsActivated(
                id, 
                peerId,
                $window.sessionStorage.userToken
            ).success(function(data, status, headers, config) {
                $scope.activatedDatasetId = id;
                $scope.activatedDatasetPeerId = peerId;
                $scope.changingActivatedDatasetId = ""; 
            }).error(function(data, status, headers, config) {
                $scope.changingActivatedDatasetId = "";
                systemStatusService.react(status);
            });
        }
        
        $scope.retrievePreviousItemsPage = function() {
            if ($scope.startPageNumber > 1) {
                $scope.startPageNumber--;
            }            
            if ($scope.currentPageNumber > 1) {
                $scope.currentPageNumber--;
            }
        };
        
        $scope.retrieveCustomItemsPage = function(customPageNumber) {            
            if (customPageNumber >= 1 && customPageNumber <= Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage)) {
                $scope.currentPageNumber = customPageNumber;
            }
        };         
        
        $scope.retrieveNextItemsPage = function() {
            if ($scope.startPageNumber < (Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage) - 2)) {
                $scope.startPageNumber++;
            }
            if ($scope.currentPageNumber < Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage)) {
                $scope.currentPageNumber++; 
            }
        };        
    }]
);