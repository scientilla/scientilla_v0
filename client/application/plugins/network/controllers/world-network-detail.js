/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("network").controller(
    "worldDetailController", 
    ["$scope", "$routeParams", "worldNetworkReferencesService", "systemStatusService", "$window", "$location", "notificationService", "referencesService",
    function($scope, $routeParams, worldNetworkReferencesService, systemStatusService, $window, $location, notificationService, referencesService) {
        $scope.keywords = "";
        $scope.aReferences = [];

        $scope.getPeerPath = function(peerId, peerUrl) {
            if (peerUrl === $window.sessionStorage.url) {
                return '#/';
            }
            return '#/browse-peer-references/' + peerId + '/';
        };

        $scope.getReferencePath = function(referenceId, peerId, peerUrl) {
            if (peerUrl === $window.sessionStorage.url) {
                return '/open-reference/' + referenceId;
            }
            return '/open-peer-reference/' + peerId + '/' + referenceId;
        };

        $scope.openReference = function(referenceId, peerId, peerUrl) {
            $window.sessionStorage.referenceOpeningCallOrigin = "world-network-listing";
            $location.path($scope.getReferencePath(referenceId, peerId, peerUrl));
        };            

        $scope.cloneReference = function(reference) {
            referencesService.cloneReferenceFromPeer(
                reference.peer_id, 
                reference.original_id,
                $window.sessionStorage.userToken, 
                function(result) {
                    switch(result.status) {
                        case 200: 
                            notificationService.info('Reference cloned');
                            reference.clonable = false;
                            reference.selected = false;
                            break;
                        case 409:
                            notificationService.warning('Element already cloned');
                            break;
                        case 404:
                        case 500:
                            systemStatusService.react(result.status);
                            notificationService.error('An error happened');
                            break;
                        default:
                            systemStatusService.react(result.status);
                            notificationService.error('An error happened');
                    }
                }
            );
        };        

        $scope.cloneSelectedReferences = function(){
            var selectedReferences = _.filter($scope.aReferences, {selected: true});

            var cloneReferences = 
                _.map(selectedReferences, function(reference) {
                   return function(callback) {
                       referencesService.cloneReferenceFromPeer(
                            reference.peer_id, 
                            reference.original_id,
                            $window.sessionStorage.userToken,
                            function(result) {
                               var data = {
                                   reference: reference,
                                   result: result
                               };
                               callback(null, data);
                            }
                       );
                   };
                });

            var notifyResults = function(err, allData){
                if (err) {
                    notificationService.info('Some error happened');
                    return;
                }
                var clonedReferences = 0;
                var duplicatedReferences = 0;
                var errors = 0;
                allData.forEach(function(data) {
                    var result = data.result;
                    var reference = data.reference;
                    switch(result.status) {
                        case 200: 
                            reference.clonable = false;
                            reference.selected = false;
                            clonedReferences++;
                            break;
                        case 409:
                            duplicatedReferences++;
                            break;
                        case 404:
                        case 500:
                            systemStatusService.react(result.status);
                            errors++;
                            break;
                        default:
                            systemStatusService.react(result.status);
                            errors++;
                    }
                });
                var msg = "";
                if (allData.length === 0) {
                    msg = 'No References Selected';
                } else {
                    if (clonedReferences > 0) {
                        if (clonedReferences === 1) {
                            msg += clonedReferences + ' Reference Cloned.\n';
                        } else {
                            msg += clonedReferences + ' References Cloned.\n';
                        }
                    }
                    if (duplicatedReferences > 0 ) {
                        if (duplicatedReferences === 1) {
                            msg += duplicatedReferences + ' Reference is not clonable.\n';
                        } else {
                            msg += duplicatedReferences + ' References are not clonable.\n';
                        }
                    }
                    if (errors > 0 ) {
                        msg += 'Some error happened.\n';
                    }
                }
                notificationService.info(msg);
            };
            async.parallel(cloneReferences, notifyResults);
        };  

        $scope.retrieveReferences = function() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    worldNetworkReferencesService.getReference(
                        $routeParams.id,
                        $window.sessionStorage.userToken
                    ).success(function(data, status, headers, config) {
                        $scope.totalNumberOfItems = data.total_number_of_items;
                        $scope.aReferences = data.items;
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
        }();    
    }]        
);