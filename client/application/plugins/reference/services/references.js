/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").factory(
    "referencesService", function($http) {
        var referencesProvider = {};
        
        referencesProvider.createReferenceAsync = function(reference, token, callback) {
            referencesProvider.createReference({
                title: reference.title,
                authors: reference.authors,
                organizations: reference.organizations,
                tags: reference.tags,
                year: reference.year,
                doi: reference.doi,
                journal_name: reference.journal_name,
                journal_acronym: reference.journal_acronym,
                journal_pissn: reference.journal_pissn,
                journal_eissn: reference.journal_eissn,
                journal_issnl: reference.journal_issnl,
                journal_volume: reference.journal_volume,
                journal_year: reference.journal_year,
                conference_name: reference.conference_name,
                conference_acronym: reference.conference_acronym,
                conference_place: reference.conference_place,
                conference_year: reference.conference_year,
                book_title: reference.book_title,
                book_isbn: reference.book_isbn,
                book_pages: reference.book_pages,
                book_editor: reference.book_editor,
                book_year: reference.book_year,
                abstract: reference.abstract,
                month: reference.month,
                print_status: reference.print_status,
                note: reference.note
            }, token).success(function(data, status, headers, config) {
                if (_.isFunction(callback)) {
                    callback({reference: reference, status: status});
                }
            }).error(function(data, status, headers, config) {
                if (_.isFunction(callback)) {
                    callback({reference: reference, status: status});
                }
            });
        };     
        
        referencesProvider.getReferences = function(keywords, token) {
            var params = {};
            if (keywords) {
                params.keywords = keywords;
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
				method: "PUT",
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
				method: "PUT",
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
				method: "PUT",
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
				method: "PUT",
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