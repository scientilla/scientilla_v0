/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("discovery").controller(
    "mainController", 
    ["$scope", "$routeParams", "repositoryReferencesService", "repositoriesService", "systemStatusService", "$window", "$location", "referencesService", 'notificationService', 'discoveryService',
    function($scope, $routeParams, repositoryReferencesService, repositoriesService, systemStatusService, $window, $location, referencesService, notificationService, discoveryService) {
        $scope.repositoryId = $routeParams.repositoryId;            
        $scope.aReferences = [];      
        $scope.currentPage = 1;
        $scope.lastPage = null;
        $scope.firstPage = 1;
        $scope.oRepositories = null;
        $scope.allSelected = false;
        $scope.aliases = JSON.parse($window.sessionStorage.userAliases);
        $scope.userType = $window.sessionStorage.userType;
        $scope.config = {
            keywords: "",
            page: 1,
            rows: 20
        };
        
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
//            if (_.isNull($scope.oRepositories)) {
//                $scope.error = true;
//                return;
//            }
            if (pageIncr === 0) {
                $scope.currentPage = $scope.config.page;
                $scope.firstPage = $scope.config.page;
                $scope.lastPage = null;
            }
            async.series([
                function(callback) {
                    $scope.currentPage+= pageIncr;
                    var config = {
                        keywords: $scope.config.keywords,
                        page: $scope.currentPage,
                        rows: $scope.config.rows,
                        aliases: $scope.aliases,
                        user_type: $scope.userType
                    };
                    discoveryService.getReferences(
                        config,
                        $window.sessionStorage.userToken,
                        function(results) {
                            if (results.data.length < $scope.config.rows) {
                                $scope.lastPage = $scope.currentPage;
                            }
                            $scope.aReferences = results.data;
                            _.each($scope.aReferences, function(reference) {
                                reference.selected = false;
                            });
                            $scope.allSelected = false;
                            if ($scope.aReferences.length === 0) {
                                $scope.empty = true;
                            }                    
                            callback();
                        },
                        function(data, status, headers, config) {
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
            
            $scope.retrieveReferences();
            
//            repositoriesService.getRepositories(
//                $window.sessionStorage.userToken
//            ).success(function(data, status, headers, config){
//                $scope.oRepositories = data;
//                $scope.currentPage = $scope.config.page;
//                $scope.firstPage = $scope.config.page;
//                $scope.hasPaginationData = $scope.oRepositories 
//                                            && $scope.config 
//                                            && !_.isNull($scope.config.page)
//                                            && !_.isUndefined($scope.config.page)
//                                            && !_.isNull($scope.config.rows)
//                                            && !_.isUndefined($scope.config.rows)
//                                            && _.contains($scope.oRepositories[0].url, '{{page}}')
//                                            && _.contains($scope.oRepositories[0].url, '{{rows}}');
//                if (!$scope.hasPaginationData) {
//                    $scope.error = true;
//                } else {
//                    $scope.retrieveReferences();
//                }
//            }).error(function(data, status, headers, config) {
//                $scope.error = true;
//                systemStatusService.react(status);
//            });
        };
    }]
);