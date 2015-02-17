/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "repositoryImportingController", 
    ["$scope", "repositoriesService", "systemStatusService", "$window", "$location", "$http", 
    function($scope, repositoriesService, systemStatusService, $window, $location, $http) {
        $scope.oRepository = {
            file: ""
        };
        
        $scope.importRepository = function() {
            if ($scope.oRepository.file) {
                var formData = new FormData();
                formData.append("file", $scope.oRepository.file);
                $http.post("/api/repositories", formData, {
                    transformRequest: angular.identity,
                    cache: false,
                    timeout: 30000,
                    headers: {
                        "Content-Type": undefined,
                        "Authorization": "Bearer " + $window.sessionStorage.userToken
                    }
                }).success(function(data, status, headers, config){
                    $location.path("browse-repositories");
                }).error(function(data, status, headers, config){
                    systemStatusService.react(status);
                });
            }
        }
    }]
);