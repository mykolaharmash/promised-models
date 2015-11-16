/**
 * Inheritable
 */

var inherit = require('inherit'),
    Inheritable;

/**
 * @class Inheritable
 */
Inheritable = inherit({}, {
    /**
     * inherit class
     * @param  {object} props
     * @param  {object} [staticProps]
     * @return {Model}
     */
    inherit: function (props, staticProps) {
        return inherit(this, props, staticProps);
    }
});

module.exports = Inheritable;
