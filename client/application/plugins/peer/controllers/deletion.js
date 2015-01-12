/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("peer").controller(
    "peerDeletionController", ["$scope", "$routeParams", "peersService", "systemStatusService", "$window", "$location", function($scope, $routeParams, peersService, systemStatusService, $window, $location) {
        $scope.deletePeer = function() {
            peersService.deletePeer(              
                $routeParams.id,
                $window.sessionStorage.userToken
            ).success(function(data, status, headers, config) {
                $location.path("browse-peers");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };
    }]
);