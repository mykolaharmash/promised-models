var expect = require('chai').expect,
    Model = require('../lib/model');

describe('Inherit', function () {
    var ModelClass1, ModelClass2;
    before(function () {
        ModelClass1 = Model.inherit({
            attributes: {
                a: Model.attributeTypes.String.inherit({
                    default: 'a'
                }),
                b: Model.attributeTypes.String.inherit({
                    default: 'b'
                })
            },
            storage: Model.Storage.inherit({
                find: function () {
                    return {
                        a: 'a-1',
                        b: 'b-1'
                    };
                }
            })
        });
        ModelClass2 = ModelClass1.inherit({
            attributes: {
                b: ModelClass1.attributes.b,
                c: Model.attributeTypes.String.inherit({
                    default: 'c'
                })
            },
            storage: ModelClass1.storage.inherit({
                find: function () {
                    var data = this.__base();
                    data.c = 'c-1';
                    return data;
                }
            })
        });
    });
    it('should expouse attributes in static method', function () {
        expect(ModelClass1.attributes.a.prototype).to.be.instanceof(Model.Attribute);
    });
    it('should expouse storage in static method', function () {
        expect(ModelClass1.storage.prototype).to.be.instanceof(Model.Storage);
    });
    it('should enable inheritance of attributes', function () {
        var model2 = new ModelClass2();
        expect(model2.get('b')).to.be.equal('b');
    });
    it('should enable inheritance of storage', function () {
        var model2 = new ModelClass2();
        return model2.fetch().then(function () {
            expect(model2.toJSON()).to.be.deep.equal({
                b: 'b-1',
                c: 'c-1'
            });
        });
    });

});
