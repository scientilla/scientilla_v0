/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").controller(
    "repositoryEditingController", 
    ["$scope", "$routeParams", "repositoriesService", "systemStatusService", "$window", "$location", 
    function($scope, $routeParams, repositoriesService, systemStatusService, $window, $location) {
        var extractorFields = [
            'title', 'authors', 'organizations', 'tags', 'year', 'doi', 'journal_name', 'journal_acronym', 
            'journal_pissn', 'journal_eissn', 'journal_issnl', 'journal_volume', 'journal_year', 'conference_name', 
            'conference_acronym', 'conference_place', 'book_title', 'book_isbn', 'book_pages', 
            'book_editor', 'abstract', 'month', 'print_status', 'note', 'approving_status', 'sharing_status'];        
        $scope.defaultRows = 20;
        $scope.defaultPage = 1;
        
        $scope.oEmptyRepository = {
            name: "",
            version: "",
            url: "",
            tags: [],
            tagsStr: "",
            config: {
                keywords: "",
                rows: $scope.defaultRows,
                page: $scope.page
            },
            extractors: {}
        };
        
        $scope.oRepository = _.defaults({}, $scope.oEmptyRepository);
        
        extractorFields.forEach(function(extractorField){
            $scope.oRepository.extractors[extractorField] = {
                field: extractorField,
                regex: ".*"
            }; 
        });        
        
        $scope.retrieveRepository = function retrieveRepository() {
            repositoriesService.getRepository(
                $routeParams.id, 
                $window.sessionStorage.userToken
            ).success(function(data, status, headers, config) {
                for (var key in data) {
                    $scope.oRepository[key] = data[key];
                }
                $scope.compressTags();
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
            
            return retrieveRepository;
        }();
        
        $scope.extractTags = function() {
            if (_.isEmpty($scope.oRepository.tagsStr)) {
                $scope.oRepository.tags = [];
            }
            else {
                $scope.oRepository.tags = _.uniq($scope.oRepository.tagsStr.split(/;\s*/));
            }
        };
        $scope.compressTags = function() {
            $scope.oRepository.tagsStr = $scope.oRepository.tags.join('; ');
        };
        
        $scope.updateRepository = function() {
            $scope.oRepository = _.defaults($scope.oRepository, $scope.oEmptyRepository);
            repositoriesService.updateRepository({
                name: $scope.oRepository.name,
                version: $scope.oRepository.version,
                url: $scope.oRepository.url,
                config: {
                    keywords: $scope.oRepository.config.keywords,
                    rows: $scope.oRepository.config.rows,
                    page: $scope.oRepository.config.page
                },
                extractors: $scope.oRepository.extractors,
                id: $scope.oRepository._id,
                tags: $scope.oRepository.tags
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $location.path("browse-repositories");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };       
    }]
);