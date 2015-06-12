
var expect = require('chai').expect,
    Vow = require('vow');

describe('Persistent', function () {
    var Model = require('../lib/model'),
        Persistent = require('./models/persistent'),
        Complex = Model.inherit({
            attributes: {
                nested: Model.attributeTypes.Model(Persistent),
                collection: Model.attributeTypes.ModelsList(Persistent),
                nestedId: Model.attributeTypes.Number.inherit({
                    calculate: function () {
                        return this.model.get('nested').id;
                    }
                }),
                collectionIds: Model.attributeTypes.List.inherit({
                    isEqual: function (value) {
                        return JSON.stringify(value) === JSON.stringify(this.value);
                    },
                    calculate: function () {
                        return this.model.get('collection').toArray().map(function (model) {
                            return model.id;
                        });
                    }
                })
            }
        });

    describe('isNew', function () {
        it('should be true after model create', function () {
            var model = new Persistent();
            expect(model.isNew()).to.be.equal(true);
        });
    });

    describe('nested model save', function () {
        it('should call calculate', function () {
            var complex = new Complex(),
                model = complex.get('nested');
            return model.save().then(function () {
                return complex.ready();
            }).then(function () {
                expect(complex.get('nestedId')).to.be.equal(model.id);
            });
        });
    });

    describe('remove', function () {
        it('should prevent further save', function (done) {
            var model =  new Persistent();
            model.save().then(function () {
                model.remove();
                return model.save().fail(function (err) {
                    expect(err.message).to.have.string('destructed');
                    return Vow.fulfill();
                });
            }).then(function () {
                done();
            }).done();
        });
    });

    describe('collection save', function () {
        it('should call calculate', function () {
            var complex = new Complex(),
                model = new Persistent();

            complex.get('collection').push(model);

            return model.save().then(function () {
                return complex.ready();
            }).then(function () {
                expect(complex.get('collectionIds').get(0)).to.be.equal(model.id);
            });
        });
    });

    it('should save and fetch model by id', function (done) {
        var model1 = new Persistent();
        model1.set('a', 'a-2');
        model1.save().then(function () {
            var model2 = new Persistent(model1.id);
            return model2.fetch().then(function () {
                expect(model2.get('a')).to.be.equal('a-2');
                done();
            });
        }).done();
    });
    it('should insert and update calculated attributes', function () {
        var model1 = new Persistent();
        model1.set('a', 'a-2');
        return model1.save().then(function () {
            expect(Persistent.testStorage[model1.id]).to.have.property('a', 'a-2');
            expect(Persistent.testStorage[model1.id]).to.have.property('b', 'b-2');
            model1.set('a', 'a-3');
            return model1.save();
        }).then(function () {
            expect(Persistent.testStorage[model1.id]).to.have.property('a', 'a-3');
            expect(Persistent.testStorage[model1.id]).to.have.property('b', 'b-3');
        });
    });
    it('should update', function (done) {
        var model1 = new Persistent();
        model1.set('a', 'a-1');
        model1.save().then(function () {
            var model2 = new Persistent(model1.id);
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
        var model1 = new Persistent({
            a: 'a-3'
        });
        expect(model1.get('a')).to.be.equal('a-3');
        model1.save().then(function () {
            var id = model1.id;
            return model1.remove().then(function () {
                var model2 = new Persistent(id);
                return model2.fetch().fail(function () {
                    done();
                });
            });
        }).done();
    });
});
