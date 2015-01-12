/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "peerReferenceOpeningController", 
    ["$scope", "$routeParams", "peerReferencesService", "systemStatusService", "$window", "$location", "tagsService",
    function($scope, $routeParams, peerReferencesService, systemStatusService, $window, $location, tagsService) {
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
        
        $scope.getReturnPath = function() {
            switch ($window.sessionStorage.referenceOpeningCallOrigin) {
                case "network-listing":
                    return "#/browse-network";
                    break;
                case "world-network-listing":
                    return "#/browse-world-network";
                    break;
                case "local-listing":
                default:
                    return "#/browse-references";                
            }
        };
        
        $scope.extractAuthors = function() {
            if (_.isUndefined($scope.oReference.authors) || $scope.oReference.authors.trim() === "") { 
                $scope.oReference.aAuthors = [];
            } else {
                $scope.oReference.aAuthors = $scope.oReference.authors.replace(" and ", ", ").split(/,\s?/); 
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
            peerReferencesService.getReference(
                $routeParams.peerId,
                $routeParams.referenceId,
                $window.sessionStorage.userToken
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
        
        $scope.init = function() {
            $scope.retrieveReference();
        };        
    }]
);