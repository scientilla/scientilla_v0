/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */
         
angular.module("dataset").controller(
    "activatedPeerRepositoriesBrowsingController", ["$scope", "peerRepositoriesService", "activatedPeersService", "peersService", "systemStatusService", "$window", "$location", function($scope, peerRepositoriesService, activatedPeersService, peersService, systemStatusService, $window, $location) { 
        $scope.empty = false;
        $scope.ready = false;
        async.series([
            function(callback) {
                $scope.oActivatedPeer = {};
                activatedPeersService.getActivatedPeer($window.sessionStorage.token).success(function(data, status, headers, config) {
                    peersService.getPeer(
                        data.peer_id, 
                        $window.sessionStorage.token
                    ).success(function(data, status, headers, config) {
                        for (key in data) {
                            $scope.oActivatedPeer[key] = data[key];
                        }
                        callback();
                    }).error(function(data, status, headers, config) {
                        systemStatusService.react(status, callback);
                    });
                }).error(function(data, status, headers, config) {
                    systemStatusService.react(status, callback);
                });
            },            
            function(callback) {
                $scope.aRepositories = [];
                peerRepositoriesService.getRepositories($scope.oActivatedPeer.url).success(function(data, status, headers, config) {
                    $scope.aRepositories = data;
                    if ($scope.aRepositories.length === 0) {
                        $scope.empty = true;
                    }                    
                    callback();
                }).error(function(data, status, headers, config) {
                    systemStatusService.react(status, callback);
                });
            },
            function(callback) {
                $scope.ready = true;
                callback();
            }
        ]);       
    }]
);