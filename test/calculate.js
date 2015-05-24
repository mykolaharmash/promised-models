
var expect = require('chai').expect;

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
