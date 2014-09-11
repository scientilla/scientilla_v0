/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("network").controller(
    "networkBrowsingController", ["$scope", "peersService", "repositoriesService", "activatedPeersService", "activatedRepositoriesService", "peerReferencesService", "seedPeerReferencesService", "repositoryReferencesService", "systemStatusService", "$window", "$location", function($scope, peersService, repositoriesService, activatedPeersService, activatedRepositoriesService, peerReferencesService, seedPeerReferencesService, repositoryReferencesService, systemStatusService, $window, $location) {
        $scope.sourcesListingMode = $window.sessionStorage.sourcesListingMode ? $window.sessionStorage.sourcesListingMode : "L"; // L = List, G = Graph
        $scope.sourcesType = $window.sessionStorage.sourcesType ? $window.sessionStorage.sourcesType : "P"; // P = Peers, R = Repositories
        $scope.resultsListingMode = "OFF"; // OFF = Disabled, MPR = Main Peers Results
        $scope.keywords = "";
        $scope.changingActivatedPeerId = "";
        $scope.changingActivatedRepositoryId = "";
        $scope.changingSharedPeerId = "";
        $scope.changingSharedRepositoryId = "";
        $scope.aPeers = [];
        $scope.aSeedPeers = [];
        $scope.aRepositories = [];
        $scope.aReferences = [];
        $scope.startPageNumber = 1;
        $scope.currentPageNumber = 1;
        $scope.numberOfItemsPerPage = 25;
        $scope.totalNumberOfItems = 10000;        
        
        $scope.saveSourcesListingMode = function() {
            $window.sessionStorage.sourcesListingMode = $scope.sourcesListingMode;
        }
        
        $scope.saveSourcesType = function() {
            $window.sessionStorage.sourcesType = $scope.sourcesType;
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
               
        $scope.retrievePeers = function retrievePeers() {        
            $scope.iPeers = 0;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    peersService.getPeers($window.sessionStorage.token).success(function(data, status, headers, config) {
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

        $scope.retrieveRepositories = function retrieveRepositories() {    
            $scope.iRepositories = 0;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    repositoriesService.getRepositories($window.sessionStorage.token).success(function(data, status, headers, config) {
                        $scope.aRepositories = data;
                        $scope.iRepositories = $scope.aRepositories.length;
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
            
            return retrieveRepositories;
        }();
        
        $scope.retrievePeersReferences = function() {
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
        
        $scope.retrieveRepositoriesReferences = function() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    repositoryReferencesService.getReferences(
                        $scope.repositoryId,
                        $window.sessionStorage.token,
                        $scope.keywords
                    ).success(function(data, status, headers, config) {
                        repositoryReferencesService.aReferences = data;                   
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
        };
        
        $scope.showPeersListing = function() {
            $scope.resultsListingMode = "OFF";
            $scope.saveSourcesListingMode();
            $scope.saveSourcesType();
            $scope.retrievePeers();
        };
        
        $scope.showRepositoriesListing = function() {
            $scope.resultsListingMode = "OFF";
            $scope.saveSourcesListingMode();
            $scope.saveSourcesType();
            $scope.retrieveRepositories();
        };        
        
        $scope.searchSeedPeersReferences = function() {
            $scope.resultsListingMode = "MPR";
            $scope.saveSourcesListingMode();
            $scope.saveSourcesType();
            $scope.retrievePeersReferences();
        };
        
        $scope.searchRepositoriesReferences = function() {
            $scope.resultsListingMode = "MRR";
            $scope.saveSourcesListingMode();
            $scope.saveSourcesType();
            $scope.retrieveRepositoriesReferences();
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