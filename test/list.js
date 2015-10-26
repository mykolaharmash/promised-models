var expect = require('chai').expect;

describe('List attribute', function () {
    var Model = require('./models/with-list');
    it('should set array', function () {
        var arr = [1, 2, 3],
            model = new Model({
                list: arr
            });
        expect(model.get('list').toArray()).to.not.equal(arr);
        expect(model.get('list').toArray()).to.deep.equal(arr);
    });
    it('isChanged should be true after set same arr', function () {
        var arr = [1, 2, 3],
            model = new Model({
                list: arr
            });
        expect(model.isChanged()).to.be.equal(false);
        model.set('list', arr);
        expect(model.isChanged()).to.be.equal(true);
    });
    it('isChanged should be false after commit', function () {
        var arr = [1, 2, 3],
            model = new Model({
                list: arr
            });
        model.set('list', arr);
        expect(model.isChanged()).to.be.equal(true);
        model.commit();
        expect(model.isChanged()).to.be.equal(false);
    });
    it('push should trigger change', function (done) {
        var arr = [1, 2, 3],
            model = new Model({
                list: arr
            });
        model.on('change', function () {
            done();
        });
        model.get('list').push(4, 5);
    });
    it('revert should work', function () {
        var arr = [1, 2, 3],
            model = new Model({
                list: arr
            });
        model.get('list').push(4, 5);
        expect(model.get('list').toArray()).to.not.deep.equal(arr);
        model.revert();
        expect(model.get('list').toArray()).to.deep.equal(arr);
    });
    it('toJSON should return array', function () {
        var arr = [1, 2, 3],
            model = new Model({
                list: arr
            });
        expect(model.toJSON()).to.deep.equal({
            list: arr
        });
    });
    it('setting same list should not cause change', function (done) {
        var arr = [1, 2, 3],
            model1 = new Model({
                list: arr
            }),
            model2 = new Model({
                list: arr
            });
        model1.on('change', function () {
            done();
        });
        model1.set('list',  model1.get('list'));
        model1.ready().then(function () {
            model1.set('list',  model2.get('list'));
        }).done();
    });
});
