/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("network").controller(
    "worldDetailController", 
        ["$scope", "$routeParams", "worldNetworkReferencesService", "systemStatusService", "$window", "$location", 
        function($scope, $routeParams, worldNetworkReferencesService, systemStatusService, $window, $location) {
            $scope.keywords = "";
            $scope.aReferences = [];

            $scope.retrieveReferences = function() {
                $scope.empty = false;
                $scope.ready = false;
                $scope.error = false;
                async.series([
                    function(callback) {
                        worldNetworkReferencesService.getReference(
                            $routeParams.id,
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
            }();    
        }]        
);