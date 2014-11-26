/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").controller(
    "referenceCopyController", 
    ["$scope", "$routeParams", "referencesService", "systemStatusService", "$window", "$location",  "tagsService", "notificationService",
    function($scope, $routeParams, referencesService, systemStatusService, $window, $location, tagsService, notificationService) {
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
                    .getTags(keywords, $window.sessionStorage.userToken)
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
        $scope.tag = "";
        $scope.hash = "";
        
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
        
        $scope.retrieveReference = function() {
            referencesService.getReference(
                $routeParams.id, 
                $window.sessionStorage.userToken
            ).success(function(data, status, headers, config) {
                for (var key in data) {
                    $scope.oReference[key] = data[key];
                }
                $scope.extractAuthors();
                $scope.extractOrganizations();
                $scope.hash = $scope.oReference.original_hash;
                
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };
        
        $scope.createReference = function() {
            referencesService.createReferenceAsync(
                $scope.oReference, 
                $window.sessionStorage.userToken,
                function(result) {
                    switch (result.status) {
                        case 200:
                            notificationService.info('Reference created.');
                            $location.path("browse-references");
                        break;
                        case 404:
                        case 500:
                            notificationService.error('An error happened.');
                        break;
                        case 409:
                            notificationService.error('Reference already present.');
                        break;
                    }
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