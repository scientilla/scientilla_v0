/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("network").controller(
    "networkBrowsingController", ["$scope", "peersService", "repositoriesService", "activatedPeersService", "activatedRepositoriesService", "systemStatusService", "$window", "$location", function($scope, peersService, repositoriesService, activatedPeersService, activatedRepositoriesService, systemStatusService, $window, $location) {
        /* TO-DO: substitute with a directive. */
        /* code start */            
        $("#help-button").popover({
            trigger: "focus"
        });
        /* code end */  
        
        $scope.visualizationMode = $window.sessionStorage.visualizationMode ? $window.sessionStorage.visualizationMode : "L";
        $scope.listingType = $window.sessionStorage.listingType ? $window.sessionStorage.listingType : "P";
        
        $scope.saveVisualizationMode = function() {
            $window.sessionStorage.visualizationMode = $scope.visualizationMode;
        }
        
        $scope.saveListingType = function() {
            $window.sessionStorage.listingType = $scope.listingType;
        }        
            
        $scope.generatePeerIdsSharingMap = function(aPeers) {
            var peerIdsSharingMap = {};
            for (lpKey in aPeers) {
                peerIdsSharingMap[aPeers[lpKey]._id] = aPeers[lpKey].sharing_status;
            }
            return peerIdsSharingMap;
        }
        
        $scope.generateRepositoryIdsSharingMap = function(aRepositories) {
            var repositoryIdsSharingMap = {};
            for (lpKey in aRepositories) {
                repositoryIdsSharingMap[aRepositories[lpKey]._id] = aRepositories[lpKey].sharing_status;
            }
            return repositoryIdsSharingMap;
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
        
        $scope.changingActivatedRepositoryId = "";
        $scope.setRepositoryAsActivated = function(id) {
            $scope.changingActivatedRepositoryId = id;
            activatedRepositoriesService.setRepositoryAsActivated(
                id,
                $window.sessionStorage.token
            ).success(function(data, status, headers, config) {
                $scope.activatedRepositoryId = id;
                $scope.changingActivatedRepositoryId = ""; 
            }).error(function(data, status, headers, config) {
                $scope.changingActivatedRepositoryId = "";
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
        
        $scope.changingSharedRepositoryId = "";
        $scope.switchRepositorySharingStatus = function(id) {
            $scope.changingSharedRepositoryId = id;
            if (!$scope.repositoryIdsSharingMap[id]) {
                repositoriesService.setRepositoryAsShared(
                    id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.repositoryIdsSharingMap[id] = true;
                    $scope.changingSharedRepositoryId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedRepositoryId = "";
                    systemStatusService.react(status);
                });
            } else {
                repositoriesService.setRepositoryAsNotShared(
                    id,
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.repositoryIdsSharingMap[id] = false;
                    $scope.changingSharedRepositoryId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedRepositoryId = "";
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

        $scope.empty = false;
        $scope.ready = false;
        $scope.error = false;
        async.series([
            function(callback) {
                $scope.aRepositories = [];
                repositoriesService.getRepositories($window.sessionStorage.token).success(function(data, status, headers, config) {
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
                $scope.oActivatedRepository = {};
                activatedRepositoriesService.getActivatedRepository($window.sessionStorage.token).success(function(data, status, headers, config) {
                    $scope.oActivatedRepository = data;
                    callback();
                }).error(function(data, status, headers, config) {
                    systemStatusService.react(status, callback);
                });
            },
            function(callback) {
                $scope.activatedRepositoryId = $scope.oActivatedRepository.repository_id;
                callback();
            },
            function(callback) {
                $scope.repositoryIdsSharingMap = $scope.generateRepositoryIdsSharingMap($scope.aRepositories);
                callback();
            },            
            function(callback) {
                $scope.ready = true;
                callback();
            }
        ]);        
    }]        
);