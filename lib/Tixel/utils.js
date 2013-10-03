'use strict';


/* type helper */

var toString = Object.prototype.toString;
var regex = /\[object (.*?)\]/;
module.exports.type = function (o) {
    if (o && o.nodeType === 1) {
        return 'element';
    }
    var match = toString.call(o).match(regex);
    var _type = match[1].toLowerCase();
    if (_type === 'number' && isNaN(o)) {
        return 'nan';
    }
    return _type;
};

/**
 * ndarray operations
 */
module.exports.iterate = require("cwise")({
    args: ["index", "array", "scalar"],
    body: function(idx, out, f) {
        f.apply(undefined, idx)
    }
});
