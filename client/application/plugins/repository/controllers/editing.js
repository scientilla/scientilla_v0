/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "repositoryEditingController", ["$scope", "$routeParams", "repositoriesService", "systemStatusService", "$window", "$location", function($scope, $routeParams, repositoriesService, systemStatusService, $window, $location) {
        $scope.defaultRows = "20";
        $scope.oRepository = {
            name: "",
            url: "",
            config: {
                keywords: "",
                rows: $scope.defaultRows
            }
        };
        
        $scope.retrieveRepository = function retrieveRepository() {
            repositoriesService.getRepository(
                $routeParams.id, 
                $window.sessionStorage.token
            ).success(function(data, status, headers, config) {
                for (key in data) {
                    $scope.oRepository[key] = data[key];
                }
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
            
            return retrieveRepository;
        }();
        
        $scope.updateRepository = function() {
            repositoriesService.updateRepository({
                name: $scope.oRepository.name,
                url: $scope.oRepository.url,
                config: {
                    keywords: $scope.oRepository.config.keywords,
                    rows: $scope.oRepository.config.rows
                },
                id: $scope.oRepository._id
            }, $window.sessionStorage.token).success(function(data, status, headers, config) {
                $location.path("browse-network");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };       
    }]
);