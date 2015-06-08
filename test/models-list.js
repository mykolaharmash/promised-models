var expect = require('chai').expect;

describe('Models list', function () {
    var Model = require('./models/with-nested'),
        NestedModel = require('./models/with-calculations'),
        model, collectionData = [
            {a: 'a-0'},
            {a: 'a-1'},
            {a: 'a-2'}
        ];
    beforeEach(function () {
        console.log('beforeEach');
        model = new Model({
            nested: {
                invalid: 1
            },
            collection: collectionData,
            collectionWithInvalid: [
                {invalid: 1}
            ]
        });
        return model.ready();
    });

    describe('toJSON', function () {
        it('should serialize models list', function () {
            var json = model.toJSON();
            expect(json.collection).to.be.a('array');
            expect(json.collection[0].a).to.be.equal('a-0');
            expect(json.collection[0].asyncDepended).to.be.equal('a-0-b-0-c-0-async');
        });
    });

    describe('ready', function () {
        it('should fulfill', function () {
            return model.ready();
        });
    });

    describe('list methods', function () {
        describe('get', function () {
            it('should return models by key', function () {
                expect(model.get('collection').get(0).get('a')).to.be.equal('a-0');
            });
        });
        describe('length', function () {
            it('should return list length', function () {
                expect(model.get('collection').length()).to.be.equal(3);
            });
        });
        describe('push', function () {
            it('should add to collection', function () {
                model.get('collection').push({a: 'a-3'});
                model.get('collection').push(new NestedModel({a: 'a-4'}));
                return model.ready().then(function () {
                    expect(model.toJSON().collection.length).to.be.equal(5);
                    expect(model.toJSON().collection[3].asyncDepended).to.be.equal('a-3-b-3-c-3-async');
                    expect(model.toJSON().collection[4].asyncDepended).to.be.equal('a-4-b-4-c-4-async');
                });
            });
        });
    });

    describe('validate', function () {
        it('should fulfill for valid', function () {
            return model.validate();
        });
        it('should reject for invalid', function (done) {
            model.get('collectionWithInvalid').get(0).set('invalid', 0);
            model.validate().fail(function () {
                done();
            }).done();
        });
    });

    describe('isChanged', function () {
        it('should be true after ready', function () {
            expect(model.isChanged()).to.be.equal(true);
        });
        it('should be false after ready and commit', function () {
            model.commit();
            expect(model.isChanged()).to.be.equal(false);
        });
        it('should be false after ready and revert', function () {
            model.revert();
            expect(model.isChanged()).to.be.equal(false);
        });
        it('should be true after change model inside collection', function () {
            model.commit();
            model.get('collection').get(0).set('a', 'a-1');
            expect(model.isChanged()).to.be.equal(true);
        });
        it('should be false change inside collection and revert', function () {
            model.commit();
            model.get('collection').get(0).set('a', 'a-1');
            return model.ready(function () {
                expect(model.isChanged()).to.be.equal(true);
                model.revert();
                expect(model.isChanged()).to.be.equal(false);
            });
        });
    });

    describe('set', function () {
        it('should set new values to collection', function () {
            model.set('collection', [
                {a: 'a-10'}
            ]);
            expect(model.toJSON().collection[0].a).to.be.equal('a-10');
            expect(model.get('collection').get(0).get('a')).to.be.equal('a-10');
        });
    });

    describe('change', function () {
        it('should trigger on change of model inside collection', function (done) {
            model.on('change', function () {
                expect(model.get('collection').get(0).get('asyncDepended')).to.be.equal('a-10-b-10-c-10-async');
                done();
            });
            model.get('collection').get(0).set('a', 'a-10');
        });
        it('should trigger change on add to collection', function (done) {
            model.on('change', function () {
                expect(model.toJSON().collection[3].asyncDepended).to.be.equal('a-3-b-3-c-3-async');
                expect(model.toJSON().collection[4].asyncDepended).to.be.equal('a-4-b-4-c-4-async');
                done();
            });
            model.get('collection').push({a: 'a-3'});
            model.get('collection').push(new NestedModel({a: 'a-4'}));
        });
        it('should trigger change on removed from collection', function (done) {
            model.on('change', function () {
                expect(model.get('collection').length()).to.be.equal(2);
                done();
            });
            model.get('collection').pop();
        });
        it('should trigger on change of model added to collection', function (done) {
            var nestedModel = new NestedModel({a: 'a-3'});
            nestedModel.ready().then(function () {
                model.get('collection').push(nestedModel);
                return model.ready();
            }).then(function () {
                model.on('change', function () {
                    expect(model.get('collection').get(3).get('asyncDepended')).to.be.equal('a-10-b-10-c-10-async');
                    done();
                });
                nestedModel.set('a', 'a-10');
            }).done();
        });
        it('should not trigger event on removed model', function () {
            var changeCall = 0;
            model.on('change', function () {
                changeCall++;
                expect(changeCall).to.be.below(2);
            });
            var nestedModel = model.get('collection').shift();
            return model.ready().then(function () {
                expect(changeCall).to.be.equal(1);
                nestedModel.set('a', 'a-10');
                return nestedModel.ready();
            });
        });

        it('should be trigered for models added through .set', function (done) {
            var nestedModel = new NestedModel({a: 'a-3'});
            nestedModel.ready().then(function () {
                model.set({
                    collection: [nestedModel]
                });
                return model.ready();
            }).then(function () {
                model.on('change', function () {
                    done();
                });
                nestedModel.set('a', 'a-10');
            }).done();
        });

    });

    describe('destruct', function () {
        it('should remove model from collection', function (done) {
            model.on('change', function () {
                expect(model.get('collection').length()).to.be.equal(2);
                done();
            });
            model.get('collection').get(1).destruct();
        });
    });

});
