/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var _ = require("lodash");

module.exports = function () {
    var normalizeRankedReferences = function(references) {
        return _.map(references, function(r) {
            var reference = r.value.top;
            var all = r.value.all;
            var confirmedBy = _.where(all, function(r) {return r.clone_hash === reference.clone_hash;}).length;
            var reliability = parseInt(confirmedBy / all.length * 100);
            var versions = _.uniq(_.pluck(all, 'clone_hash')).length;
            reference.reliability = reliability;
            reference.others = r.value.others;
            reference.confirmedBy = confirmedBy;
            reference.versions = versions;
            return reference;
        });
    };
    return {
        normalizeRankedReferences: normalizeRankedReferences
    };
};