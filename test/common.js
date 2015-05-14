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
            unknown: 'unknown'
        });
        expect(model.get('a')).to.be.equal('a3');
        expect(model.get('b')).to.be.equal('b3');
        expect(function () {
            model.get('unknown');
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

describe('Models events', function () {
    var ModelClass = require('./models/simple');
    describe('Models.on', function () {
        it('should bind on few events', function () {
            var model = new ModelClass(),
                count = 0;
            model.on('change:a change:b', function () {
                count++;
            });
            model.set('a', 'a1');
            model.set('b', 'b1');
            expect(count).to.be.equal(2);
        });
        it('should bind on fields and events', function () {
            var model = new ModelClass(),
                count = 0;
            model.on('a b', 'change', function () {
                count++;
            });
            model.set('a', 'a1');
            model.set('b', 'b1');
            expect(count).to.be.equal(2);
        });
    });
    describe('Models.un', function () {
        var model, count;
        beforeEach(function () {
            model = new ModelClass();
            count = 0;
        });
        it('should unsubscribe from event', function (done) {
            var cb = function () {
                count++;
            };
            model.on('change', cb);
            model.set('a', 'a1');
            setTimeout(function () {
                expect(count).to.be.equal(1);
                model.un('change', cb);
                model.set('a', 'a2');
                setTimeout(function () {
                    expect(count).to.be.equal(1);
                    expect(model.get('a')).to.be.equal('a2');
                    done();
                });
            });
        });
    });
    describe('change', function () {
        var model = new ModelClass(),
            count = 0;
        model.on('change', function () {
            count++;
        });
        it('should call change event once', function (done) {
            model.set('a', 'a1');
            model.set('a', 'a2');
            expect(count).to.be.equal(0);
            setTimeout(function () {
                expect(count).to.be.equal(1);
                expect(model.get('a')).to.be.equal('a2');
                done();
            });
        });

    });
    describe('change:field', function () {
        var model, count;
        beforeEach(function () {
            model = new ModelClass();
            count = 0;
        });
        it('should call change:field for every set', function () {
            model.on('change:a', function () {
                count++;
            });
            model.set('a', 'a1');
            model.set('a', 'a2');
            expect(count).to.be.equal(2);
        });
    });
});

