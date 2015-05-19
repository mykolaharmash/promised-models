/**
 * Storage
 */

var Inheritable = require('./inheritable');


/**
 * Abstract class for model storage
 * @class {Inheritable} Storage
 */
module.exports = Inheritable.inherit({
        /**
         * save model to storage
         * @param  {Model} model
         * @abstract
         * @return {Model.id|Promise<{Model.id}>}
         */
        insert: function () {
            throw new Error('.insert() is not implemented');
        },

        /**
         * update model in storage
         * @param  {Model} model
         * @abstract
         * @return {Model.id|Promise<{Model.id}>}
         */
        update: function () {
            throw new Error('.update() is not implemented');
        },

        /**
         * find model in storage
         * @param  {Model} model
         * @abstract
         * @return {object|Promise<{object}>} data
         */
        find: function () {
            throw new Error('.find() is not implemented');
        },


        /**
         * find model in storage
         * @param  {Model} model
         * @abstract
         * @return {undefined|Promise}
         */
        remove: function () {
            throw new Error('.find() is not implemented');
        }
});
