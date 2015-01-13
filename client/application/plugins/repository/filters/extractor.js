/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module('repository').filter('extractor', function() {
    return function(input) {
        var output = input
            .replace('_', ' ')
            .toLowerCase()
            .replace(
                /\b[a-z]/g, 
                function(letter) {
                    return letter.toUpperCase();
                }
            );
        return output;
    };
});