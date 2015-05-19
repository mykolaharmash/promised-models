
var expect = require('chai').expect;

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
