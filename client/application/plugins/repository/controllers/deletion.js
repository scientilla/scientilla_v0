/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "repositoryDeletionController", ["$scope", "$routeParams", "repositoriesService", "systemStatusService", "$window", "$location", function($scope, $routeParams, repositoriesService, systemStatusService, $window, $location) {
        $scope.deleteRepository = function() {
            repositoriesService.deleteRepository({              
                id: $routeParams.id
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $location.path("browse-repositories");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };
    }]
);