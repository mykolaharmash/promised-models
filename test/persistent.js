
var expect = require('chai').expect;

describe('Persistent', function () {
    var Model = require('./models/persistent');
    it('should save and fetch model by id', function (done) {
        var model1 = new Model();
        model1.set('a', 'a-2');
        model1.save().then(function () {
            var model2 = new Model(model1.id);
            return model2.fetch().then(function () {
                expect(model2.get('a')).to.be.equal('a-2');
                done();
            });
        }).done();
    });
    it('should insert and update calculated fields', function () {
        var model1 = new Model();
        model1.set('a', 'a-2');
        return model1.save().then(function () {
            expect(Model.testStorage[model1.id]).to.have.property('a', 'a-2');
            expect(Model.testStorage[model1.id]).to.have.property('b', 'b-2');
            model1.set('a', 'a-3');
            return model1.save();
        }).then(function () {
            expect(Model.testStorage[model1.id]).to.have.property('a', 'a-3');
            expect(Model.testStorage[model1.id]).to.have.property('b', 'b-3');
        });
    });
    it('should update', function (done) {
        var model1 = new Model();
        model1.set('a', 'a-1');
        model1.save().then(function () {
            var model2 = new Model(model1.id);
            return model2.fetch().then(function () {
                expect(model2.get('a')).to.be.equal('a-1');
                model2.set('a', 'a-2');
                return model2.save();
            }).then(function () {
                return model1.fetch();
            }).then(function () {
                expect(model1.get('a')).to.be.equal('a-2');
                done();
            });
        }).done();
    });
    it('should delete', function (done) {
        var model1 = new Model({
            a: 'a-3'
        });
        expect(model1.get('a')).to.be.equal('a-3');
        model1.save().then(function () {
            var id = model1.id;
            return model1.remove().then(function () {
                var model2 = new Model(id);
                return model2.fetch().fail(function () {
                    done();
                });
            });
        }).done();
    });
});
