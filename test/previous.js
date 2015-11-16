var expect = require('chai').expect;

describe('Previous', function () {
    var Model = require('../lib/model'),
        ModelClass, model;

    ModelClass = Model.inherit({
        attributes: {
            a: Model.attributeTypes.String
        }
    });

    beforeEach(function () {
        model = new ModelClass({
            id: 1,
            a: 'a-1'
        });
    });

    describe('previous', function () {

        it('should return attribute previous value', function () {
            model.set('a', 'a-2');
            expect(model.previous('a')).to.be.equal('a-1');
            model.set('a', 'a-3');
            expect(model.previous('a')).to.be.equal('a-2');
            model.revert();
            expect(model.previous('a')).to.be.equal('a-3');
        });

        it('should return attribute previous value after unset', function () {
            model.set('a', 'a-2');
            model.unset('a');
            expect(model.previous('a')).to.be.equal('a-2');
        });

        it('should return model previous state', function () {
            model.set({id: 2, a: 'a-2'});
            expect(model.previous()).to.be.deep.equal({id: 1, a: 'a-1'});
            model.set('a', 'a-3');
            expect(model.previous()).to.be.deep.equal({id: 1, a: 'a-2'});
            model.revert();
            expect(model.previous()).to.be.deep.equal({id: 2, a: 'a-3'});
        });

    });
});
