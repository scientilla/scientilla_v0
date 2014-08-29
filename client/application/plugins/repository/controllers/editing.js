/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "repositoryEditingController", ["$scope", "$routeParams", "repositoriesService", "systemStatusService", "$window", "$location", function($scope, $routeParams, repositoriesService, systemStatusService, $window, $location) {
        $scope.oRepository = {
            name: "",
            url: "",
            query: "",
            parameter: ""
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
                query: $scope.oRepository.query,
                parameter: $scope.oRepository.parameter,
                id: $scope.oRepository._id
            }, $window.sessionStorage.token).success(function(data, status, headers, config) {
                $location.path("browse-network");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };       
    }]
);