/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("peer").controller(
    "peerAdditionController", ["$scope", "peersService", "systemStatusService", "$window", "$location", function($scope, peersService, systemStatusService, $window, $location) {
        $scope.oPeer = {
            name: "",
            url: ""
        };
        
        $scope.createPeer = function() {
            peersService.createPeer({
                name: $scope.oPeer.name,
                url: $scope.oPeer.url
            }, $window.sessionStorage.token).success(function(data, status, headers, config) {
                $location.path("browse-peers");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };        
    }]
);