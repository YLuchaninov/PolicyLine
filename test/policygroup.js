let expect = require('chai').expect;
let PolicyLine = require('../dist/policyline.min');

let Policy = PolicyLine.Policy;

describe("Policy Group", function () {
    it(": group expression", function () {

        let policyGroup = { // all algorithms set in 'all' by default
            expression: '(admin OR super_admin)OR(user AND location)',
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
                        "user.role='super_admin'"
                    ],
                    effect: "permit"
                }

            }
        };
        let policy = new Policy(policyGroup);

        let data = {
            user: {role: 'admin'}
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": group condition - two operands", function () {
        let policyGroup = { // all algorithms set in 'all' by default
            expression: '(admin OR super_admin)OR(user AND location)',
            policies: {
                user: {
                    effect: "permit",
                    target: [
                        'resource.occupation="host"..regExp',
                        'resource.age>=17'
                    ]
                },
                location: {
                    effect: "permit",
                    target: [
                        'resource.age<66',
                        'resource.name.last="Ghost"',
                        'resource.likes~=["vaporizing", "talking"]',
                    ]
                },
                admin: {
                    target: [
                        'user.role="admin"',
                        'resource.test="test"'
                    ],
                    effect: "permit",
                },
                super_admin: {
                    target: [
                        'user.role="super_admin"',
                        'resource.test="second_test"'
                    ],
                    effect: "permit"
                }
            }
        };

        // mongoose 'find' object from 'http://mongoosejs.com/docs/queries.html'
        let result = {
            occupation: /host/,
            'name.last': 'Ghost',
            age: {
                $gte: 17,
                $lt: 66
            },
            likes: {
                $in: ['vaporizing', 'talking']
            }
        };

        let policy = new Policy(policyGroup);
        expect(policy.check()).to.equal(true);

        expect(policy.getConditions()).to.deep.equal(result);
    });

    it(": group condition - one operand", function () {
        let policyGroup = { // all algorithms set in 'all' by default
            expression: '(admin OR super_admin)OR(user AND location)',
            policies: {
                user: {
                    effect: "permit",
                    target: [
                        'resource.occupation="host/"..regExp',
                        'resource.age>=17'
                    ]
                },
                location: {
                    effect: "permit",
                    target: [
                        'resource.age<66',
                        'resource.name.last="Ghost"',
                        'resource.likes~=["vaporizing", "talking"]',
                    ]
                },
                admin: {
                    target: [
                        'user.role="admin"',
                        'resource.test="test"'
                    ],
                    effect: "permit",
                },
                super_admin: {
                    target: [
                        'user.role="super_admin"',
                        'resource.test="second_test"'
                    ],
                    effect: "permit"
                }
            }
        };

        // mongoose 'find' object from 'http://mongoosejs.com/docs/queries.html'
        let result = { test: 'test' };

        let policy = new Policy(policyGroup);
        expect(policy.check({
            user: {
                role: 'admin',
            }
        })).to.equal(true);

        expect(policy.getConditions()).to.deep.equal(result);
    });

    // todo watchers policy group testing
});