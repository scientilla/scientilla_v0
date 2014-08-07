/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("system").directive("activate", ["$location", function($location) {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            scope.location = $location;
            scope.$watch("location.path()", function(path) {
                if(("#" + path) === element[0].attributes["href"].value) {
                    element.parent().addClass("active");
                } else {
                    element.parent().removeClass("active");
                }
            });
        }
    };
}]);