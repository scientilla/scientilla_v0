/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "datasetReferenceCloningController", ["$scope", "$routeParams", "datasetReferencesService", "peerDatasetReferencesService", "datasetsService", "referencesService", "systemStatusService", "$window", "$location", function($scope, $routeParams, datasetReferencesService, peerDatasetReferencesService, datasetsService, referencesService, systemStatusService, $window, $location) {
        $scope.peerId = $routeParams.peerId; 
        $scope.datasetId = $routeParams.datasetId; 
        $scope.referenceId = $routeParams.referenceId; 
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
            async.series([
                function(callback) {
                    peerDatasetReferencesService.getReference(
                        $scope.peerId, 
                        $scope.datasetId, 
                        $scope.referenceId,
                        $window.sessionStorage.userToken
                    ).success(function(data, status, headers, config) {
                        for (key in data) {
                            $scope.oReference[key] = data[key];
                        }
                        $scope.extractAuthors();
                        $scope.extractOrganizations();
                        $scope.extractTags();                    
                        callback();
                    }).error(function(data, status, headers, config) {
                        systemStatusService.react(status, callback);
                    });
                }
            ]);
            
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
                    type: "PD",
                    peer_id: $scope.peerId,
                    dataset_id: $scope.datasetId,
                    reference_id: $scope.referenceId
                }
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $location.path("browse-dataset-references/" + $scope.peerId + "/" + $scope.datasetId);
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };        
    }]
);