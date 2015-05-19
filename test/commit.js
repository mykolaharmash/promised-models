
var expect = require('chai').expect;

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
                    if (count === 1) {
                        model.revert();
                    } else if (count === 2) {
                        done();
                    }
                });
                model.set('a', 'a2');
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
