
var expect = require('chai').expect,
    Vow = require('vow'),
    Model = require('../lib/model');

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
        it('should trigger change:attribute with final calculation result', function (done) {
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

        it('should stop after iteration limit', function () {
            var LoopedModel = Model.inherit({
                throwCalculationErrors: false,
                attributes: {
                    a: Model.attributeTypes.String.inherit({
                        default: 'a-0',
                        isChanged: function () {
                            return this.get() !== this.default;
                        },
                    }),
                    b: Model.attributeTypes.String.inherit({
                        calculate: function () {
                            return this.model.get('a') + '-1';
                        }
                    })
                }
            }),
            loopedModel = new LoopedModel();
            return loopedModel.ready().then(function () {
                loopedModel.set('a', 'a-1');
                return loopedModel.ready();
            }).always(function (p) {
                var err = p.valueOf();
                expect(err).instanceof(Error);
                expect(err.message).to.contain('After 100 calculations');
                return Vow.fulfill();
            });
        });

    });
    describe('Amend', function () {
        it('should change other attributes when amending attribute changes', function () {
            var model = new ModelClass();
            return model.ready().then(function () {
                model.set('amendingAttribute', 'newValue');
                expect(model.get('amendingAttribute')).to.be.equal('newValue');
                expect(model.get('amendedAttribute')).to.be.equal('defaultValue');
                return model.ready().then(function () {
                    expect(model.get('amendedAttribute')).to.be.equal('newValue');
                });
            });
        });
        it('should trigger change with final data', function (done) {
            var model = new ModelClass();
            model.ready().then(function () {
                model.on('change', function () {
                    expect(model.get('amendingAttribute')).to.be.equal('newValue');
                    expect(model.get('amendedAttribute')).to.be.equal('newValue');
                    done();
                });
                model.set('amendingAttribute', 'newValue');
            }).done();
        });
    });
});
