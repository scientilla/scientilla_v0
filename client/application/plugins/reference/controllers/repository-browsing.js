/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "repositoryReferencesBrowsingController", ["$scope", "$routeParams", "repositoryReferencesService", "activatedRepositoriesService", "repositoriesService", "systemStatusService", "$window", "$location", function($scope, $routeParams, repositoryReferencesService, activatedRepositoriesService, repositoriesService, systemStatusService, $window, $location) {
        $scope.repositoryId = $routeParams.repositoryId;            
        $scope.aReferences = [];     
        $scope.oRepository = {
            name: "",
            url: "",
            config: {
                keywords: "",
                rows: ""
            }
        };
        
        $scope.retrieveReferences = function() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    repositoryReferencesService.getReferences(
                        $scope.repositoryId,
                        $window.sessionStorage.token,
                        $scope.oRepository.config
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
        };
        
        $scope.init = function(){
            repositoriesService.getRepository(
                $scope.repositoryId,
                $window.sessionStorage.token
            ).success(function(data, status, headers, config){
                var oRepository = data;
                $scope.oRepository = oRepository;
                $scope.retrieveReferences();
            }).error(function(data, status, headers, config) {
                $scope.error = true;
                systemStatusService.react(status);
            });
        };
    }]
);