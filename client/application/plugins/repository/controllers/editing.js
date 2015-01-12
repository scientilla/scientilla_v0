/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "repositoryEditingController", 
    ["$scope", "$routeParams", "repositoriesService", "systemStatusService", "$window", "$location", 
    function($scope, $routeParams, repositoriesService, systemStatusService, $window, $location) {
        $scope.defaultRows = 20;
        $scope.defaultPage = 1;
        $scope.oRepository = {
            name: "",
            url: "",
            config: {
                keywords: "",
                rows: $scope.defaultRows,
                page: $scope.page
            },
            extractors: {
                authors: {
                    field: "authors",
                    regex: ".*"
                },
                title: {
                    field: "title",
                    regex: ".*"
                },
                journal_name: {
                    field: "journal_name",
                    regex: ".*"
                },
                conference_name: {
                    field: "conference_name",
                    regex: ".*"
                },
                book_title: {
                    field: "book_title",
                    regex: ".*"
                },
                doi: {
                    field: "doi",
                    regex: ".*"
                },
                year: {
                    field: "year",
                    regex: ".*"
                }
            }
        };
        
        $scope.retrieveRepository = function retrieveRepository() {
            repositoriesService.getRepository(
                $routeParams.id, 
                $window.sessionStorage.userToken
            ).success(function(data, status, headers, config) {
                for (var key in data) {
                    $scope.oRepository[key] = data[key];
                }
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
            
            return retrieveRepository;
        }();
        
        $scope.updateRepository = function() {
            repositoriesService.updateRepository({
                name: $scope.oRepository.name,
                url: $scope.oRepository.url,
                config: {
                    keywords: $scope.oRepository.config.keywords,
                    rows: $scope.oRepository.config.rows,
                    page: $scope.oRepository.config.page
                },
                extractors: $scope.oRepository.extractors,
                id: $scope.oRepository._id
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $location.path("browse-repositories");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };       
    }]
);