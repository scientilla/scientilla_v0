/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "repositoryReferencesBrowsingController", 
    ["$scope", "$routeParams", "repositoryReferencesService", "activatedRepositoriesService", "repositoriesService", "systemStatusService", "$window", "$location", "referencesService", 'notificationService',
    function($scope, $routeParams, repositoryReferencesService, activatedRepositoriesService, repositoriesService, systemStatusService, $window, $location, referencesService, notificationService) {
        $scope.repositoryId = $routeParams.repositoryId;            
        $scope.aReferences = [];      
        $scope.currentPage = 1;
        $scope.lastPage = null;
        $scope.firstPage = 1;
        $scope.oRepository = null;
        $scope.hasPaginationData = false;
        $scope.allSelected = false;
        
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
        
        $scope.retrievePrevReferences = function() {
            $scope.retrieveReferences(-1);
        };
        
        $scope.retrieveNextReferences = function() {
            $scope.retrieveReferences(+1);
        };
        
        $scope.retrieveReferences = function(pageIncr) {
            pageIncr = pageIncr || 0;
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            if (_.isNull($scope.oRepository)) {
                $scope.error = true;
                return;
            }
            if (pageIncr === 0) {
                $scope.currentPage = $scope.oRepository.config.page;
                $scope.firstPage = $scope.oRepository.config.page;
                $scope.lastPage = null;
            }
            async.series([
                function(callback) {
                    $scope.currentPage+= pageIncr;
                    var config = {
                        keywords: $scope.oRepository.config.keywords,
                        page: $scope.currentPage,
                        rows: $scope.oRepository.config.rows
                    };
                    repositoryReferencesService.getReferences(
                        $scope.repositoryId,
                        $window.sessionStorage.userToken,
                        config
                    ).success(function(data, status, headers, config) {
                        if (data.length < $scope.oRepository.config.rows) {
                            $scope.lastPage = $scope.currentPage;
                        }
                        repositoryReferencesService.aReferences = data;                   
                        $scope.aReferences = repositoryReferencesService.aReferences;
                        _.each($scope.aReferences, function(reference) {
                            reference.selected = false;
                        });
                        $scope.allSelected = false;
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
                    if (!_.isNull($scope.lastPage)) {
                        callback();
                        return;
                    }
                    var page = $scope.currentPage * $scope.oRepository.config.rows + 1;
                    var config = {
                        keywords: $scope.oRepository.config.keywords,
                        page: page,
                        rows: 1
                    };
                    repositoryReferencesService.getReferences(
                        $scope.repositoryId,
                        $window.sessionStorage.userToken,
                        config
                    ).success(function(data, status, headers, config) {
                        if (data.length === 0) {
                            $scope.lastPage = $scope.currentPage;
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
        
        $scope.init = function(){
            $scope.$watch(
                'aReferences', 
                function(newReferences) {
                    if (_.isEmpty(newReferences)) {
                        return;
                    }
                    var clonableReferences = _.filter(newReferences, {clonable: true});
                    var allSelected =  _.every(clonableReferences, { selected: true});
                    if (!allSelected) {
                        $scope.allSelected = allSelected;
                    }
                },
                true
            );
            $scope.$watch(
                'allSelected', 
                function(newAllSelected) {
                    var clonableReferences = _.filter($scope.aReferences, {clonable: true});
                    var allSelected =  _.every(clonableReferences, { selected: true });
                    if (newAllSelected || allSelected) {
                        _.each($scope.aReferences, function(reference) {
                            if (reference.clonable) {
                                reference.selected = newAllSelected;
                            }
                        });
                    }
                }
            );
            
            repositoriesService.getRepository(
                $scope.repositoryId,
                $window.sessionStorage.userToken
            ).success(function(data, status, headers, config){
                $scope.oRepository = data;
                $scope.currentPage = $scope.oRepository.config.page;
                $scope.firstPage = $scope.oRepository.config.page;
                $scope.hasPaginationData = $scope.oRepository 
                                            && $scope.oRepository.config 
                                            && !_.isNull($scope.oRepository.config.page)
                                            && !_.isUndefined($scope.oRepository.config.page)
                                            && !_.isNull($scope.oRepository.config.rows)
                                            && !_.isUndefined($scope.oRepository.config.rows)
                                            && _.contains($scope.oRepository.url, '{{page}}')
                                            && _.contains($scope.oRepository.url, '{{rows}}');
                if (!$scope.hasPaginationData) {
                    $scope.error = true;
                } else {
                    $scope.retrieveReferences();
                }
            }).error(function(data, status, headers, config) {
                $scope.error = true;
                systemStatusService.react(status);
            });
        };
    }]
);