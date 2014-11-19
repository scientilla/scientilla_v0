/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("peer").controller(
    "localPeersBrowsingController", ["$scope", "peersService", "activatedPeersService", "seedPeerReferencesService", "systemStatusService", "$window", "$location", function($scope, peersService, activatedPeersService, seedPeerReferencesService, systemStatusService, $window, $location) {
        $scope.changingActivatedPeerId = "";
        $scope.changingSharedPeerId = "";
        $scope.changingAggregatedPeerId = "";
        $scope.keywords = "";        
        $scope.aPeers = [];
        $scope.aSeedPeers = [];
        $scope.aReferences = [];        
        $scope.startPageNumber = 1;
        $scope.currentPageNumber = 1;
        $scope.numberOfItemsPerPage = 25;
        $scope.totalNumberOfItems = 10000;               
            
        $scope.generatePeerIdsSharingMap = function(aPeers) {
            var peerIdsSharingMap = {};
            for (lpKey in aPeers) {
                peerIdsSharingMap[aPeers[lpKey]._id] = aPeers[lpKey].sharing_status;
            }
            return peerIdsSharingMap;
        }
        
        $scope.generatePeerIdsAggregatingMap = function(aPeers) {
            var peerIdsAggregatingMap = {};
            for (lpKey in aPeers) {
                peerIdsAggregatingMap[aPeers[lpKey]._id] = aPeers[lpKey].aggregating_status;
            }
            return peerIdsAggregatingMap;
        }        
        
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
        
        $scope.switchPeerAggregatingStatus = function(id) {
            $scope.changingAggregatedPeerId = id;
            if (!$scope.peerIdsAggregatingMap[id]) {
                peersService.setPeerAsAggregated(
                    id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.peerIdsAggregatingMap[id] = true;
                    $scope.changingAggregatedPeerId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingAggregatedPeerId = "";
                    systemStatusService.react(status);
                });
            } else {
                peersService.setPeerAsNotAggregated(
                    id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.peerIdsAggregatingMap[id] = false;
                    $scope.changingAggregatedPeerId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingAggregatedPeerId = "";
                    systemStatusService.react(status);
                });
            }
        }        
        
        $scope.retrievePeers = function retrievePeers() {        
            $scope.iPeers = 0;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    peersService.getAggregatedPeers($window.sessionStorage.token).success(function(data, status, headers, config) {
                        $scope.aPeers = data;
                        $scope.iPeers = $scope.aPeers.length;                  
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
                    $scope.peerIdsAggregatingMap = $scope.generatePeerIdsAggregatingMap($scope.aPeers);
                    callback();
                },                
                function(callback) {
                    $scope.ready = true;
                    callback();
                }
            ]);
            
            return retrievePeers;
        }();
        
        $scope.retrieveSeedPeers = function retrieveSeedPeers() {        
            async.series([
                function(callback) {
                    peersService.getSeedPeers($window.sessionStorage.token).success(function(data, status, headers, config) {
                        $scope.aSeedPeers = data; 
                        callback();
                    }).error(function(data, status, headers, config) {
                        $scope.error = true;
                        systemStatusService.react(status, callback);
                    });
                }
            ]);
            
            return retrieveSeedPeers;
        }();
        
        $scope.retrieveSeedPeersReferences = function() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            for (var seedPeerIndex = 0; seedPeerIndex < $scope.aSeedPeers.length; seedPeerIndex++) {
                async.series([
                    function(callback) {
                        seedPeerReferencesService.getReferences(
                            seedPeerIndex,
                            $scope.keywords,
                            $window.sessionStorage.token
                        ).success(function(data, status, headers, config) {
                            $scope.aReferences = data;
                            if ($scope.aReferences.length === 0) {
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
            }
        };        
        
        $scope.retrievePreviousItemsPage = function() {
            if ($scope.startPageNumber > 1) {
                $scope.startPageNumber--;
            }            
            if ($scope.currentPageNumber > 1) {
                $scope.currentPageNumber--;
            }
        };
        
        $scope.retrieveCustomItemsPage = function(customPageNumber) {            
            if (customPageNumber >= 1 && customPageNumber <= Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage)) {
                $scope.currentPageNumber = customPageNumber;
            }
        };         
        
        $scope.retrieveNextItemsPage = function() {
            if ($scope.startPageNumber < (Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage) - 2)) {
                $scope.startPageNumber++;
            }
            if ($scope.currentPageNumber < Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage)) {
                $scope.currentPageNumber++; 
            }
        };        
    }]
);