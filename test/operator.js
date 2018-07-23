let expect = require('chai').expect;
let ABAC = require('../dist/policyline.min');

let Policy = ABAC.Policy;
let register = ABAC.registerOperator;
let unregister = ABAC.unregisterOperator;

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
            }
        };

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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
            user: {}
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
            }
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
            }
        };

        expect(policy.check(data)).to.equal(false);
    });

    it(": custom global operator", function () {
        register('#=', '*', (a, b) => (a === b));

        let rules = {
            target: [
                'user.role#="developer"'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                role: 'developer'
            }
        };

        expect(policy.check(data)).to.equal(true);

        unregister('#=', '*');
    });

    it(": custom global operator - negative case", function () {
        register('#=', '*', (a, b) => (a === b));

        let rules = {
            target: [
                'user.role#="developer"'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                role: 'admin'
            }
        };

        expect(policy.check(data)).to.equal(false);

        unregister('#=', '*');
    });

    it(": custom global operator - unregister", function () {
        let rules = {
            target: [
                'user.role#="developer"'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                role: 'developer'
            }
        };

        expect(policy.check(data)).to.equal(false);
    });

    it(": custom namespace operator", function () {
        register('=', 'user.custom', (a, b) => (a === b.toUpperCase()));

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
            }
        };

        expect(policy.check(data)).to.equal(true);

        unregister('=', 'user.custom');
    });

    it(": custom namespace operator - negative case", function () {
        register('=', 'user.custom', (a, b) => (a === b.toUpperCase()));

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
            }
        };

        expect(policy.check(data)).to.equal(false);

        unregister('=', 'user.custom');
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
            }
        };

        expect(policy.check(data)).to.equal(true);
    });
});