/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
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
                url: $scope.oPeer.url,
                tags: $scope.oPeer.tags
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $location.path("browse-peers");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };        
        
        $scope.extractTags = function() {
            if (_.isEmpty($scope.oPeer.tagsStr)) {
                $scope.oPeer.tags = [];
            }
            else {
                $scope.oPeer.tags = _.uniq($scope.oPeer.tagsStr.split(/,\s*/));
            }
        };
        $scope.compressTags = function() {
            $scope.oPeer.tagsStr = $scope.oPeer.tags.join(', ');
        };
    }]
);