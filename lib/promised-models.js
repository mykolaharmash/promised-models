/**
 * Promised models
 */

var inherit = require('inherit'),
    Models = inherit({}, {
        /**
         * inherit model class
         * @param  {object} props
         * @param  {object} [staticProps]
         * @return {Models}
         */
        inherit: function (props, staticProps) {
            return inherit(Models, props, staticProps);
        }
    });

module.exports = Models;

