
# PolicyLine
Node.JS attribute based access control library

Original Russian documentation [here](./docs/README.ru.md)

## What is it

The library that implements ABAC (Attribute Based Access Control) for servers on Node.JS.

[![Attribute Based Access Control](./docs/imgs/video.png)](https://www.youtube.com/watch?v=cgTa7YnGfHA "Attribute Based Access Control")

More details here:

* [Approaches to access control: RBAC vs. ABAC](https://habrahabr.ru/company/custis/blog/248649/)
* [Familiarity with the XACM standard for Attribute-Based Access Control](https://habrahabr.ru/company/custis/blog/258861/)
* [Attribute-based access control(Wiki)](https://en.wikipedia.org/wiki/Attribute-based_access_control)
* [Guide to Attribute Based Access Control (ABAC)](http://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.sp.800-162.pdf)

## Purpose

A tool is needed to change the business rules regarding access, without rewriting the server code.


### Differences from other libraries:

1. Rules are based on attributes, not roles, which saves you from having to introduce permissions (permissions).
2. Allows you to dynamically change access rules based on attributes without changing the application code (without rewriting), since all business rules are specified in the JSON format.
3. Unlike other libraries, business rules include not only access rules, but also the ability to dynamically filter.

This **allows you to configure the business logic of the application without changing the code of the application itself**.

> For example, a business rule: **"The senior manager from the purchasing department can confirm purchase orders only if he is not the creator of the order, the order is in his branch, the order value is more than 100,000, and does not exceed the daily limit."**
>
> In this case, the rules become:
>
> ```JSON
> {
>  "target": [
>    "action.name='approve'",
>    "user.position='senior_manager'",
>    "user.department='purchasing_department'",
>    "user.approveLimit>user.approveTotal+action.transactionSum",
>    "action.transactionSum<100000"
>  ],
>  "condition": [
>    "resource.creator!=user.name",
>    "resource.branch=user.branch",
>    "resource.type='purchase_order'"
>  ],
>  "effect": "permit",
>  "algorithm": "all"
> }
> ```
> You can load or compile these rules into a function and use in the middleware to restrict access. A block `condition` is an array of conditions that are dynamically compiled (an object is created) into a JSONB structure from input data that can be used for further filtering in [Mongoose](http://mongoosejs.com/docs/queries.html), [Sequelize](http://docs.sequelizejs.com/manual/tutorial/querying.html#jsonb) writing custom logic.

## API
The library operates with four entities:

* `user`- user object, provides information on each unique user. Typically, it is `express` embedded in the query as a field.
* `action`- information directly about the action being taken. Can be implemented in the construction of middleware as meta information.
* `env` - information about the environment, which usually contains time and other necessary information.
* `resource`- an object with which to perform actions. Since it is usually necessary to work with the resource separately, it is desirable to bring all the interaction to a block `condition`, which will allow receiving dynamically created objects (JSONB) with conditions that can be used to further work with resources in [Mongoose](http://mongoosejs.com/docs/queries.html), [Sequelize](http://docs.sequelizejs.com/manual/tutorial/querying.html#jsonb)  or for writing custom logic.


### Policy

The object by which access is checked, and conditions are calculated.



#### new Policy(`rules`)

Creates a new policy from the rules. During policy creation, rules are compiled into pure functions.

```js
let policy = new Policy (rules);
```

Rules can be written in two formats:

### In the format of "Single Policy":
```js
let rules = {
    target: [
        "user.location = 'NY'"
    ],
    effect: "permit",
    algorithm: "all",
    condition: [
    	"resource.location = user.location"
    ]
};};

let policy = new Policy (rules);
```
Where fields:

`target`- A set of logical conditions for calculating the policy, each condition returns `true`, `false` or an error if an exception occurs. It may comprise any logical condition (`=`, `!=`, `<`, `>`, `>=`, `<=`). Expressions `==` and `=` unambiguous. On both sides of the expression can be present the simplest logical or algebraic expressions, as well as calls of synchronous functions embedded with the help of DI(Dependency Injection) function.

> Examples of valid conditions:
>
>  - `user.value>=3000`
>  - `user.value<=(3000-2000)*env.value`
>  - `$timeBetween($moment(env.time, 'HH:mm a').format('HH:mm a'),'9:00','18:00')=true`
>
> Since the last condition is difficult enough to understand, try to avoid such situations. It's easier to write a new function, for example `$time(env.time).between('9:00','18:00')=true` (this example is just a demonstration of features, and not contained in helper functions (presets))

* `algorithm`- The algorithm by which the policy is calculated by the rules, can take the value of ***all*** or ***any*** , in case ***all*** all the rules should return `true`, in the case of ***any*** - at least one of the rules should return `true`. The default is ***all***.
* `effect` - the effect that is imposed on the results of the calculation of the policy. It can take a permit or deny value . The default is ***deny*** . If after the calculation of the rules and the application of the algorithm is obtained true, then the effect is imposed, and the policy returns `true` if it is allowed or `false` if it is forbidden, or an error occurred during the calculation of the policy or an unknown value was used.

> Note that if an error occurs during the calculation of the policy , **the policy will always return `false`, that is, deny access to the resource***!
>

* `condition` - A set of conditions for accessing the resource. When a method is called `condition`, it returns a dynamically compiled condition object. The recording format differs from the recording format `target`. The left part of the expression is only allowed by the characters in the set `[\w\.\'\"\$]+`, that is, the names of the objects, their attributes and quotes. It is recommended to formulate the conditions as follows: `resource.attribute[.attribute]|condition|expression`, in more detail in the description of the method `condition `

##### In the format "Policy Group":

```js
// all algorithms set in 'all' by default
// 'condition' is empty
let policyGroup = {
    expression: '(user AND location) OR (admin OR super_admin)',
    policies: {
        user: {
            target: [
                "user.role='user'"
            ],
            effect: "permit"
        },
        location: {
            target: [
                "user.location=env.location"
            ],
            effect: "permit"
        },
        admin: {
            target: [
                "user.role='admin'"
            ],
            effect: "permit"
        },
        super_admin: {
            target: [
                "user.role='admin'"
            ],
            effect: "permit"
        }
    }
};

let policy = new Policy(rules);
```

Where fields:

* `expression` - the logical expression by which the policy is composed, where the names of policies are the name of the attributes in the object `policies`.
* `policies` - List of policies in the group.

> Note that `condition` in the case of a group of `policies`, they must be written separately, at the same level as `expression` and `policies`, and not in each policy separately. This is done so that the group of policies will still apply to the same resource, so the conditions should be the same.


#### check(`user`, `action`, `env`, `resource`)

The method for calculating the policy returns, `true` `false` based on the calculation of the rules with the parameters transferred, and the application to the calculation result `algorithm` and `effect`.

```js
let rules = {
    target: [
        "user.value>=3000"
    ],
    effect: "permit",
    algorithm: "all"
};
let policy = new Policy(rules);

let user = {value: 4000};
policy.check(user) // <= true
```

#### and(`policy`)

Combines the current policy with the transferred one, using a Boolean operation, `AND` and returns a new one as a result.

```js
let totalPolicy = policyA.and(policyB).and(policyC);
```

#### or(`policy`)
Combines the current policy with the transferred one, using a Boolean operation, `OR` and returns a new one as a result.

```js
let totalPolicy = adminPolicy.or(userPolicy.and(locationPolicy));
```


#### condition (`user`,` action`, `env`,` resource`)

The method allows you to compile conditions using the `user`,` action`, `env`,` resource` parameters of the current (passed directly to the method) and previous ones, which were used in the `check` method, ie at the moment of access to the current resource .
The method returns a dynamically generated object with the calculated attribute values ​​based on the parameters listed earlier.

That is, the following conditions:

```js
let rules = {
...
    condition: [
        "resource.name = 'post'",
        "resource.location = user.location",
        "resource.limit >= (user.total + user.operation)",
    ]
};};
```
while the following parameters were used during the check (`check` *and* | *or*` condition `):

```js
let user = {location: 'NY', operation: 10, total: 120};
```
The following object with computable fields is returned, which can be used in the query, or for writing additional logic.

```js
let condition = {
    name: 'post',
    location: 'NY',
    limit: ['>=', 130]
};};
```
That is, the method returns an object containing the fields `user`,` action`, `env`,` resource` and `condition`. And `resource` upon return will be integrated with` condition`, in order to get valid conditions for querying the database.

> Pay attention to the condition `resource.limit >= (user.total + user.operation)`. It returns an array where the first element is the condition and the second computed is the value. Such cases you must describe and process yourself. Some databases allow you to use operation aliases, for example as [Sequelize](http://docs.sequelizejs.com/manual/tutorial/querying.html#jsonb), or JSONB format as [Mongoose](http://mongoosejs.com/docs/queries.html). An example of such conditions and the generated object will be given below:

Example of conditions with the query conditions:

```js
let policy = { 
    ...
    condition: [
        "resource.occupation=/host/",
        "resource.age.$gt=17",
        "resource.age.$lt=66",
        "'name.last'='Ghost'",
        "resource.likes.$in=['vaporizing', 'talking']",
    ]
};
```

```js
// mongoose JSONB object from 'http://mongoosejs.com/docs/queries.html'
let result = {
    occupation: /host/,
    'name.last': 'Ghost',
    age: {$gt: 17, $lt: 66},
    likes: {$in: ['vaporizing', 'talking']}
};
```
> **Please note that no one has canceled the need for security, so you must correctly validate the input from the client, taking into account the aliases of the database commands.**

In PolicyGroup objects, the expression is analyzed, and the conditions are combined only for those policies that led to a positive result.

If the `check` method returns *false*, then the conditions are not calculated.

### DI

In expressions (`target` and` condition`) you can use your own functions, which are implemented using the "Dependency Injection" mechanism.

#### register (fnName, fn), register (fn)

Registers a function by name or not anonymous, which can later be used in expressions.
```js
DI.register('$test', function (value) {
    return 'test_' + value;
});

let rules = {
    target: [
        "user.name=$test('Joe')"
    ]
};
```
#### unregister (fnName, fn), unregister (fn)

Deletes a registered non-anonymous function or by its name.
```js
 DI.unregister('$test');
```

#### clear ()

Removes all registered functions including presets for processing strings and times.

```js
 DI.clear();
```

#### loadPresets ()

Loads all auxiliary functions included in the library. At the moment, work with lines and time is available, in the future it is planned to implement the work with * geohash * and the extension of existing ones.

```js
 DI.loadPresets();
```


### Settings

The object with the settings, at the moment, allows you to cancel the output to the console of the error when the policy conditions are met.
> As mentioned above, when an error or exception occurs, during policy calculation, the policy always returns you a deny of access. But when debugging, it is usually important to see the exceptions that occurred when calculating rules.

```js
let ABAC = require('policyline');

// disable errors notifications in console
ABAC.settings.log = false;
```
## Example

For a example, we implemented a demo [project](https://github.com/YLuchaninov/PolicyLine-demo).

There is a blog platform with 3 independent firms:

* Firm A is an open company. All the users of the company can publish posts in the blog, all the users of the company can edit them. Unregistered users can view posts of this company.
* Firm B is a closed company. Posts can be published and viewed only by the users of the company, edited only by the author of the post, and deleted only by the administrator of the company or by the super-administrator. That is, it's a completely closed company.
* Firm C — directly opposite to the first two — is akin to "civic initiative" or "remote journalism". Any user of the company can add a post, but it can be viewed or deleted only by the administrator of the company or by the super-administrator.

This example is quite similar to a sandbox. You can add new companies with certain rules, which depend not only on roles or on the user. As an example, there's a rule that is responsible for accessing company resources during working hours only. You can add it (usually as a modifier) to any resource or company. Also included are the "age" and "location" fields for the user, and the structure of the post includes "tags," "location," and "category." Therefore, you can try to write rules that restrict certain posts by the age of the user or by the category, or you can share posts only with users within a radius of 100 miles, etc. It's all up to you.

## Security

Despite the fact that the library uses javascript code generation, it is quite safe, provided the following conditions are met:

1. Restrict access to business rules has no outside people to exclude the mechanism of injection.
2. The incoming data from the client must be validated taking into account all aliases of the database commands.
