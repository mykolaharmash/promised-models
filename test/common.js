var expect = require('chai').expect;

describe('Models create', function () {
    describe('with init data', function () {
        var ModelClass = require('./models/simple'),
            model = new ModelClass({
                a: 'a1'
            });
        it('should get init values', function () {
            expect(model.get('a')).to.be.equal('a1');
        });
    });
});

describe('Models.inherit', function () {
    var ModelClass = require('./models/simple'),
    InheritedClass = ModelClass.inherit({
        propB: 'propB'
    });

    describe('ModelClass', function () {
        it('should have inherit', function () {
            expect(ModelClass.inherit).to.be.a('function');
        });
        it('should have fields', function () {
            var model = new ModelClass();
            expect(model).to.have.property('fields');
        });
    });

    describe('InheritedClass', function () {
        var model = new InheritedClass();
        it('should have fields', function () {
            expect(model).to.have.property('fields');
        });
        it('should have propA', function () {
            expect(model).to.have.property('propA');
        });
        it('should have propB', function () {
            expect(model).to.have.property('propB');
        });
    });
});

describe('Models.get', function () {
    var ModelClass = require('./models/simple'),
        model = new ModelClass();

    it('should exist', function () {
        expect(model.get).to.be.a('function');
    });
    it('should resturn default value', function () {
        expect(model.get('a')).to.be.equal('a');
    });
    it('should throw on unknown field', function () {
        expect(function () {
            model.get('nonexist');
        }).to.throw(Error);
    });
});

describe('Models.set', function () {
    var ModelClass = require('./models/simple'),
        model = new ModelClass();

    it('should exist', function () {
        expect(model.set).to.be.a('function');
    });
    it('should set value', function () {
        model.set('a', 'a2');
        expect(model.get('a')).to.be.equal('a2');
    });
    it('should set hash', function () {
        model.set({
            a: 'a3',
            b: 'b3',
            c: 'c3'
        });
        expect(model.get('a')).to.be.equal('a3');
        expect(model.get('b')).to.be.equal('b3');
        expect(function () {
            model.get('c');
        }).to.throw(Error);
    });
});

describe('Models.toJSON', function () {
    var ModelClass = require('./models/simple');

    it('should exist', function () {
        var model = new ModelClass();
        expect(model.toJSON).to.be.a('function');
    });

    it('should return data', function () {
        var data = {
            a: 'aData',
            b: 'bData'
        },
        model = new ModelClass(data);
        expect(model.toJSON()).to.have.property('a', 'aData');
        expect(model.toJSON()).to.have.property('b', 'bData');
    });

    it('should support internal', function () {
        var model = new ModelClass();
        expect(model.toJSON()).to.have.not.property('c');
    });
});

