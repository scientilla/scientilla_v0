/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "localRepositoriesBrowsingController", ["$scope", "repositoriesService", "activatedRepositoriesService", "systemStatusService", "$window", "$location", function($scope, repositoriesService, activatedRepositoriesService, systemStatusService, $window, $location) {
        $scope.generateRepositoryIdsSharingMap = function(aRepositories) {
            var repositoryIdsSharingMap = {};
            for (lpKey in aRepositories) {
                repositoryIdsSharingMap[aRepositories[lpKey]._id] = aRepositories[lpKey].sharing_status;
            }
            return repositoryIdsSharingMap;
        }        
        
        $scope.empty = false;
        $scope.ready = false;
        async.series([
            function(callback) {
                $scope.aRepositories = [];
                repositoriesService.getRepositories($window.sessionStorage.token).success(function(data, status, headers, config) {
                    $scope.aRepositories = data;
                    if ($scope.aRepositories.length === 0) {
                        $scope.empty = true;
                    }
                    callback();
                }).error(function(data, status, headers, config) {
                    systemStatusService.react(status, callback);
                });
            },
            function(callback) {
                $scope.oActivatedRepository = {};
                activatedRepositoriesService.getActivatedRepository($window.sessionStorage.token).success(function(data, status, headers, config) {
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
                $scope.repositoryIdsSharingMap = $scope.generateRepositoryIdsSharingMap($scope.aRepositories);
                callback();
            },            
            function(callback) {
                $scope.ready = true;
                callback();
            }
        ]);
        
        $scope.changingActivatedRepositoryId = "";
        $scope.setRepositoryAsActivated = function(id) {
            $scope.changingActivatedRepositoryId = id;
            activatedRepositoriesService.setRepositoryAsActivated(
                id,
                $window.sessionStorage.token
            ).success(function(data, status, headers, config) {
                $scope.activatedRepositoryId = id;
                $scope.changingActivatedRepositoryId = ""; 
            }).error(function(data, status, headers, config) {
                $scope.changingActivatedRepositoryId = "";
                systemStatusService.react(status);
            });
        }
        
        $scope.changingSharedRepositoryId = "";
        $scope.switchRepositorySharingStatus = function(id) {
            $scope.changingSharedRepositoryId = id;
            if (!$scope.repositoryIdsSharingMap[id]) {
                repositoriesService.setRepositoryAsShared(
                    id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.repositoryIdsSharingMap[id] = true;
                    $scope.changingSharedRepositoryId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedRepositoryId = "";
                    systemStatusService.react(status);
                });
            } else {
                repositoriesService.setRepositoryAsNotShared(
                    id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.repositoryIdsSharingMap[id] = false;
                    $scope.changingSharedRepositoryId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedRepositoryId = "";
                    systemStatusService.react(status);
                });
            }
        }        
    }]
);