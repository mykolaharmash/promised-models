var expect = require('chai').expect;

describe('Collection', function () {
    var Model = require('../lib/model'),
        Collection = require('../lib/collection'),
        Vow = require('vow'),
        TestModel, TestCollection, collection, collectionData;

    collectionData = [{
        id: 1,
        a: 'a-1'
    }, {
        id: 2,
        a: 'a-2'
    }, {
        id: 3,
        a: 'a-3'
    }];

    TestModel = Model.inherit({
        attributes: {
            id: Model.attributeTypes.Id,
            a: Model.attributeTypes.String
        },

        storage: Model.Storage.inherit({
            remove: function () {
                return Vow.fulfill().delay(0);
            }
        })
    });

    TestCollection = Collection.inherit({
        modelType: TestModel
    });

    beforeEach(function () {
        collection = new TestCollection(collectionData);
    });
    describe('internal model', function () {
        it('should throw exception if model has no id attribute', function () {
            var ModelWithoutId = Model;
            expect(function () {
                new (Collection.inherit({
                    modelType: ModelWithoutId    
                }));
             
            }).to.throw(Error); 
        }); 
    });

    describe('length', function () {
        it('should return count of models', function () {
            expect(collection.length).to.be.equal(3);
        });
    });

    describe('toJSON', function () {
        it('should serialize collection', function () {
            var data = collection.toJSON();
            expect(data).to.be.a('array');
            expect(data).to.be.deep.equal(collectionData);
        });
    });

    describe('at', function () {
        it('should return model by index', function () {
            expect(collection.at(0)).to.be.instanceOf(TestModel);
            expect(collection.at(0).toJSON()).to.be.deep.equal(collectionData[0]);
        });
    });

    describe('get', function () {
        it('should return model by id', function () {
            expect(collection.get(1)).to.be.instanceOf(TestModel);
            expect(collection.get(1).toJSON()).to.be.deep.equal({id: 1, a: 'a-1'});
        });

        it('should work correctly after changing id', function (done) {
            var model = collection.get(1);
            model.set('id', 4);
            model.ready().then(function () {
                expect(collection.get(4)).to.be.instanceOf(TestModel);
                expect(collection.get(4).toJSON()).to.be.deep.equal({id: 4, a: 'a-1'});
                done();
            });
        });
    });

    describe('Array methods', function () {

        describe('forEach', function () {
            it('should iterate on models', function () {
                var data = [];
                collection.forEach(function (model, index) {
                    expect(model).to.be.instanceOf(TestModel);
                    expect(index).to.be.a('number');
                    data[index] = model.toJSON();
                });
                expect(data).to.be.deep.equal(collectionData);
            });
        });

        describe('some', function () {
            it('should return true if some model fulfills conditions', function () {
                var result, index;
                result = collection.some(function (model, i) {
                    expect(model).to.be.instanceOf(TestModel);
                    expect(i).to.be.a('number');
                    index = i;
                    return model.get('a') === 'a-2';
                });
                expect(index).to.be.equal(1);
                expect(result).to.be.true;
            });

            it('should return false if there is no models fulfills conditions', function () {
                var result, index;
                result = collection.some(function (model, i) {
                    expect(model).to.be.instanceOf(TestModel);
                    expect(i).to.be.a('number');
                    index = i;
                    return model.get('a') === 'a-4';
                });
                expect(index).to.be.equal(2);
                expect(result).to.be.false;
            });
        });

        describe('every', function () {
            it('should return true if every model fulfills conditions', function () {
                var result, index;
                result = collection.every(function (model, i) {
                    expect(model).to.be.instanceOf(TestModel);
                    expect(i).to.be.a('number');
                    index = i;
                    return model.getId() >= 1;
                });
                expect(index).to.be.equal(2);
                expect(result).to.be.true;
            });

            it('should return false if some model does not fulfill conditions', function () {
                var result, index;
                result = collection.every(function (model, i) {
                    expect(model).to.be.instanceOf(TestModel);
                    expect(i).to.be.a('number');
                    index = i;
                    return model.getId() > 1;
                });
                expect(index).to.be.equal(0);
                expect(result).to.be.false;
            });
        });

        describe('filter', function () {
            it('should return array of suitable models', function () {
                var models = collection.filter(function(model, index) {
                    expect(index).to.be.a('number');
                    return model.getId() < 3;
                });
                expect(models.length).to.be.equal(2);
                expect(models[0]).to.be.instanceOf(TestModel);
                expect(models[1]).to.be.instanceOf(TestModel);
                expect(models[0].toJSON()).to.be.deep.equal(collectionData[0]);
                expect(models[1].toJSON()).to.be.deep.equal(collectionData[1]);
            });
        });

        describe('map', function () {
            it('should return new array by models', function() {
                var ids = collection.map(function (model, index) {
                    expect(model).to.be.instanceOf(TestModel);
                    expect(index).to.be.a('number');
                    return model.getId();
                });
                expect(ids).to.be.deep.equal([1,2,3]);
            });
        });

        describe('reduce', function () {
            it('should return result by all models', function () {
                var sum = collection.reduce(function (result, model, index) {
                    expect(model).to.be.instanceOf(TestModel);
                    expect(index).to.be.a('number');
                    expect(result).to.be.a('number');
                    return result + model.getId();
                }, 0);
                expect(sum).to.be.equal(6);
            });
        });

        describe('find', function () {
            it('should return first suitable model', function (){
                var model, index;
                model = collection.find(function (model, i) {
                    expect(model).to.be.instanceOf(TestModel);
                    expect(i).to.be.a('number');
                    index = i;
                    return model.getId() === 2;
                });
                expect(index).to.be.equal(1);
                expect(model).to.be.instanceOf(TestModel);
                expect(model).to.be.equal(collection.at(1));
            });
        });
    });

    describe('where', function () {
        it('should return suitable models', function () {
            var models = collection.where({id: 1});
            expect(models).to.be.an('array');
            expect(models.length).to.be.equal(1);
            expect(models[0]).to.be.instanceOf(TestModel);
            expect(models[0].toJSON()).to.be.deep.equal(collectionData[0]);
        });
    });

    describe('findWhere', function () {
        it('should return first suitable model', function () {
            var model = collection.findWhere({id: 1});
            expect(model).to.be.instanceOf(TestModel);
            expect(model.toJSON()).to.be.deep.equal(collectionData[0]);
        });
    });

    describe('pluck', function () {
        it('should return an array of one attribute', function () {
            var ids = collection.pluck('id');
            expect(ids).to.be.deep.equal([1, 2, 3]);
        });
    });

    describe('add', function () {

        it('should trigger add event', function () {
            var count = 0;
            collection.on('add', function (model, options) {
                count++;
                expect(model).to.be.instanceOf(TestModel);
                expect(options).to.be.deep.equal({at: 3});
            });
            collection.add({id: 4, a: 'a-4'});
            expect(count).to.be.equal(1);
        });

        it('should be able to add model on specific position', function () {
            var modelData = {id: 4, a: 'a-4'};
            collection.add(modelData, {at: 1});
            expect(collection.length).to.be.equal(4);
            expect(collection.at(1).toJSON()).to.be.deep.equal(modelData);
        });

        it('should be able to add multiple models', function () {
            var count = 0;

            collection.on('add', function () {
                count++;
            });

            collection.add([{id: 4, a: 'a-4'}, {id: 5, a: 'a-5'}]);
            expect(collection.length).to.be.equal(5);
            expect(count).to.be.equal(2);
        });

        it('should be able to add multiple models on specific position', function () {
            var count = 0;

            collection.on('add', function (model, options) {
                if (count === 0) {
                    expect(model.toJSON()).to.be.deep.equal({id: 4, a: 'a-4'});
                    expect(options).to.be.deep.equal({at: 1});
                } else {
                    expect(model.toJSON()).to.be.deep.equal({id: 5, a: 'a-5'});
                    expect(options).to.be.deep.equal({at: 2});
                }
                count++;
            });

            collection.add([{id: 4, a: 'a-4'}, {id: 5, a: 'a-5'}], {at: 1});
            expect(collection.length).to.be.equal(5);
            expect(collection.toJSON()).to.be.deep.equal([
                {id: 1, a: 'a-1'},
                {id: 4, a: 'a-4'},
                {id: 5, a: 'a-5'},
                {id: 2, a: 'a-2'},
                {id: 3, a: 'a-3'}
            ]);
        });

    });

    describe('remove', function () {

        it('should trigger remove event', function () {
            var count = 0;
            collection.on('remove', function (model, options) {
                count++;
                expect(model).to.be.instanceOf(TestModel);
                expect(options).to.be.deep.equal({at: 1});
            });
            collection.remove(collection.at(1));
            expect(count).to.be.equal(1);
            expect(collection.length).to.be.equal(2);
        });

        it('should be able to remove multiple models', function () {
            var count = 0;
            collection.on('remove', function (model, options) {
                if (count === 0) {
                    expect(model.toJSON()).to.be.deep.equal({id: 1, a: 'a-1'});
                } else {
                    expect(model.toJSON()).to.be.deep.equal({id: 2, a: 'a-2'});
                }
                expect(options).to.be.deep.equal({at: 0});
               count++;
            });

            collection.remove([collection.at(0), collection.at(1)]);
            expect(collection.length).to.be.equal(1);
            expect(collection.toJSON()).to.be.deep.equal([{id:3, a: 'a-3'}]);
            expect(count).to.be.equal(2);
        });

        it('should remove from collection destroyed models', function (done) {
            var count = 0;
            collection.on('remove', function () {
                count++;
            });

            collection.at(0).remove().then(function () {
                expect(collection.toJSON()).to.be.deep.equal([{id:2, a: 'a-2'}, {id: 3, a: 'a-3'}]);
                expect(count).to.be.equal(1);
                done();
            });
        });

    });

    describe('set', function () {
        it('should set new models', function () {
            var addsCount = 0,
                removeCount = 0;

            collection.on('add', function () {
                addsCount++;
            });

            collection.on('remove', function () {
                removeCount++;
            });

            collection.set([{id: 4, a: 'a-4'}, {id: 5, a: 'a-5'}]);
            expect(collection.toJSON()).to.be.deep.equal([{id: 4, a: 'a-4'}, {id: 5, a: 'a-5'}]);
            expect(addsCount).to.be.equal(2);
            expect(removeCount).to.be.equal(3);
        });
    });

    describe('commit', function () {
        it('should commit models', function () {
            expect(collection.isChanged()).to.be.false;
            collection.at(0).set('a', 'a-1!');
            expect(collection.isChanged()).to.be.true;
            collection.commit();
            expect(collection.isChanged()).to.be.false;
            expect(collection.at(0).isChanged()).to.be.false;
        });

        it('should track new models', function () {
            collection.add({id: 4}, {a: 'a-4'});
            expect(collection.isChanged()).to.be.true;
            collection.commit();
            expect(collection.isChanged()).to.be.false;
        });

        it('should track removed models', function () {
            collection.remove(collection.at(0));
            expect(collection.isChanged()).to.be.true;
            collection.commit();
            expect(collection.isChanged()).to.be.false;
        });
    });

    describe('revert', function () {
        it('should revert models', function () {
            collection.at(0).set('a', 'a-1!!');
            collection.revert();
            expect(collection.toJSON()).to.be.deep.equal(collectionData);
        });

        it('should remove added models', function () {
            collection.add({id: 4}, {a: 'a-4'});
            collection.revert();
            expect(collection.toJSON()).to.be.deep.equal(collectionData);
        });

        it('should add removed models', function () {
            collection.remove(collection.at(0));
            collection.revert();
            expect(collection.toJSON()).to.be.deep.equal(collectionData);
        });
    });

    describe('model events', function () {
        it('should trigger change event', function (done) {
            collection.on('change', function (model) {
                expect(model).to.be.instanceOf(TestModel);
                expect(model.get('a')).to.be.equal('aa');
                done();
            });
            collection.at(0).set('a', 'aa');
        });

        it('should trigger change:attribute event', function (done) {
            collection.on('change:a', function (model) {
                expect(model).to.be.instanceOf(TestModel);
                expect(model.get('a')).to.be.equal('aa');
                done();
            });
            collection.at(0).set('a', 'aa');
        });

    });

});
