# Promised Models (in progress)

## Key features

 * field declaration
 * nested models and collections
 * async calculations and validation
 * promise based

## Install

    $npm install --save promises-models

## Usage

    var Model = require('promises-models'),
        FashionModel = new Model.inherit({
            fields: {
                name: Model.fields.String
            }
        }),
        model = new FashionModel({
            name: 'Kate'
        });
    console.log(model.get('name')); // 'Kate'


## Api reference (in progress)

### Model

####inherit `Model.inherit(properties, [classPorperties])`

Creates you own model class by extending `Model`. You can define fields, instance/class method and properties. Inheritance is build over [inherit](https://www.npmjs.com/package/inherit).

```
var CountedModels = Model.inherit({
    __constructor: function () {
        this.__base.apply(this, arguments); //super
        this.fields.index.set(this.__self._count); //static properties
        this.__self._count ++;
    },
    getIndex: function () {
        return this.get('index');
    }
}, {
    _count: 0,
    getCount: function () {
        return this._count;
    }
});
```

####fields `Model.fields`

Namespace for predefined types of fields. Supported types:

* `String`
* `Number`
* `Boolean`
* `List` — for storing arrays
* `Model` — for nested models
* `ModelList` — for nested collections

You can extend default field types or create your own

```
var DateField = Model.fields.Number.inherit({
    //..
}),
FashionModel = Model.inherit({
    fields: {
        name: Model.fields.String,
        birthDate: DateField
    }
});
```

**Note:** `models.fields` will be replaced in constructor with field instances.

```
var model = new FashionModel();
model.fields.birthDate instanceof DateField; //true
```

####get `model.get(fieldName)` `model.fields[fieldName].get()`

Get current value of field.

####set `model.set(fieldName, value)` `model.fields[fieldName].set(value)`

Set current value of field.

```
var model = new FashionModel({
    name: 'Kate',
    birthDate: new Date(1974, 1, 16)
})
model.get('name'); //Kate
model.fields.name.get(); //Kate
model.get('some'); //throws error as uknown field
```



## run tests

    $ npm test
