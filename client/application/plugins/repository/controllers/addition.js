/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "repositoryAdditionController", ["$scope", "repositoriesService", "systemStatusService", "$window", "$location", function($scope, repositoriesService, systemStatusService, $window, $location) {
        $scope.defaultRows = "20";
        $scope.oRepository = {
            name: "",
            url: "",
            config: {
                keywords: "",
                rows: $scope.defaultRows
            }
        };
        
        $scope.createRepository = function() {
            repositoriesService.createRepository({
                name: $scope.oRepository.name,
                url: $scope.oRepository.url,
                config: {
                    keywords: $scope.oRepository.config.keywords,
                    rows: $scope.oRepository.config.rows
                }
            }, $window.sessionStorage.token).success(function(data, status, headers, config) {
                $location.path("browse-network");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };       
    }]
);