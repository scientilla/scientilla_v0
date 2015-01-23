/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("peer").controller(
    "localPeersBrowsingController", 
    ["$scope", "peersService", "seedPeerReferencesService", "systemStatusService", "$window", "$location", "notificationService",
    function($scope, peersService, seedPeerReferencesService, systemStatusService, $window, $location, notificationService) {
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
            for (var lpKey in aPeers) {
                peerIdsSharingMap[aPeers[lpKey]._id] = aPeers[lpKey].sharing_status;
            }
            return peerIdsSharingMap;
        }
        
        $scope.generatePeerIdsAggregatingMap = function(aPeers) {
            var peerIdsAggregatingMap = {};
            for (var lpKey in aPeers) {
                peerIdsAggregatingMap[aPeers[lpKey]._id] = aPeers[lpKey].aggregating_status;
            }
            return peerIdsAggregatingMap;
        }        
        
        $scope.switchPeerSharingStatus = function(id) {
            $scope.changingSharedPeerId = id;
            if (!$scope.peerIdsSharingMap[id]) {
                peersService.setPeerAsShared(
                    id,
                    $window.sessionStorage.userToken
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
                    $window.sessionStorage.userToken
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
                    $window.sessionStorage.userToken
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
                    $window.sessionStorage.userToken
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
                    peersService.getAggregatedAndCustomPeers($window.sessionStorage.userToken).success(function(data, status, headers, config) {
                        $scope.aPeers = data;
                        $scope.iPeers = $scope.aPeers.length;                  
                        callback();
                    }).error(function(data, status, headers, config) {
                        $scope.error = true;
                        systemStatusService.react(status, callback);
                    });
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
                    _.each($scope.aPeers, function(p) {p.deletable = (p.type === 0);});
                    _.each($scope.aPeers, function(p) {p.editable = (p.type === 0);});
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
                    peersService.getSeedPeers($window.sessionStorage.userToken).success(function(data, status, headers, config) {
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
                            $window.sessionStorage.userToken
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
        
        $scope.selectAll = function() {
            var allSelected = _.every($scope.aPeers, 'selected');
            _.each($scope.aPeers, function(p){p.selected = !allSelected;});
        };
        
        var peerParams = {
            messages: {
                    "no-elems": 'No Peers Selected'
                },
            getCollection: function() {return $scope.aPeers;}
        };
               
        var deleteBulkParams = _.merge({
            functionToApply: peersService.deletePeer,
            messages: {
                successful: {
                    singular: "Peer deleted.",
                    plural: "Peers deleted"
                },
                unsuccessful: {
                    singular: "Peer could not be deleted.",
                    plural: "Peers could not be deleted."
                }
            },
            onSuccess: function(id) {
                _.remove($scope.aPeers, {_id: id} );
            }
        }, peerParams);
               
        var unshareBulkParams = _.merge({
            functionToApply: peersService.setPeerAsNotShared,
            messages: {
                successful: {
                    singular: "Peer unshared.",
                    plural: "Peers unshared."
                },
                unsuccessful: {
                    singular: "Peer could not be unshared.",
                    plural: "Peers could not be unshared."
                }
            },
            onSuccess: function(id) {
                $scope.peerIdsSharingMap[id] = false;
            }
        }, peerParams);
               
        var shareBulkParams = _.merge({
            functionToApply: peersService.setPeerAsShared,
            messages: {
                successful: {
                    singular: "Peer shared.",
                    plural: "Peers shared."
                },
                unsuccessful: {
                    singular: "Peer could not be shared.",
                    plural: "Peers could not be shared."
                }
            },
            onSuccess: function(id) {
                $scope.peerIdsSharingMap[id] = true;
            }
        }, peerParams);
        
        
        $scope.deleteSelectedPeers = _.partial(notificationService.applyOnSelectedElements, deleteBulkParams);
        $scope.unshareSelectedPeers = _.partial(notificationService.applyOnSelectedElements, unshareBulkParams);
        $scope.shareSelectedPeers = _.partial(notificationService.applyOnSelectedElements, shareBulkParams);
    }]
);