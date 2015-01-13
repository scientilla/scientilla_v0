/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("peer").controller(
    "peerEditingController", ["$scope", "$routeParams", "peersService", "systemStatusService", "$window", "$location", function($scope, $routeParams, peersService, systemStatusService, $window, $location) {
        $scope.oPeer = {
            name: "",
            url: ""
        };
        
        $scope.retrievePeer = function retrievePeer() {
            peersService.getPeer(
                $routeParams.id, 
                $window.sessionStorage.userToken
            ).success(function(data, status, headers, config) {
                for (var key in data) {
                    $scope.oPeer[key] = data[key];
                }
                $scope.compressTags();
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
            
            return retrievePeer;
        }();
        
        $scope.extractTags = function() {
            if (_.isEmpty($scope.oPeer.tagsStr)) {
                $scope.oPeer.tags = [];
            }
            else {
                $scope.oPeer.tags = _.uniq($scope.oPeer.tagsStr.split(/;\s*/));
            }
        };
        $scope.compressTags = function() {
            $scope.oPeer.tagsStr = $scope.oPeer.tags.join('; ');
        };
        
        $scope.updatePeer = function() {
            peersService.updatePeer({
                name: $scope.oPeer.name,
                url: $scope.oPeer.url,
                id: $scope.oPeer._id,
                tags: $scope.oPeer.tags
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $location.path("browse-peers");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };        
    }]
);