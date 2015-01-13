/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */
         
angular.module("dataset").controller(
    "activatedPeerRepositoriesBrowsingController", ["$scope", "peerRepositoriesService", "activatedPeersService", "peersService", "systemStatusService", "$window", "$location", function($scope, peerRepositoriesService, activatedPeersService, peersService, systemStatusService, $window, $location) { 
        $scope.aRepositories = [];
        
        $scope.retrieveRepositories = function retrieveRepositories() { 
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    $scope.oActivatedPeer = {};
                    activatedPeersService.getActivatedPeer($window.sessionStorage.userToken).success(function(data, status, headers, config) {
                        peersService.getPeer(
                            data.peer_id, 
                            $window.sessionStorage.userToken
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
                    peerRepositoriesService.getRepositories($scope.oActivatedPeer.url).success(function(data, status, headers, config) {
                        $scope.aRepositories = data;
                        if ($scope.aRepositories.length === 0) {
                            $scope.empty = true;
                        }                    
                        callback();
                    }).error(function(data, status, headers, config) {
                        $scope.error = true;
                        systemStatusService.react(status, callback);
                    });
                },
                function(callback) {
                    $scope.ready = true;
                    callback();
                }
            ]);
            
            return retrieveRepositories;
        }();
    }]
);