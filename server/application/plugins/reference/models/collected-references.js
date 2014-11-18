/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var _ = require("lodash");

module.exports = function () {
    var normalizeRankedReferences = function(references) {
        return _.map(references, function(r) {
            var reference = r.value.top;
            var counts = _.map(r.value.others, function(o) {return o.references.length;});
            var countsSum = _.reduce(counts, function(sum, num) {
                return sum + num;
            });
            var confirmedBy = _.max(counts);
            var reliability = parseInt(confirmedBy / countsSum * 100);
            reference.reliability = reliability;
            reference.others = r.value.others;
            reference.confirmedBy = confirmedBy;
            return reference;
        });
    };
    return {
        normalizeRankedReferences: normalizeRankedReferences
    };
};