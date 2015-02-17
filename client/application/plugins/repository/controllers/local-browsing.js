/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "localRepositoriesBrowsingController", 
    ["$scope", "$routeParams", "repositoriesService", "systemStatusService", "$window", "$location", "$sce", 
    function($scope, $routeParams, repositoriesService, systemStatusService, $window, $location, $sce) {
        $scope.keywords = "";
        $scope.aRepositories = [];
        $scope.aReferences = [];
        $scope.fileContent = "";
        $scope.startPageNumber = 1;
        $scope.currentPageNumber = 1;
        $scope.lastPageNumber = 0;
        $scope.numberOfItemsPerPage = 20;
        $scope.totalNumberOfItems = 0;      
        
        $scope.retrieveRepositories = function retrieveRepositories() {    
            $scope.ready = false;
            $scope.error = false;
            var config = {
                keywords: $scope.keywords,
                page: $scope.currentPageNumber,
                rows: $scope.numberOfItemsPerPage,
            };
            async.series([
                function(callback) {
                    repositoriesService.getRepositories($window.sessionStorage.userToken, config).success(function(data, status, headers, config) {
                        $scope.aRepositories = data.items;
                        $scope.totalNumberOfItems = data.total_number_of_items;
                        $scope.lastPageNumber = Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage);
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
            
            return retrieveRepositories;
        }();
        
        $scope.exportRepository = function(repositoryId) {
            repositoriesService.exportRepository(
                repositoryId, 
                $window.sessionStorage.userToken
            ).success(function(data, status, headers, config) {
                var file = new File([JSON.stringify(data)], data.name + ".json", { type: "application/octet-stream" });
                var fileURL = URL.createObjectURL(file);
                $window.open(fileURL);
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };
        
        $scope.retrievePreviousItemsPage = function() {
            if ($scope.startPageNumber > 1) {
                $scope.startPageNumber--;
            }            
            if ($scope.currentPageNumber > 1) {
                $scope.currentPageNumber--;
            }
            $scope.retrieveRepositories();
        };
        
        $scope.retrieveCustomItemsPage = function(customPageNumber) {            
            if (customPageNumber >= 1 && customPageNumber <= Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage)) {
                $scope.currentPageNumber = customPageNumber;
            }
            $scope.retrieveRepositories();
        };         
        
        $scope.retrieveNextItemsPage = function() {
            if ($scope.startPageNumber < (Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage) - 2)) {
                $scope.startPageNumber++;
            }
            if ($scope.currentPageNumber < Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage)) {
                $scope.currentPageNumber++; 
            }
            $scope.retrieveRepositories();
        };              
    }]
);