
var expect = require('chai').expect;

describe('Presistant', function () {
    var Model = require('./models/presistant');
    it('should save and fetch model by id', function () {
        var model1 = new Model();
        model1.set('a', 'a-2');
        return model1.save();
    });
});
