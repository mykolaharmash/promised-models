var Models = require('../lib/promised-models');
require('chai').expect();

describe('Models.inherit', function () {
    var modelClass = Models.inherit({
        fields: {
            a: {
                type: 'string',
                default: 'a'
            }
        }
    });

});
