/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */
         
angular.module("dataset").controller(
    "peerDatasetsBrowsingController", ["$scope", "$routeParams", "peerDatasetsService", "peersService", "systemStatusService", "$window", "$location", function($scope, $routeParams, peerDatasetsService, peersService, systemStatusService, $window, $location) { 
        $scope.peerId = $routeParams.peerId;
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