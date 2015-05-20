var expect = require('chai').expect;

describe('Nested models', function () {
    var Model = require('./models/with-nested');
    describe('model field', function () {
        var data, model;
        beforeEach(function () {
            data = {
                nested: {
                    a: 'a-0',
                    b: 'b-0'
                }
            };
            model = new Model(data);

        });
        it('should serialize to toJSON', function () {
            expect(model.toJSON()).to.be.deep.equal(data);
        });
        it('should trigger change on parent model', function (done) {
            model.on('change', function () {
                done();
            });
            model.get('nested').set('a', 'a-1');
        });
        it('should trigger change:field on parent model', function (done) {
            model.on('change:nested', function () {
                done();
            });
            model.get('nested').set('a', 'a-1');
        });
    });
});
