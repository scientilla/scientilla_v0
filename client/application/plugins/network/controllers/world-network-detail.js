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
        
            $scope.cloneReference = function(reference) {
                referencesService.createReferenceAsync(
                    reference, 
                    $window.sessionStorage.userToken, 
                    function(result) {
                        switch(result.status) {
                            case 200: 
                                notificationService.info('Reference cloned');
                                result.reference.clonable = false;
                                result.reference.selected = false;
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
                           referencesService.createReferenceAsync(
                               reference, 
                               $window.sessionStorage.userToken,
                                function(result) {
                                   callback(null, result);
                                }
                           );
                       };
                    });

                var notifyResults = function(err, results){
                    if (err) {
                        notificationService.info('Some error happened');
                        return;
                    }
                    var clonedReferences = 0;
                    var duplicatedReferences = 0;
                    var errors = 0;
                    results.forEach(function(result) {
                        switch(result.status) {
                            case 200: 
                                result.reference.clonable = false;
                                result.reference.selected = false;
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
                    if (results.length === 0) {
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