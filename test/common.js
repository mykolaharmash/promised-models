var expect = require('chai').expect,
    Vow = require('vow');

describe('Create', function () {
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

describe('Inherit', function () {
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

describe('Get', function () {
    var ModelClass = require('./models/simple'),
        model = new ModelClass();

    it('should resturn default value', function () {
        expect(model.get('a')).to.be.equal('a');
    });
    it('should throw on unknown field', function () {
        expect(function () {
            model.get('nonexist');
        }).to.throw(Error);
    });
});

describe('Set', function () {
    var ModelClass = require('./models/simple'),
        model = new ModelClass();

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

describe('toJSON', function () {
    var ModelClass = require('./models/simple');

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

describe('Events', function () {
    var ModelClass = require('./models/simple');
    describe('Models.on', function () {
        it('should bind on few events', function (done) {
            var model = new ModelClass(),
                count = 0;
            model.on('change:a change:b', function () {
                count++;
                if (count >= 2) {
                    done();
                }
            });
            model.set('a', 'a1');
            model.set('b', 'b1');
        });
        it('should bind on fields and events', function (done) {
            var model = new ModelClass(),
                count = 0;
            model.on('a b', 'change', function () {
                count++;
                if (count >= 2) {
                    done();
                }
            });
            model.set('a', 'a1');
            model.set('b', 'b1');
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
                model.un('change', cb);
                model.set('a', 'a2');
                done();
            };
            model.on('change', cb);
            model.set('a', 'a1');
        });
    });
    describe('change', function () {
        var model = new ModelClass(),
            count = 0;
        it('should call change event once', function (done) {
            model.on('change', function () {
                count++;
                expect(model.get('a')).to.be.equal('a2');
                done();
            });
            model.set('a', 'a1');
            model.set('a', 'a2');
        });

    });
    describe('change:field', function () {
        var model, count;
        beforeEach(function () {
            model = new ModelClass();
            count = 0;
        });
        it('should call change:field async', function (done) {
            model.on('change:a', function () {
                count++;
                expect(model.get('a')).to.be.equal('a2');
                done();
            });
            model.set('a', 'a1');
            model.set('a', 'a2');
            expect(count).to.be.equal(0);
        });
    });
});

describe('Commit', function () {
    var ModelClass = require('./models/simple');
    describe('default branch', function () {
        describe('Models.isChanged', function () {
            var model;
            beforeEach(function () {
                model = new ModelClass({
                    a: 'a1'
                });
            });
            it('should be false after init', function () {
                expect(model.isChanged()).to.be.equal(false);
            });
            it('should be true after set', function () {
                model.set('b', 'b1');
                expect(model.isChanged()).to.be.equal(true);
            });
        });
        describe('Models.revert', function () {
            var model;
            beforeEach(function () {
                model = new ModelClass({
                    a: 'a1'
                });
            });
            it('should return initial value', function () {
                model.set('a', 'a2');
                expect(model.get('a')).to.be.equal('a2');
                expect(model.isChanged()).to.be.equal(true);
                model.revert();
                expect(model.get('a')).to.be.equal('a1');
                expect(model.isChanged()).to.be.equal(false);
            });
            it('should cause change events', function (done) {
                var count = 0;
                model.on('change', function () {
                    count++;
                });
                model.set('a', 'a2');
                setTimeout(function () {
                    expect(count).to.be.equal(1);
                    model.revert();
                    setTimeout(function () {
                        expect(count).to.be.equal(2);
                        done();
                    });
                });
            });
        });
        describe('Models.commit', function () {
            var model;
            beforeEach(function () {
                model = new ModelClass({
                    a: 'a1'
                });
            });
            it('after commit isChanged should be false', function () {
                model.set('a', 'a2');
                expect(model.isChanged()).to.be.equal(true);
                model.commit();
                expect(model.isChanged()).to.be.equal(false);
                expect(model.get('a')).to.be.equal('a2');
            });
        });
    });

    describe('custom branch', function () {
        describe('Models.isChanged', function () {
            var model;
            beforeEach(function () {
                model = new ModelClass({
                    a: 'a1'
                });
            });
            it('should be true before commit', function () {
                expect(model.isChanged('custom')).to.be.equal(true);
            });
            it('should be false after commit', function () {
                model.commit('custom');
                expect(model.isChanged('custom')).to.be.equal(false);
            });
            it('should be true after set', function () {
                model.set('b', 'b1');
                expect(model.isChanged('custom')).to.be.equal(true);
            });
            it('should have different values for different branches', function () {
                model.set('b', 'b1');
                expect(model.isChanged('custom')).to.be.equal(true);
                model.commit('custom');
                expect(model.isChanged('custom')).to.be.equal(false);
                expect(model.isChanged()).to.be.equal(true);
            });
        });
        describe('Models.revert', function () {
            var model;
            beforeEach(function () {
                model = new ModelClass({
                    a: 'a1'
                });
            });
            it('should return initial value', function () {
                model.commit('custom');
                model.set('a', 'a2');
                expect(model.get('a')).to.be.equal('a2');
                expect(model.isChanged('custom')).to.be.equal(true);
                model.revert('custom');
                expect(model.get('a')).to.be.equal('a1');
                expect(model.isChanged('custom')).to.be.equal(false);
            });
        });
        describe('Models.commit', function () {
            var model;
            beforeEach(function () {
                model = new ModelClass({
                    a: 'a1'
                });
            });
            it('after commit isChanged should be false', function () {
                model.set('a', 'a2');
                expect(model.isChanged('custom')).to.be.equal(true);
                model.commit('custom');
                expect(model.isChanged('custom')).to.be.equal(false);
                expect(model.isChanged()).to.be.equal(true);
                expect(model.get('a')).to.be.equal('a2');
            });
        });
    });
});

describe('Validate', function () {
    var ModelClass = require('./models/simple'),
        model;
    beforeEach(function () {
        model = new ModelClass({
            a: 'a1'
        });
    });
    it('should fulfill for valid model', function () {
        return model.validate();
    });
    it('should reject for invalid fields with async and sync validation', function () {
        model.set('withSyncValidation', 'notValid');
        return model.validate().always(function (p) {
            if (p.isFullfiled) {
                return Vow.reject();
            } else {
                return Vow.fulfill();
            }
        }).then(function () {
            model.revert();
            return model.validate();
        }).then(function () {
            model.set('withAsyncValidation', 'notValid');
        }).always(function (p) {
            if (p.isFullfiled) {
                return Vow.reject();
            } else {
                return Vow.fulfill();
            }
        });
    });
    it('should report invalid fields', function () {
        model.set({
            withAsyncValidation: 'notValid',
            withSyncValidation: 'notValid'
        });
        return model.validate().always(function (p) {
            if (p.isFullfiled) {
                return Vow.reject();
            } else {
                expect(p.valueOf()).to.be.instanceOf(Error);
                expect(p.valueOf()).to.be.instanceOf(ModelClass.ValidationError);
                expect(p.valueOf()).to.have.property('fields');
                expect(p.valueOf()).to.have.deep.property('fields[0].name');
                expect(p.valueOf()).to.have.deep.property('fields[1].name');
            }
        });
    });
});

describe('Calculate', function () {
    var ModelClass = require('./models/with-calculations');
    describe('Calculate', function () {
        it('should calculate value on init', function () {
            var model = new ModelClass();
            return model.ready().then(function () {
                expect(model.get('b')).to.be.equal('b-0');
            });
        });
        it('should calculate depended value on init', function () {
            var model = new ModelClass();
            return model.ready().then(function () {
                expect(model.get('c')).to.be.equal('c-0');
            });
        });
        it('should calculate async depended values on init', function () {
            var model = new ModelClass();
            return model.ready().then(function () {
                expect(model.get('asyncDepended')).to.be.equal('a-0-b-0-c-0-async');
            });
        });
        it('should calculate values after set', function () {
            var model = new ModelClass();
            model.set('a', 'a-1');
            return model.ready().then(function () {
                expect(model.get('asyncDepended')).to.be.equal('a-1-b-1-c-1-async');
            });
        });
        it('should trigger change:field with final calculation result', function (done) {
            var model = new ModelClass();
            model.on('change:asyncDepended', function () {
               expect(model.get('asyncDepended')).to.be.equal('a-0-b-0-c-0-async');
               done();
            });
        });
        it('should trigger change with final calculation result', function (done) {
            var model = new ModelClass();
            model.on('change', function () {
               expect(model.get('a')).to.be.equal('a-0');
               expect(model.get('b')).to.be.equal('b-0');
               expect(model.get('c')).to.be.equal('c-0');
               expect(model.get('async')).to.be.equal('async');
               expect(model.get('asyncDepended')).to.be.equal('a-0-b-0-c-0-async');
               done();
            });
        });
        it('should not fire events after ready', function (done) {
            var model = new ModelClass();
            model.ready().then(function () {
                model.on('change', function () {
                    done();
                });
                done();
            }).done();
        });
        it('should trigger change after ready and then set', function (done) {
            var model = new ModelClass();
            model.ready().then(function () {
                model.set('a', 'a-1');
                model.on('change', function () {
                   expect(model.get('a')).to.be.equal('a-1');
                   expect(model.get('b')).to.be.equal('b-1');
                   expect(model.get('c')).to.be.equal('c-1');
                   expect(model.get('async')).to.be.equal('async');
                   expect(model.get('asyncDepended')).to.be.equal('a-1-b-1-c-1-async');
                   done();
                });
                model.ready().done();
            }).done();
        });

    });
    describe('Amend', function () {
        it('should change other fields when amending field changes', function () {
            var model = new ModelClass();
            return model.ready().then(function () {
                model.set('amendingField', 'newValue');
                expect(model.get('amendingField')).to.be.equal('newValue');
                expect(model.get('amendedField')).to.be.equal('defaultValue');
                return model.ready().then(function () {
                    expect(model.get('amendedField')).to.be.equal('newValue');
                });
            });
        });
        it('should trigger change with final data', function (done) {
            var model = new ModelClass();
            model.ready().then(function () {
                model.on('change', function () {
                    expect(model.get('amendingField')).to.be.equal('newValue');
                    expect(model.get('amendedField')).to.be.equal('newValue');
                    done();
                });
                model.set('amendingField', 'newValue');
            }).done();
        });
    });
});
describe('Parse', function () {
    var ModelClass = require('./models/with-calculations');
    it('should work for set and get', function () {
        var model = new ModelClass();
        model.set('preprocessed', {
            a: 'a',
            b: 'b'
        });
        expect(model.get('preprocessed')).to.be.a('string');
        expect(JSON.parse(model.get('preprocessed'))).to.have.property('b', 'b');
    });
});