/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "localReferencesBrowsingController", 
    ["$scope", "referencesService", "systemStatusService", "$window", "$location", "notificationService",
    function($scope, referencesService, systemStatusService, $window, $location, notificationService) {
        $scope.userType = $window.sessionStorage.userType;
        $scope.userRights = $window.sessionStorage.userRights;
        $scope.keywords = "";
        $scope.changingApprovedReferenceId = "";
        $scope.changingSharedReferenceId = "";
        $scope.aReferences = [];
        $scope.startPageNumber = 1;
        $scope.currentPageNumber = 1;
        $scope.lastPageNumber = 0;
        $scope.numberOfItemsPerPage = 20;
        $scope.totalNumberOfItems = 0;
        
        $scope.getReferencePath = function(referenceId) {
            return '/open-reference/' + referenceId;
        };
        
        $scope.openReference = function(referenceId) {
            $window.sessionStorage.referenceOpeningCallOrigin = "local-listing";
            $location.path($scope.getReferencePath(referenceId));
        };        
        
        $scope.generateReferenceIdsApprovingMap = function(aReferences) {
            var referenceIdsApprovingMap = {};
            for (var lpKey in aReferences) {
                referenceIdsApprovingMap[aReferences[lpKey]._id] = aReferences[lpKey].approving_status;
            }
            return referenceIdsApprovingMap;
        };
        
        $scope.generateReferenceIdsSharingMap = function(aReferences) {
            var referenceIdsSharingMap = {};
            for (var lpKey in aReferences) {
                referenceIdsSharingMap[aReferences[lpKey]._id] = aReferences[lpKey].sharing_status;
            }
            return referenceIdsSharingMap;
        };
        
        $scope.switchReferenceApprovingStatus = function(id) {
            $scope.changingApprovedReferenceId = id;
            if (!$scope.referenceIdsApprovingMap[id]) {
                referencesService.setReferenceAsApproved(
                    id, 
                    $window.sessionStorage.userToken
                ).success(function(data, status, headers, config) {
                    $scope.referenceIdsApprovingMap[id] = true;
                    $scope.changingApprovedReferenceId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingApprovedReferenceId = "";
                    systemStatusService.react(status);
                });
            } else {
                referencesService.setReferenceAsNotApproved(
                    id, 
                    $window.sessionStorage.userToken
                ).success(function(data, status, headers, config) {
                    $scope.referenceIdsApprovingMap[id] = false;
                    $scope.changingApprovedReferenceId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingApprovedReferenceId = "";
                    systemStatusService.react(status);
                });
            }
        };    
        
        $scope.switchReferenceSharingStatus = function(id) {
            $scope.changingSharedReferenceId = id;
            if (!$scope.referenceIdsSharingMap[id]) {
                referencesService.setReferenceAsShared(
                    id, 
                    $window.sessionStorage.userToken
                ).success(function(data, status, headers, config) {
                    $scope.referenceIdsSharingMap[id] = true;
                    $scope.changingSharedReferenceId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedReferenceId = "";
                    systemStatusService.react(status);
                });
            } else {
                referencesService.setReferenceAsNotShared(
                    id, 
                    $window.sessionStorage.userToken
                ).success(function(data, status, headers, config) {
                    $scope.referenceIdsSharingMap[id] = false;
                    $scope.changingSharedReferenceId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedReferenceId = "";
                    systemStatusService.react(status);
                });
            }
        };
               
        $scope.retrieveReferences = function retrieveReferences() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            async.series([
                function(callback) {
                    referencesService.getReferences(
                        $scope.keywords,
                        $scope.currentPageNumber,
                        $scope.numberOfItemsPerPage,
                        $window.sessionStorage.userToken
                    ).success(function(data, status, headers, config) {
                        $scope.totalNumberOfItems = data.total_number_of_items;
                        $scope.aReferences = data.items;
                        $scope.lastPageNumber = Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage);
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
                    $scope.referenceIdsApprovingMap = $scope.generateReferenceIdsApprovingMap($scope.aReferences);
                    callback();
                },           
                function(callback) {
                    $scope.referenceIdsSharingMap = $scope.generateReferenceIdsSharingMap($scope.aReferences);
                    callback();
                },
                function(callback) {
                    $scope.ready = true;
                    callback();
                }
            ]);
            
            return retrieveReferences;
        }();
        
        $scope.retrievePreviousItemsPage = function() {
            if ($scope.startPageNumber > 1) {
                $scope.startPageNumber--;
            }            
            if ($scope.currentPageNumber > 1) {
                $scope.currentPageNumber--;
            }
            $scope.retrieveReferences();
        };
        
        $scope.retrieveCustomItemsPage = function(customPageNumber) {            
            if (customPageNumber >= 1 && customPageNumber <= Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage)) {
                $scope.currentPageNumber = customPageNumber;
            }
            $scope.retrieveReferences();
        };         
        
        $scope.retrieveNextItemsPage = function() {
            if ($scope.startPageNumber < (Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage) - 2)) {
                $scope.startPageNumber++;
            }
            if ($scope.currentPageNumber < Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage)) {
                $scope.currentPageNumber++; 
            }
            $scope.retrieveReferences();
        };
        
        $scope.selectAll = function() {
            var allSelected = _.every($scope.aReferences, 'selected');
            _.each($scope.aReferences, function(r){r.selected = !allSelected;});
        };
        
        $scope.deleteSelected = function() {
            async.parallel(
                function(cb) {
                    
                }
            );
            $scope.deleteReference = function() {
                referencesService.deleteReference({              
                    id: $routeParams.id
                }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                    $location.path("browse-references");
                }).error(function(data, status, headers, config) {
                    systemStatusService.react(status);
                });
            };
        };
        
               
        
        $scope.deleteSelectedReferences = function(){
            var selectedReferences = _.filter($scope.aReferences, {selected: true});
            
            var deleteReferences = 
                _.map(selectedReferences, function(reference) {
                   return function(callback) {
                       referencesService.deleteReferenceAsync(
                            reference._id,
                            $window.sessionStorage.userToken,
                            function(result) {
                               callback(null, result);
                            }
                       );
                   };
                });
                
            var notifyResults = function(err, allResults){
                if (err) {
                    notificationService.info('Some error happened');
                    return;
                }
                var deletedReferences = 0;
                var notDeletedReferences = 0;
                var errors = 0;
                allResults.forEach(function(result) {
                    switch(result.status) {
                        case 200: 
                            _.remove($scope.aReferences, {_id: result.referenceId} );
                            deletedReferences++;
                            break;
                        case 409:
                            notDeletedReferences++;
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
                if (allResults.length === 0) {
                    msg = 'No References Selected';
                } else {
                    if (deletedReferences > 0) {
                        if (deletedReferences === 1) {
                            msg += deletedReferences + ' Reference Deleted.\n';
                        } else {
                            msg += deletedReferences + ' References Not Deleted.\n';
                        }
                    }
                    if (notDeletedReferences > 0 ) {
                        if (notDeletedReferences === 1) {
                            msg += notDeletedReferences + ' Reference could not be deleted.\n';
                        } else {
                            msg += notDeletedReferences + ' References could not be deleted.\n';
                        }
                    }
                    if (errors > 0 ) {
                        msg += 'Some error happened.\n';
                    }
                }
                notificationService.info(msg);
            };
            async.parallel(deleteReferences, notifyResults);
        };  
    }]
);