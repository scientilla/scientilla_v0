/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("user").controller(
    "worldNetworkUsersBrowsingController", 
    ["$scope", "$routeParams", "worldNetworkUsersService", "systemStatusService", "$window", "$location", 
    function($scope, $routeParams, worldNetworkUsersService, systemStatusService, $window, $location) {
        $scope.keywords = "";
        $scope.aUsers = [];
        $scope.startPageNumber = 1;
        $scope.currentPageNumber = 1;
        $scope.lastPageNumber = 0;
        $scope.numberOfItemsPerPage = 20;
        $scope.totalNumberOfItems = 0;        
        
        $scope.retrieveUsers = function retrieveUsers() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    worldNetworkUsersService.getUsers(
                        $scope.keywords,
                        $routeParams.userType,
                        $scope.currentPageNumber,
                        $scope.numberOfItemsPerPage,
                        $window.sessionStorage.userToken
                    ).success(function(data, status, headers, config) {
                        $scope.totalNumberOfItems = data.total_number_of_items;
                        $scope.aUsers = data.items;
                        $scope.lastPageNumber = Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage);
                        if ($scope.aUsers.length === 0) {
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
            
            return retrieveUsers;
        }();
        
        $scope.retrievePreviousItemsPage = function() {
            if ($scope.startPageNumber > 1) {
                $scope.startPageNumber--;
            }            
            if ($scope.currentPageNumber > 1) {
                $scope.currentPageNumber--;
            }
            $scope.retrieveUsers();
        };
        
        $scope.retrieveCustomItemsPage = function(customPageNumber) {            
            if (customPageNumber >= 1 && customPageNumber <= Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage)) {
                $scope.currentPageNumber = customPageNumber;
            }
            $scope.retrieveUsers();
        };         
        
        $scope.retrieveNextItemsPage = function() {
            if ($scope.startPageNumber < (Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage) - 2)) {
                $scope.startPageNumber++;
            }
            if ($scope.currentPageNumber < Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage)) {
                $scope.currentPageNumber++; 
            }
            $scope.retrieveUsers();
        };         
    }]
);