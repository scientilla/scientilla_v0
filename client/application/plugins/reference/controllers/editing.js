/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "referenceEditingController", 
    ["$scope", "$routeParams", "referencesService", "systemStatusService", "$window", "$location", "tagsService",
    function($scope, $routeParams, referencesService, systemStatusService, $window, $location, tagsService) {
        $scope.oReference = {
            title: "",
            authors: "",
            aAuthors: [],
            organizations: "",
            aOrganization: [],
            tags: [],
            year: "",
            doi: "",
            journal_name: "",
            journal_acronym: "",
            journal_pissn: "",
            journal_eissn: "",
            journal_issnl: "",
            journal_volume: "",
            journal_year: "",
            conference_name: "",
            conference_acronym: "",
            conference_place: "",
            conference_year: "",
            book_title: "",
            book_isbn: "",
            book_pages: "",
            book_editor: "",
            book_year: "",
            abstract: "",
            month: "",
            print_status: "",
            note: ""
        };
        $scope.select2Options = {
            placeholder: "Search for a tag",
            minimumInputLength: 1,
            separator: " ",
            query: function (query) {
                var data = {results: []};
                var keywords = query.term.trim().split(" ");
                tagsService
                    .getTags(keywords, $window.sessionStorage.token)
                    .success(function(results){
                        var newCategory = keywords.join(".");
                        if (!_.isEmpty(newCategory) && !_.contains(results, newCategory)) {
                            results.unshift(newCategory);
                        }
                        var filteredResults = _.filter(results, function(r){ return !_.contains($scope.oReference.tags, r);});
                        var reformattedResults = _.map(filteredResults, function(r){return {id: r, text:r};});
                        data.results = data.results.concat(reformattedResults);
                        query.callback(data);
                    });
            },
            initSelection : function (element, callback) {
                var data = {id: element.val(), text: element.val()};
                callback(data);
            }
        };
        $scope.userType = $window.sessionStorage.userType;
        $scope.tag = "";
        
        $scope.extractAuthors = function() {
            if ($scope.oReference.aAuthors !== "") { 
                $scope.oReference.aAuthors = $scope.oReference.authors.replace(" and ", ", ").split(", "); 
            } else {
                $scope.oReference.aAuthors = [];
            }
        };
        
        $scope.extractOrganizations = function() {
            if (_.isUndefined($scope.oReference.organizations) || $scope.oReference.organizations.trim() === "") { 
                $scope.oReference.aOrganizations = [];
            } else {
                $scope.oReference.aOrganizations = $scope.oReference.organizations.split(/,\s?/); 
            }
        };
        
        $scope.retrieveReference = function() {
            referencesService.getReference(
                $routeParams.id, 
                $window.sessionStorage.token
            ).success(function(data, status, headers, config) {
                for (var key in data) {
                    $scope.oReference[key] = data[key];
                }
                $scope.extractAuthors();
                $scope.extractOrganizations();
                
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };
        
        $scope.updateReference = function() {
            referencesService.updateReference({
                title: $scope.oReference.title,
                authors: $scope.oReference.authors,
                organizations: $scope.oReference.organizations,
                tags: $scope.oReference.tags,
                year: $scope.oReference.year,
                doi: $scope.oReference.doi,
                journal_name: $scope.oReference.journal_name,
                journal_acronym: $scope.oReference.journal_acronym,
                journal_pissn: $scope.oReference.journal_pissn,
                journal_eissn: $scope.oReference.journal_eissn,
                journal_issnl: $scope.oReference.journal_issnl,
                journal_volume: $scope.oReference.journal_volume,
                journal_year: $scope.oReference.journal_year,
                conference_name: $scope.oReference.conference_name,
                conference_acronym: $scope.oReference.conference_acronym,
                conference_place: $scope.oReference.conference_place,
                conference_year: $scope.oReference.conference_year,
                book_title: $scope.oReference.book_title,
                book_isbn: $scope.oReference.book_isbn,
                book_pages: $scope.oReference.book_pages,
                book_editor: $scope.oReference.book_editor,
                book_year: $scope.oReference.book_year,
                abstract: $scope.oReference.abstract,
                month: $scope.oReference.month,
                print_status: $scope.oReference.print_status,
                note: $scope.oReference.note,              
                id: $scope.oReference._id,
                author_hash: $scope.oReference.author_hash
            }, $window.sessionStorage.token).success(function(data, status, headers, config) {
                $location.path("browse-references");
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };    
        
        $scope.init = function() {
            $scope.$watch('tag', function(newTag) {
                if (_.isEmpty(newTag) || _.isNull(newTag)) {
                    return;
                }
                $scope.oReference.tags.push(newTag);
                $scope.tag = "";
            });
            $scope.retrieveReference();
        };
    }]
);