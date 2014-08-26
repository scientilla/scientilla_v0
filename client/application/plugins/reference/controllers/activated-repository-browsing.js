/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "activatedRepositoryReferencesBrowsingController", ["$scope", "repositoryReferencesService", "activatedRepositoriesService", "repositoriesService", "systemStatusService", "$window", "$location", function($scope, repositoryReferencesService, activatedRepositoriesService, repositoriesService, systemStatusService, $window, $location) {
        /* TO-DO: substitute with a directive. */
        /* code start */            
        $("#help-button").popover({
            trigger: "focus"
        });
        /* code end */
        
        $scope.empty = false;
        $scope.ready = false;
        $scope.error = false;
        async.series([
            function(callback) {
                $scope.oActivatedRepository = {};
                activatedRepositoriesService.getActivatedRepository($window.sessionStorage.token).success(function(data, status, headers, config) {
                    $scope.oActivatedRepository.id = data.repository_id;
                    callback();
                }).error(function(data, status, headers, config) {
                    systemStatusService.react(status, callback);
                });
            },
            function(callback) {
                $scope.aReferences = [];
                repositoryReferencesService.getReferences(
                    $scope.oActivatedRepository.id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
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
                $scope.ready = true;
                callback();
            }
        ]);        
    }]
);