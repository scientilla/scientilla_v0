/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module('dataset', []);
angular.module('peer', []);
angular.module('reference', []);
angular.module('repository', []);
angular.module('setting', []);
angular.module('system', []);
angular.module('user', []);

angular.module("scientilla", [
    "ngRoute",
    "ui.bootstrap",
    "dataset",
    "peer",
    "reference",
    "repository",
    "setting",
    "system",
    "user"
]);