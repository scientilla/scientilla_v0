/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module('dataset', []);
angular.module('network', []);
angular.module('peer', []);
angular.module('reference', []);
angular.module('repository', []);
angular.module('tags', []);
angular.module('setting', []);
angular.module('system', []);
angular.module('user', []);
angular.module('discovery', []);

angular.module("scientilla", [
    "ngRoute",
    "ui.bootstrap",
    "ui.select2",   
    "ngAnimate",
    "toaster",
    "dataset",
    "network",
    "peer",
    "reference",
    "repository",
    "tags",
    "setting",
    "system",
    "user",
    "discovery"
]);