let expect = require('chai').expect;
let PolicyLine = require('../dist/policyline.min');

let Policy = PolicyLine.Policy;
let register = PolicyLine.Operator.register;
let unregister = PolicyLine.Operator.unregister;

describe("Operators Checking", function () {
  it(": string equivalent & different objects", function () {
    let rules = {
      target: [
        'user.name="Joe"',
        "user.name=\"Joe\"",
        "user.name='Joe'",

        'action.type="test"',

        'env.department.type="R&D"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        name: 'Joe'
      },
      action: {
        type: "test"
      },
      env: {
        department: {
          type: "R&D"
        }
      },
      resource: {}
    };

    expect(policy.check(data)).to.equal(true);
    expect(policy.check({
      user: {
        name: 'Joi'
      },
      action: {
        type: "test2"
      },
      env: {
        department: {
          type: "sales"
        }
      },
      resource: {}
    })).to.equal(false);
    expect(policy.check(data)).to.equal(true);
  });

  it(": ==", function () {
    let rules = {
      target: [
        'user.name=="Joe"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        name: 'Joe'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": == - negative case", function () {
    let rules = {
      target: [
        'user.name=="Joe"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        name: 'Sam'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);
  });

  it(": !=", function () {
    let rules = {
      target: [
        'user.name!="Sam"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        name: 'Joe'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": != - negative case", function () {
    let rules = {
      target: [
        'user.name!="Joe"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        name: 'Joe'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);
  });

  it(": >", function () {
    let rules = {
      target: [
        'user.age>30'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        age: 35
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": > - negative case", function () {
    let rules = {
      target: [
        'user.age>30'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        age: 25
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);
  });

  it(": <", function () {
    let rules = {
      target: [
        'user.age<30'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        age: 25
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": < - negative case", function () {
    let rules = {
      target: [
        'user.age<30'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        age: 35
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);
  });

  it(": >=", function () {
    let rules = {
      target: [
        'user.age>=30'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        age: 31
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": >= - equivalent", function () {
    let rules = {
      target: [
        'user.age>=30'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        age: 30
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": >= - negative case", function () {
    let rules = {
      target: [
        'user.age>=30'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        age: 10
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);
  });

  it(": <=", function () {
    let rules = {
      target: [
        'user.age<=30'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        age: 29
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": <= - equivalent", function () {
    let rules = {
      target: [
        'user.age<=30'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        age: 30
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": <= - negative case", function () {
    let rules = {
      target: [
        'user.age<=30'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        age: 35
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);
  });

  it(": ~=", function () {
    let rules = {
      target: [
        'user.role~=["user", "admin"]'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        role: 'user'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": ~= - negative case", function () {
    let rules = {
      target: [
        'user.role~=["user", "admin"]'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        role: 'super_admin'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);
  });

  it(": ^=", function () {
    let rules = {
      target: [
        'user.role^=["user", "admin"]'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        role: 'head_of_department'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": ^= - negative case", function () {
    let rules = {
      target: [
        'user.role^=["user", "admin"]'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        role: 'user'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);
  });

  it(": ?= - attribute is absent", function () {
    let rules = {
      target: [
        'user.role?="developer"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {},
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": ?= - attribute equivalent", function () {
    let rules = {
      target: [
        'user.role?="developer"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        role: 'developer'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });

  it(": ?= - negative case", function () {
    let rules = {
      target: [
        'user.role?="developer"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        role: 'admin'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);
  });

  it(": custom global operator", function () {
    register({
      name: '#=',
      namespace: '*',
      implement: (a, b) => (a === b)
    });

    let rules = {
      target: [
        'user.role#="developer"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        role: 'developer'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);

    unregister({
      name: '#=',
      namespace: '*'
    });
  });

  it(": custom global operator - negative case", function () {
    register({
      name: '#=',
      namespace: '*',
      implement: (a, b) => (a === b)
    });

    let rules = {
      target: [
        'user.role#="developer"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        role: 'admin'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);

    unregister({
      name: '#=',
      namespace: '*'
    });
  });

  it(": custom namespace operator", function () {
    register({
      name: '=',
      namespace: 'user.custom',
      implement: (a, b) => (a === b.toUpperCase())
    });

    let rules = {
      target: [
        'user.role="admin"',
        'user.custom="customString"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        custom: 'CUSTOMSTRING',
        role: 'admin'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);

    unregister({
      name: '=',
      namespace: 'user.custom',
    });
  });

  it(": custom namespace operator - negative case", function () {
    register({
      name: '=',
      namespace: 'user.custom',
      implement: (a, b) => (a === b.toUpperCase())
    });

    let rules = {
      target: [
        'user.role="admin"',
        'user.custom="customString"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        custom: 'customString',
        role: 'admin'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(false);

    unregister({
      name: '=',
      namespace: 'user.custom',
    });
  });

  it(": custom namespace operator - unregistered ", function () {
    let rules = {
      target: [
        'user.role="admin"',
        'user.custom="customString"'
      ]
    };

    let policy = new Policy(rules);
    let data = {
      user: {
        custom: 'customString',
        role: 'admin'
      },
      action: {},
      env: {},
      resource: {},
    };

    expect(policy.check(data)).to.equal(true);
  });
});