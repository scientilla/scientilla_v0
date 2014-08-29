/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("network").controller(
    "networkBrowsingController", ["$scope", "peersService", "activatedPeersService", "systemStatusService", "$window", "$location", function($scope, peersService, activatedPeersService, systemStatusService, $window, $location) {
        /* TO-DO: substitute with a directive. */
        /* code start */            
        $("#help-button").popover({
            trigger: "focus"
        });
        /* code end */        
            
        $scope.generatePeerIdsSharingMap = function(aPeers) {
            var peerIdsSharingMap = {};
            for (lpKey in aPeers) {
                peerIdsSharingMap[aPeers[lpKey]._id] = aPeers[lpKey].sharing_status;
            }
            return peerIdsSharingMap;
        }
        
        $scope.changingActivatedPeerId = "";
        $scope.setPeerAsActivated = function(id) {
            $scope.changingActivatedPeerId = id;
            activatedPeersService.setPeerAsActivated(
                id,
                $window.sessionStorage.token
            ).success(function(data, status, headers, config) {
                $scope.activatedPeerId = id;
                $scope.changingActivatedPeerId = ""; 
            }).error(function(data, status, headers, config) {
                $scope.changingActivatedPeerId = "";
                systemStatusService.react(status);
            });
        }
        
        $scope.changingSharedPeerId = "";
        $scope.switchPeerSharingStatus = function(id) {
            $scope.changingSharedPeerId = id;
            if (!$scope.peerIdsSharingMap[id]) {
                peersService.setPeerAsShared(
                    id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.peerIdsSharingMap[id] = true;
                    $scope.changingSharedPeerId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedPeerId = "";
                    systemStatusService.react(status);
                });
            } else {
                peersService.setPeerAsNotShared(
                    id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.peerIdsSharingMap[id] = false;
                    $scope.changingSharedPeerId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedPeerId = "";
                    systemStatusService.react(status);
                });
            }
        }
        
        $scope.empty = false;
        $scope.ready = false;
        $scope.error = false;
        async.series([
            function(callback) {
                $scope.aPeers = [];
                peersService.getPeers($window.sessionStorage.token).success(function(data, status, headers, config) {
                    $scope.aPeers = data;
                    if ($scope.aPeers.length === 0) {
                        $scope.empty = true;
                    }                    
                    callback();
                }).error(function(data, status, headers, config) {
                    $scope.error = true;
                    systemStatusService.react(status, callback);
                });
            },
            function(callback) {
                $scope.oActivatedPeer = {};
                activatedPeersService.getActivatedPeer($window.sessionStorage.token).success(function(data, status, headers, config) {
                    $scope.oActivatedPeer = data;
                    callback();
                }).error(function(data, status, headers, config) {
                    systemStatusService.react(status, callback);
                });
            },
            function(callback) {
                $scope.activatedPeerId = $scope.oActivatedPeer.peer_id;
                callback();
            },
            function(callback) {
                $scope.peerIdsSharingMap = $scope.generatePeerIdsSharingMap($scope.aPeers);
                callback();
            },
            function(callback) {
                $scope.ready = true;
                callback();
            }
        ]);        
    }]        
);