/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").factory(
    "referencesService", function($http) {
        var cleanReferenceData = function(referenceData) {
            return {
                title: referenceData.title,
                authors: referenceData.authors,
                organizations: referenceData.organizations,
                tags: referenceData.tags,
                year: referenceData.year,
                doi: referenceData.doi,
                journal_name: referenceData.journal_name,
                journal_acronym: referenceData.journal_acronym,
                journal_pissn: referenceData.journal_pissn,
                journal_eissn: referenceData.journal_eissn,
                journal_issnl: referenceData.journal_issnl,
                journal_volume: referenceData.journal_volume,
                journal_year: referenceData.journal_year,
                conference_name: referenceData.conference_name,
                conference_acronym: referenceData.conference_acronym,
                conference_place: referenceData.conference_place,
                conference_year: referenceData.conference_year,
                book_title: referenceData.book_title,
                book_isbn: referenceData.book_isbn,
                book_pages: referenceData.book_pages,
                book_editor: referenceData.book_editor,
                book_year: referenceData.book_year,
                abstract: referenceData.abstract,
                month: referenceData.month,
                print_status: referenceData.print_status,
                note: referenceData.note
            };
        };
        
        var referencesProvider = {};
        
        referencesProvider.createReferenceAsync = function(reference, token, callback) {
            var referenceData = cleanReferenceData(reference);
            referenceData.source = {type: 'N'};
            referencesProvider
                .createReference(referenceData, token)
                .success(function(data, status, headers, config) {
                    if (_.isFunction(callback)) {
                        callback({reference: reference, status: status});
                    }
                }).error(function(data, status, headers, config) {
                    if (_.isFunction(callback)) {
                        callback({reference: reference, status: status});
                    }
                });
        };     
        
        referencesProvider.cloneReferenceFromPeer = function(peerId, referenceId, token, callback) {
            var cloningData = {
                source: {
                    peer_id: peerId,
                    reference_id: referenceId,
                    type: "P"
                }
            };
            this.createReference(cloningData, token)
                .success(function(data, status, headers, config) {
                    if (_.isFunction(callback)) {
                        callback({data: cloningData, status: status});
                    }
                }).error(function(data, status, headers, config) {
                    if (_.isFunction(callback)) {
                        callback({data: cloningData, status: status});
                    }
                });
        };
        
        referencesProvider.getReferences = function(keywords, currentPageNumber, numberOfItemsPerPage, token) {
            var params = {};
            if (keywords) {
                params.keywords = keywords;
            }
            if (currentPageNumber) {
                params.current_page_number = currentPageNumber;
            } 
            if (numberOfItemsPerPage) {
                params.number_of_items_per_page = numberOfItemsPerPage;
            }
            return $http({
				method: "GET",
				url: "/api/references",
                params: params,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.getReference = function(id, token) {
            return $http({
				method: "GET",
				url: "/api/references/" + id,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        referencesProvider.getReceivedReferences = function(token) {
            return $http({
				method: "GET",
				url: "/api/received-references",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.createReference = function(data, token) {
            return $http({
				method: "POST",
				url: "/api/references",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.updateReference = function(data, token) {
            return $http({
				method: "PUT",
				url: "/api/references/" + data.id,
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.deleteReference = function(data, token) {
            return $http({
				method: "DELETE",
				url: "/api/references/" + data.id,
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.cloneReference = function(data, token) {
            return $http({
				method: "POST",
				url: "/api/cloned-references",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        referencesProvider.setReferenceAsApproved = function(id, token) {
            return $http({
				method: "PATCH",
				url: "/api/references/" + id,
                data: { approving_status: true },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.setReferenceAsNotApproved = function(id, token) {
            return $http({
				method: "PATCH",
				url: "/api/references/" + id,
                data: { approving_status: false },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        referencesProvider.setReferenceAsShared = function(id, token) {
            return $http({
				method: "PATCH",
				url: "/api/references/" + id,
                data: { sharing_status: true },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.setReferenceAsNotShared = function(id, token) {
            return $http({
				method: "PATCH",
				url: "/api/references/" + id,
                data: { sharing_status: false },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        return referencesProvider;
    }    
);