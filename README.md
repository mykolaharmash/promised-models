Promised Models [![Build Status](https://travis-ci.org/bem-node/promised-models.svg?branch=master)](https://travis-ci.org/bem-node/promised-models)
===
## Key features

 * promise based
 * typed attributes
 * nested models and collections
 * async calculations and validation

## Install

    $npm install --save promised-models

## Usage

```js
var Model = require('promises-models'),
    FashionModel = new Model.inherit({
        attributes: {
            name: Model.attributeTypes.String
        }
    }),
    model = new FashionModel({
        name: 'Kate'
    });

model.get('name'); // 'Kate'
```


## Api reference (in progress)

### Model sync methods

#### inherit `Model.inherit(properties, [classPorperties])`

Creates you own model class by extending `Model`. You can define attributes, instance/class method and properties. Inheritance is built over [inherit](https://www.npmjs.com/package/inherit).

```js
var CountedModels = Model.inherit({
    __constructor: function () {
        this.__base.apply(this, arguments); //super
        this.attributes.index.set(this.__self._count); //static properties
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

#### attributeTypes `Model.attributeTypes`

Namespace for predefined types of attributes. Supported types:

* `Id` - for entity id
* `String`
* `Number`
* `Boolean`
* `List` — for storing arrays
* `Model` — for nested models
* `ModelsList` — for nested collections
* `Collection` - another implementation of collections 
* `Object` — serializable objects

You can extend default attribute types or create your own

```js
var DateAttribute = Model.attributeTypes.Number.inherit({
    //..
}),
FashionModel = Model.inherit({
    attributes: {
        name: Model.attributeTypes.String,
        birthDate: DateAttribute
    }
});
```

**Note:** `models.attributes` will be replaced in constructor with attribute instances.

```js
var model = new FashionModel();
model.attributes.birthDate instanceof DateAttribute; //true
```

#### set `model.set(attributeName, value)`

Set current value of attribute.

```js
var model = new FashionModel();
model.set('name', 'Kate');
model.attributes.name.set('Kate');
model.set({
    name: 'Kate',
    birthDate: new Date(1974, 1, 16)
});
```

**Note:** setting `null` is equivalent to call `.unset()`

#### get `model.get(attributeName)`

Get current value of attribute.

```js
var model = new FashionModel({
    name: 'Kate',
    birthDate: new Date(1974, 1, 16)
})
model.get('name'); //Kate
model.attributes.name.get(); //Kate
model.get('some'); //throws error as unknown attribute
```

#### toJSON `model.toJSON()`

Return shallow copy of model data.

**Note:** You can create internal attributes, which wouldn't be included to returned object.

```js
var FashionModel = Model.inherit({
    attributes: {
        name: Model.attributeTypes.String.inherit({
            internal: true;
        }),
        sename: Model.attributeTypes.String.inherit({
            internal: true;
        }),
        fullName: Model.attributeTypes.String
    }
}),
model = new FashionModel({
    id: 1,
    name: 'Kate',
    surname: 'Moss',
    fullName: 'Kate Moss'
});
model.toJSON(); // {id: 1, fullName: 'Kate Moss'}
model.get('name'); // Kate
```

**Note:** Returned object supposed to be serializable via `JSON.parse()`. Due to this reason `NaN` and `Infinity` are serialized in this way:

```
NaN -> null
Infinity -> 'Infinity'
```

#### getId `model.getId()`

Returns entity id. You can declare special id attribute, which will be interpreted as entity id. If id attribute didn't declared, by default model will add declaration with name `id`

```js
var FashionModel = Model.inherit({
    attributes: {
        myId: Model.attributeTypes.Id,
        name: Model.attributeTypes.String    
    }
});

var model = new FashionModel({
    myId: 1,
    name: 'Kate'
}); 
model.getId() // 1

FashionModel = Model.inherit({
    attributes: {
        id: Model.attributeTypes.Id.inherit({
            dataType: String
        }),
        name: Model.attributeTypes.String    
    }
});

model = new FashionModel({
    id: 1,
    name: 'Kate'
}); 
model.getId() // '1'


FashionModel = Model.inherit({
    attributes: {
        name: Model.attributeTypes.String    
    }
});

var model = new FashionModel({
    id: 1,
    name: 'Kate'
}); 
model.getId() // 1

 ```

#### isChanged `model.isChanged([branch])`

Has model changed since init or last commit/save/fetch.

```js
var FashionModel = Model.inherit({
        attributes: {
            name: Model.attributeTypes.String,
            weight: Model.attributeTypes.Number.inherit({
                default: 50
            })
        }
    }),
    model = new FashionModel({
        name: 'Kate',
        weight: 55
    });
model.isChanged(); //false
model.set('weight', 56);
model.isChanged(); //true
```

#### commit `model.commit([branch])`

Cache current model state

```js
var model = new FashionModel();
model.set({
    name: 'Kate',
    weight: 55
});
model.isChanged();//true
model.commit();
model.isChanged();//false
```

#### revert `model.revert([branch])`

Revert model state to last cashed one

```js
var model = new FashionModel({
    name: 'Kate',
    weight: 55
});
model.set('weight', 56);
model.revert();
model.get('weight'); //55
model.isChanged(); //false
```

**Note:** You can create your own cache by passing branch param.

```js
var RENDERED = 'RENDERED';
model.on('change', function () {
    if (model.isChanged(RENDERED)) {
        View.render();
        model.commit(RENDERED);
    }
});
```

#### getLastCommitted `model.getLastCommitted([branch])`

Returns model last cached state.

#### previous `model.previous([attr])`

Returns attribute `attr` previous value or model previous state if called without arguments.  

#### on `model.on([attributes], events, cb, [ctx])`

Add event handler for one or multiple model events.

List of events:

* `change` – some of attributes have been changed
* `change:attributeName` – `attributeName` have been changed
* `commit` - some of attributes have been committed to default branch
* `branch:commit` - some of attributes have been committed to branch `branch`
* `commit:attributeName` - `attributeName` have been committed to default branch
* `branch:commit:attributeName` - `attributeName` have been committed to branch `branch`
* `destruct` – model was destructed
* `calculate` – async calculations started

```js
model.on('change', this.changeHandler, this)
     .on('change:weight change:name', this.changeHandler, this);
```

#### un `model.un([attributes], events, cb, [ctx])`

Unsubscribe event handler from events.

```js
//subscribe
model.on('weight name', 'change', this.changeHandler, this);

//unsubscribe
model.un('change:weight change:name', this.changeHandler, this);
```

#### destruct `model.destruct()`

Remove all events handlers from model and removes model from collections

#### isSet `model.isSet(attributeName)`

Returns `true` if attribute was set via constructor or set

```js
var model = new FashionModel();
model.isSet('name'); //false
model.set('name', 'Kate');
model.isSet('name'); //true
```

#### unset `model.unset(attributeName)`

Set attribute to default value and `model.isSet() === 'false'`

```js
var model = new FashionModel();
model.set('name', 'Kate');
model.unset('name');
model.isSet('name'); //false
model.get('name'); //empty string (default value)
```

### Model async methods

#### validate `model.validate()`

Validate model attributes.

```js
var FashionModel = Model.inherit({
        attributes: {
            name: Model.attributeTypes.String.inherit({
                validate: function () {
                    return $.get('/validateName', {
                        name: this.get()
                    }).then(function () {
                        return true; //valid
                    }, function () {
                        return false; //invalid
                    });
                }
            })
        }
    }),
    model = new FashionModel();

model.validate().fail(function (err) {
    if (err instanceof Model.ValidationError) {
        console.log('Invalid attributes:' + err.attributes.join());
    } else {
        return err;
    }
}).done();
```

#### ready `model.ready()`

Fulfils when all calculations over model finished.

```js
var FashionModel = Model.inherit({
        attributes: {
            name: Model.attributeTypes.String,
            ratingIndex: Model.attributeTypes.Number.inherit({
                calculate: function () {
                    return $.get('/rating', {
                        annualFee: this.model.get('annualFee')
                    });
                }
            }),
            annualFee: Model.attributeTypes.Number
        }
    }),
    model = new FashionModel();

model.set('annualFee', 1000000);
model.ready().then(function () {
    model.get('ratingIndex');
}).done();

```

#### fetch `model.fetch()`

Fetch data associated with model from storage.

```js
var FashionModel = Model.inherit({
        attributes: {
            name: Model.attributeTypes.String
        },
        storage: Model.Storage.inherit({
            find: function (model) {
                return $.get('/models', {
                    id: model.getId()
                });
            }
        })
    }),
    model = new FashionModel({id: id});

model.fetch().then(function () {
    model.get('name');
}).done();
```

#### save `model.save()`

```js
var FashionModel = Model.inherit({
        attributes: {
            name: Model.attributeTypes.String,
            weight: Model.attributeTypes.Number
        },
        storage: Model.Storage.inherit({
            insert: function (model) {
                return $.post('/models', model.toJSON()).then(function (result) {
                    return result.id;
                });
            },
            update: function (model) {
                return $.put('/models', model.toJSON());
            }
        })
    }),
    model = new FashionModel();

model.set({
    name: 'Kate',
    weight: 55
});
model.save().then(function () { //create
    model.getId(); //storage id
    model.set('weight', 56);
    return model.save(); //update
}).done()
```

#### remove `model.remove()`

Removes model from storage.

### Model additional methods and properties

* `model.isNew()`
* `model.isReady()`
* `model.trigger(event)`
* `model.calculate()`
* `model.CHANGE_BRANCH`
* `model.CALCULATIONS_BRANCH`

These methods provided for advanced model extending. Consult source for details.

### Model static methods and properties

#### Storage `Model.Storage`

Abstract class for model storage

```js
var FashionModel = Model.inherit({
    attributes: {
        //..
    },
    storage: Model.Storage.inherit({
        //..
    })
});
```

#### Class storage `Model.storage`

Storage class

```js
var SuperModel = FashionModel.inherit({
    storage: FashionModel.storage.inherit({ //extend storage from FashionModel
        //..
    })
});
```

#### Attribute `Model.Attribute`

Base class for model attribute

```js
var CustomAttribute = Model.attribute.inherit({
    //..
})
```

#### Class attributes `Model.attributes`

Model class attributes

```js
var SuperModel = FashionModel.inherit({
    attributes: {
        name: FashionModel.attributes.name,
        weight: FashionModel.attributes.weight.inherit({
            default: 50
        })
    }
});
```

#### `Model.on([attributes], events, cb, [ctx])`

Bind event on all models of class

```js
FashionModel.on('change', this.changeHandler, this);
```


#### `Model.un([attributes], events, cb, [ctx])`

Unbind event on all models of class

### List

Array like object returned for fields types `List` and `ModelsList`

```
var Podium = Model.inherit({
    attributes: {
        models: Model.attributeTypes.ModelsList(FashionModel)
    }
}),

podium = new Podium(data),
list = podium.get('models'), //instanceof List
model = list.get(0); //instanceof Model
```

#### Mutating methods

List inerits Array mutating methods: `pop`, `push`, `reverse`, `shift`, `sort`, `splice`, `unshift`

```
podium.get('models').push(new FashionModel());
```

#### `list.get(index)`

Get list item by index

```
podium.get('models').get(0);// instanceof Model
```

#### `list.length()`

Returns length of list

#### `list.toArray()`

Returns shallow copy of Array, wich stores List items

```
podium.get('models').forEach(function (model) {
    model; // instanceof Model
});
```

#### ValidationError `Model.ValidationError`

Error class for validation fail report

### Collection

#### inherit `Collection.inherit(properties, [classPorperties])`

Creates you own collection class by extending Collection. You should define `modelType` property - constructor which will be used for new models.

```js
var MyCollection = Collection.inherit({
    modelType: MyModel
});
```

#### length `collection.length`

Number of models in collection.

#### at `collection.at(index)`

Returns model by index.

#### get `collection.get(id)`

Returns model by id.

#### where `collection.where(conditions)`

Returns models that match the conditions.

```js
var collection = new MyCollection([{
    name: 'John',
    age: 40
}, {
    name: 'Bob',
    age: 40
},{
    name: 'Jane'
    age: 42
}]);

collection.where({age: 40}) // -> [Model.<{name: 'John', age: 40}>, Model.<{name: 'Bob', age: 40}>]
```

#### findWhere `collection.findWhere(conditions)`

Same as `where` but returns first match.

#### pluck `collection.pluck(attr)`

Picks one attribute from each model in collection and return array of these attributes.

```js
var collection = new MyCollection([{
    name: 'John',
    age: 40
}, {
    name: 'Bob',
    age: 40
},{
    name: 'Jane'
    age: 42
}]);

collection.pluck('name') // -> ['John', 'Bob', 'Jane']
```

#### add `collection.add(models, [options])`

Adds new model(s) to collection. `models` can be an object or instance of `Model` or array of objects or models. Triggers `add` event.

##### `options` 
* `options.at` - position where model(s) should be inserted. By default model adds to end of colleciton
 
#### remove `collection.remove(models)`

Removes models from collection. `models` can be an instance of `Model` or array of models. Triggers `remove` event.
  
**Note:** When model removes via `model.remove()` it will be removed from collection

#### set `collection.set(models)`

Removes all models in collection and adds new `models`

#### Other methods

Collection implements some array methods: `forEach`, `some`, `every`, `filter`, `map`, `reduce`, `find`.
Also collection proxies methods to models: `isChanged`, `commit`, `revert`, `toJSON`.

#### Model events
All model events such as `change`, `change:attribute`, `calculate`, `commit`, `commit:attribute` also wil be triggered on collection

## run tests

    $ npm test
