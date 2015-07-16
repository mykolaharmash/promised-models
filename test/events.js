
var expect = require('chai').expect;

describe('Events', function () {
    var ModelClass = require('./models/simple');

    describe('Model.un', function () {
        it('should unsubscribe from event', function (done) {
            var model = new ModelClass(),
                cb = function () {
                    model.un('change', cb);
                    model.set('a', 'a2');
                    done();
                };
            model.on('change', cb);
            model.set('a', 'a1');
        });
    });
    describe('Model.un', function () {
        it('should bind on events', function (done) {
            var model = new ModelClass(),
                cb = function () {
                    ModelClass.un('change', cb);
                    done();
                };
            ModelClass.on('change', cb);
            model.set('a', 'a1');
        });
    });
    describe('model.on', function () {
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
        it('should bind on attributes and events', function (done) {
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
        it('should return model instance', function () {
            var model = new ModelClass();
            expect(model.on('change', function () {})).to.be.equal(model);
        });
    });
    describe('model.un', function () {
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
        it('should return model instance', function () {
            var model = new ModelClass();
            expect(model.un('change', function () {})).to.be.equal(model);
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
    describe('change:attribute', function () {
        var model, count;
        beforeEach(function () {
            model = new ModelClass();
            count = 0;
        });
        it('should call change:attribute async', function (done) {
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
