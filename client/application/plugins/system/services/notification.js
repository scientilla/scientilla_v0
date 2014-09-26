/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("system").factory(
    "notificationService", 
    ['toaster',
    function(toaster) {
        var notificationService = {
            info:    function(text) { toaster.pop('info', "", text, 2000); },
            success: function(text) { toaster.pop('success', "", text, 2000); },
            warning: function(text) { toaster.pop('warning', "", text, 2000); },
            error:   function(text) { toaster.pop('error', "", text, 2000); }
        };
        return notificationService;
    }]
);
