var Models = require('../lib/promised-models'),
    expect = require('chai').expect;

describe('Models.inherit', function () {
    var ModelClass = Models.inherit({
        fields: {
            a: {
                type: 'string',
                default: 'a'
            }
        }
    });
    it('should have inherit', function () {
        expect(ModelClass.inherit).to.be.a('function');
    });
    it('should have fields', function () {
        var model = new ModelClass();
        expect(model).to.have.property('fields');
    });

});
