/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "localRepositoriesBrowsingController", ["$scope", "repositoriesService", "activatedRepositoriesService", "systemStatusService", "$window", "$location", function($scope, repositoriesService, activatedRepositoriesService, systemStatusService, $window, $location) {
        $scope.keywords = "";
        $scope.aRepositories = [];
        $scope.aReferences = [];
        $scope.startPageNumber = 1;
        $scope.currentPageNumber = 1;
        $scope.numberOfItemsPerPage = 25;
        $scope.totalNumberOfItems = 10000;        
        
        $scope.retrieveRepositories = function retrieveRepositories() {    
            $scope.iRepositories = 0;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    repositoriesService.getRepositories($window.sessionStorage.userToken).success(function(data, status, headers, config) {
                        $scope.aRepositories = data;
                        $scope.iRepositories = $scope.aRepositories.length;
                        callback();
                    }).error(function(data, status, headers, config) {
                        $scope.error = true;
                        systemStatusService.react(status, callback);
                    });
                },
                function(callback) {
                    $scope.oActivatedRepository = {};
                    activatedRepositoriesService.getActivatedRepository($window.sessionStorage.userToken).success(function(data, status, headers, config) {
                        $scope.oActivatedRepository = data;
                        callback();
                    }).error(function(data, status, headers, config) {
                        systemStatusService.react(status, callback);
                    });
                },
                function(callback) {
                    $scope.activatedRepositoryId = $scope.oActivatedRepository.repository_id;
                    callback();
                },
                function(callback) {
                    $scope.ready = true;
                    callback();
                }
            ]);
            
            return retrieveRepositories;
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