/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "referenceDeletionController", ["$scope", "$routeParams", "referencesService", "systemStatusService", "$window", "$location", function($scope, $routeParams, referencesService, systemStatusService, $window, $location) {
        $scope.deleteReference = function() {
            referencesService.deleteReference({              
                id: $routeParams.id
            }, $window.sessionStorage.token).success(function(data, status, headers, config) {
                $location.path("browse-references");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };
    }]
);