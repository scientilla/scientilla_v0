/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
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
            var numberOfPages = Math.ceil($scope.totalNumberOfItems / $scope.numberOfItemsPerPage);
            if ($scope.startPageNumber < (numberOfPages - 2)) {
                $scope.startPageNumber++;
            }
            if ($scope.currentPageNumber < numberOfPages) {
                $scope.currentPageNumber++; 
            }
            $scope.retrieveReferences();
        };
        
        $scope.selectAll = function() {
            var allSelected = _.every($scope.aReferences, 'selected');
            _.each($scope.aReferences, function(r){r.selected = !allSelected;});
        };
        
        var referenceParams = {
            messages: {
                    "no-elems": 'No References Selected'
                },
            getCollection: function() {return $scope.aReferences;}
        };
               
        var deleteBulkParams = _.merge({
            functionToApply: referencesService.deleteReference,
            messages: {
                successful: {
                    singular: "Reference deleted.",
                    plural: "References deleted"
                },
                unsuccessful: {
                    singular: "Reference could not be deleted.",
                    plural: "References could not be deleted."
                }
            },
            onSuccess: function(id) {
                _.remove($scope.aReferences, {_id: id} );
            }
        }, referenceParams);
               
        var unshareBulkParams = _.merge({
            functionToApply: referencesService.setReferenceAsNotShared,
            messages: {
                successful: {
                    singular: "Reference unshared.",
                    plural: "References unshared."
                },
                unsuccessful: {
                    singular: "Reference could not be unshared.",
                    plural: "References could not be unshared."
                }
            },
            onSuccess: function(id) {
                $scope.referenceIdsSharingMap[id] = false;
            }
        }, referenceParams);
               
        var shareBulkParams = _.merge({
            functionToApply: referencesService.setReferenceAsShared,
            messages: {
                successful: {
                    singular: "Reference shared.",
                    plural: "References shared."
                },
                unsuccessful: {
                    singular: "Reference could not be shared.",
                    plural: "References could not be shared."
                }
            },
            onSuccess: function(id) {
                $scope.referenceIdsSharingMap[id] = true;
            }
        }, referenceParams);
        
        $scope.deleteSelectedReferences = _.partial(notificationService.applyOnSelectedElements, deleteBulkParams);
        $scope.unshareSelectedPeers = _.partial(notificationService.applyOnSelectedElements, unshareBulkParams);
        $scope.shareSelectedPeers = _.partial(notificationService.applyOnSelectedElements, shareBulkParams);
    }]
);