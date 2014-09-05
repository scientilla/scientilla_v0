/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "repositoryReferencesBrowsingController", ["$scope", "$routeParams", "repositoryReferencesService", "activatedRepositoriesService", "repositoriesService", "systemStatusService", "$window", "$location", function($scope, $routeParams, repositoryReferencesService, activatedRepositoriesService, repositoriesService, systemStatusService, $window, $location) {
        $scope.repositoryId = $routeParams.repositoryId;            
        $scope.aReferences = [];      
        $scope.currentPage = 1;
        $scope.lastPage = null;
        $scope.firstPage = 1;
        $scope.oRepository = null;
        
        $scope.retrievePrevReferences = function() {
            $scope.retrieveReferences(-1);
        };
        
        $scope.retrieveNextReferences = function() {
            $scope.retrieveReferences(+1);
        };
        
        $scope.retrieveReferences = function(pageIncr) {
            pageIncr = pageIncr || 0;
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            if (_.isNull($scope.oRepository)) {
                $scope.error = true;
                return;
            }
            if (pageIncr === 0) {
                $scope.currentPage = $scope.oRepository.config.page;
                $scope.firstPage = $scope.oRepository.config.page;
                $scope.lastPage = null;
            }
            async.series([
                function(callback) {
                    $scope.currentPage+= pageIncr;
                    var config = {
                        keywords: $scope.oRepository.config.keywords,
                        page: $scope.currentPage,
                        rows: $scope.oRepository.config.rows
                    };
                    repositoryReferencesService.getReferences(
                        $scope.repositoryId,
                        $window.sessionStorage.token,
                        config
                    ).success(function(data, status, headers, config) {
                        if (data.length < $scope.oRepository.config.rows) {
                            $scope.lastPage = $scope.currentPage;
                        }
                        repositoryReferencesService.aReferences = data;                   
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
                    if (!_.isNull($scope.lastPage)) {
                        callback();
                        return;
                    }
                    var page = $scope.currentPage * $scope.oRepository.config.rows + 1;
                    var config = {
                        keywords: $scope.oRepository.config.keywords,
                        page: page,
                        rows: 1
                    };
                    repositoryReferencesService.getReferences(
                        $scope.repositoryId,
                        $window.sessionStorage.token,
                        config
                    ).success(function(data, status, headers, config) {
                        if (data.length === 0) {
                            $scope.lastPage = $scope.currentPage;
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
        };
        
        $scope.init = function(){
            repositoriesService.getRepository(
                $scope.repositoryId,
                $window.sessionStorage.token
            ).success(function(data, status, headers, config){
                $scope.oRepository = data;
                $scope.currentPage = $scope.oRepository.config.page;
                $scope.firstPage = $scope.oRepository.config.page;
                $scope.retrieveReferences();
            }).error(function(data, status, headers, config) {
                $scope.error = true;
                systemStatusService.react(status);
            });
        };
    }]
);