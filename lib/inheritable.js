/**
 * Inheritable
 */

var inherit = require('inherit');

module.exports = inherit({}, {
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
