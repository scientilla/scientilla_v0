/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "repositoryAdditionController", 
    ["$scope", "repositoriesService", "systemStatusService", "$window", "$location", 
    function($scope, repositoriesService, systemStatusService, $window, $location) {
        var extractorFields = [
            'title', 'authors', 'organizations', 'tags', 'year', 'doi', 'journal_name', 'journal_acronym', 
            'journal_pissn', 'journal_eissn', 'journal_issnl', 'journal_volume', 'journal_year', 'conference_name', 
            'conference_acronym', 'conference_place', 'conference_year', 'book_title', 'book_isbn', 'book_pages', 
            'book_editor', 'book_year', 'abstract', 'month', 'print_status', 'note', 'approving_status', 'sharing_status'];
        $scope.defaultPage = 1;
        $scope.defaultRows = 20;
        $scope.oRepository = {
            name: "",
            url: "",
            config: {
                keywords: "",
                rows: $scope.defaultRows,
                page: $scope.defaultPage
            },
            extractors: {}
        };
        extractorFields.forEach(function(extractorField){
            $scope.oRepository.extractors[extractorField] = {
                field: extractorField,
                regex: ".*"
            }; 
        });
        
        $scope.createRepository = function() {
            repositoriesService.createRepository({
                name: $scope.oRepository.name,
                url: $scope.oRepository.url,
                config: {
                    keywords: $scope.oRepository.config.keywords,
                    rows: $scope.oRepository.config.rows,
                    page: $scope.oRepository.config.page
                },
                extractors: $scope.oRepository.extractors
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $location.path("browse-repositories");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };       
    }]
);