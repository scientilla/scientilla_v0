/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "referencesImportingController", 
    ["$scope", "referencesService", "systemStatusService", "$window", "$location", "$http", 
    function($scope, referencesService, systemStatusService, $window, $location, $http) {
        $scope.file = "";
        
        $scope.importReferences = function() {
            if ($scope.file) {
                var data = new FormData();
                data.append("file", $scope.file);
                $http({
                    method: "POST",
                    url: "/api/references",
                    data: data,
                    transformRequest: angular.identity,
                    cache: false,
                    timeout: 30000,
                    headers: {
                        "Content-Type": undefined,
                        "Authorization": "Bearer " + $window.sessionStorage.userToken
                    }
                }).success(function(data, status, headers, config){
                    $location.path("browse-references");
                }).error(function(data, status, headers, config){
                    systemStatusService.react(status);
                });
            }
        }
    }]
);