/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("system").factory(
    "notificationService", 
    ['toaster', '$window', "systemStatusService", 
    function(toaster, $window, systemStatusService) {
        var notificationService = {
            info:    function(text) { toaster.pop('info', "", text, 2000); },
            success: function(text) { toaster.pop('success', "", text, 2000); },
            warning: function(text) { toaster.pop('warning', "", text, 2000); },
            error:   function(text) { toaster.pop('error', "", text, 2000); }
        };
        
        notificationService.applyOnSelectedElements = function(params){
            var collection = params.getCollection();
            var selectedElements = _.filter(collection, {selected: true});
            var funToApply = params.functionToApply;
            
            var bulkAction = 
                _.map(selectedElements, function(elem) {
                    return function(callback) {
                        funToApply(elem._id, $window.sessionStorage.userToken)
                            .success(function(data, status, headers, config) {
                                    callback(null, {elemId: elem._id, status: status});
                            })
                            .error(function(data, status, headers, config) {
                                    callback(null, {elemId: elem._id, status: status});
                            });
                   };
                });

            var notifyResults = function(err, allResults){
                if (err) {
                    notificationService.info('Some error happened');
                    return;
                }
                var successfulElems = 0;
                var unsuccessfulElems = 0;
                var errors = 0;
                allResults.forEach(function(result) {
                    switch(result.status) {
                        case 200: 
                            params.onSuccess(result.elemId);
                            successfulElems++;
                            break;
                        case 430:
                            unsuccessfulElems++;
                            break;
                        case 404:
                        case 500:
                            systemStatusService.react(result.status);
                            errors++;
                            break;
                        default:
                            systemStatusService.react(result.status);
                            errors++;
                    }
                });
                var msg = "";
                var messages = params.messages;
                if (allResults.length === 0) {
                    msg = params.messages['no-elems'];
                } else {
                    if (successfulElems > 0) {
                        if (successfulElems === 1) {
                            msg += successfulElems + ' ' + messages.successful.singular + '\n';
                        } else {
                            msg += successfulElems + ' ' + messages.successful.plural + '\n';
                        }
                    }
                    if (unsuccessfulElems > 0 ) {
                        if (unsuccessfulElems === 1) {
                            msg += unsuccessfulElems + ' ' + messages.unsuccessful.singular + '\n';
                        } else {
                            msg += unsuccessfulElems + ' ' + messages.unsuccessful.plural + '\n';
                        }
                    }
                    if (errors > 0 ) {
                        msg += 'Some error happened.\n';
                    }
                }
                notificationService.info(msg);
            };
            async.parallel(bulkAction, notifyResults);
        }; 
        
        return notificationService;
    }]
);
