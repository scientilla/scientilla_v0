/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("peer").controller(
    "peerEditingController", ["$scope", "$routeParams", "peersService", "systemStatusService", "$window", "$location", function($scope, $routeParams, peersService, systemStatusService, $window, $location) {
        $scope.oPeer = {
            name: "",
            url: ""
        };
        peersService.getPeer(
            $routeParams.id, 
            $window.sessionStorage.token
        ).success(function(data, status, headers, config) {
            for (key in data) {
                $scope.oPeer[key] = data[key];
            }
        }).error(function(data, status, headers, config) {
            systemStatusService.react(status);
        });
        
        $scope.updatePeer = function() {
            peersService.updatePeer({
                name: $scope.oPeer.name,
                url: $scope.oPeer.url,
                id: $scope.oPeer._id
            }, $window.sessionStorage.token).success(function(data, status, headers, config) {
                $location.path("browse-peers");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };        
    }]
);