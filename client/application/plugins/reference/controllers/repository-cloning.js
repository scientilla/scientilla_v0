/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "repositoryReferenceCloningController", ["$scope", "$routeParams", "repositoryReferencesService", "repositoriesService", "referencesService", "systemStatusService", "$window", "$location", function($scope, $routeParams, repositoryReferencesService, repositoriesService, referencesService, systemStatusService, $window, $location) {
        $scope.repositoryId = $routeParams.repositoryId;
        $scope.oReference = {
            title: "",
            authors: "",
            aAuthors: [],
            organizations: "",
            aOrganization: [],
            tags: "",
            aTags: [],
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
        
        $scope.extractAuthors = function() {
            if ($scope.oReference.aAuthors !== "") { 
                $scope.oReference.aAuthors = $scope.oReference.authors.replace(" and ", ", ").split(", "); 
            } else {
                $scope.oReference.aAuthors = [];
            }
        };
        
        $scope.extractOrganizations = function() {
            if ($scope.oReference.aOrganizations !== "") { 
                $scope.oReference.aOrganizations = $scope.oReference.organizations.split(", "); 
            } else {
                $scope.oReference.aOrganizations = [];
            }
        };
        
        $scope.extractTags = function() {
            if ($scope.oReference.aTags !== "") { 
                $scope.oReference.aTags = $scope.oReference.tags.split(", "); 
            } else {
                $scope.oReference.aTags = [];
            }
        };
        
        $scope.retrieveReference = function retrieveReference() {
            var data = repositoryReferencesService.getReference($routeParams.index);
            data.hasOwnProperty("title") ? $scope.oReference.title = data.title : null;
            data.hasOwnProperty("authors") ? $scope.oReference.authors = data.authors : null;
            data.hasOwnProperty("organizations") ? $scope.oReference.organizations = data.organizations : null;
            data.hasOwnProperty("tags") ? $scope.oReference.tags = data.tags : null;
            data.hasOwnProperty("year") ? $scope.oReference.year = data.year : null;
            data.hasOwnProperty("doi") ? $scope.oReference.doi = data.doi : null;
            data.hasOwnProperty("journal_name") ? $scope.oReference.journal_name = data.journal_name : null;
            data.hasOwnProperty("journal_acronym") ? $scope.oReference.journal_acronym = data.journal_acronym : null;
            data.hasOwnProperty("journal_pissn") ? $scope.oReference.journal_pissn = data.journal_pissn : null;
            data.hasOwnProperty("journal_eissn") ? $scope.oReference.journal_eissn = data.journal_eissn : null;
            data.hasOwnProperty("journal_issnl") ? $scope.oReference.journal_issnl = data.journal_issnl : null;
            data.hasOwnProperty("journal_volume") ? $scope.oReference.journal_volume = data.journal_volume : null;
            data.hasOwnProperty("journal_year") ? $scope.oReference.journal_year = data.journal_year : null;
            data.hasOwnProperty("conference_name") ? $scope.oReference.conference_name = data.conference_name : null;
            data.hasOwnProperty("conference_acronym") ? $scope.oReference.conference_acronym = data.conference_acronym : null;
            data.hasOwnProperty("conference_place") ? $scope.oReference.conference_place = data.conference_place : null;
            data.hasOwnProperty("conference_year") ? $scope.oReference.conference_year = data.conference_year : null;
            data.hasOwnProperty("book_title") ? $scope.oReference.book_title = data.book_title : null;
            data.hasOwnProperty("book_isbn") ? $scope.oReference.book_isbn = data.book_isbn : null;
            data.hasOwnProperty("book_pages") ? $scope.oReference.book_pages = data.book_pages : null;
            data.hasOwnProperty("book_editor") ? $scope.oReference.book_editor = data.book_editor : null;
            data.hasOwnProperty("book_year") ? $scope.oReference.book_year = data.book_year : null;
            data.hasOwnProperty("abstract") ? $scope.oReference.abstract = data.abstract : null;
            data.hasOwnProperty("month") ? $scope.oReference.month = data.month : null;
            data.hasOwnProperty("print_status") ? $scope.oReference.print_status = data.print_status : null;
            data.hasOwnProperty("note") ? $scope.oReference.note = data.note : null;                
            $scope.extractAuthors();
            $scope.extractOrganizations();
            $scope.extractTags();
            
            return retrieveReference;
        }();
        
        $scope.cloneReference = function() {
            referencesService.cloneReference({
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
                source: {
                    type: "R"
                }                
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $location.path("browse-repository-references/" + $scope.repositoryId);
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };        
    }]
);