/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("reference").controller(
    "localReferencesBrowsingController", ["$scope", "referencesService", "systemStatusService", "$window", "$location", function($scope, referencesService, systemStatusService, $window, $location) {
        $scope.generateReferenceIdsApprovingMap = function(aReferences) {
            var referenceIdsApprovingMap = {};
            for (lpKey in aReferences) {
                referenceIdsApprovingMap[aReferences[lpKey]._id] = aReferences[lpKey].approving_status;
            }
            return referenceIdsApprovingMap;
        }
        
        $scope.generateReferenceIdsSharingMap = function(aReferences) {
            var referenceIdsSharingMap = {};
            for (lpKey in aReferences) {
                referenceIdsSharingMap[aReferences[lpKey]._id] = aReferences[lpKey].sharing_status;
            }
            return referenceIdsSharingMap;
        }        
        
        $scope.empty = false;
        $scope.ready = false;
        async.series([
            function(callback) {
                $scope.aReferences = [];
                referencesService.getReferences($window.sessionStorage.token).success(function(data, status, headers, config) {
                    $scope.aReferences = data;
                    if ($scope.aReferences.length === 0) {
                        $scope.empty = true;
                    }                    
                    callback();
                }).error(function(data, status, headers, config) {
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
        
        $scope.changingApprovedReferenceId = "";
        $scope.switchReferenceApprovingStatus = function(id) {
            $scope.changingApprovedReferenceId = id;
            if (!$scope.referenceIdsApprovingMap[id]) {
                referencesService.setReferenceAsApproved(
                    id, 
                    $window.sessionStorage.token
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
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.referenceIdsApprovingMap[id] = false;
                    $scope.changingApprovedReferenceId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingApprovedReferenceId = "";
                    systemStatusService.react(status);
                });
            }
        }        
        
        $scope.changingSharedReferenceId = "";
        $scope.switchReferenceSharingStatus = function(id) {
            $scope.changingSharedReferenceId = id;
            if (!$scope.referenceIdsSharingMap[id]) {
                referencesService.setReferenceAsShared(
                    id, 
                    $window.sessionStorage.token
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
                    $window.sessionStorage.token
                ).success(function(data, status, headers, config) {
                    $scope.referenceIdsSharingMap[id] = false;
                    $scope.changingSharedReferenceId = ""; 
                }).error(function(data, status, headers, config) {
                    $scope.changingSharedReferenceId = "";
                    systemStatusService.react(status);
                });
            }
        }        
    }]
);