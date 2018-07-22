let expect = require('chai').expect;
let ABAC = require('../dist/policyline.min');

let Policy = ABAC.Policy;
let register = ABAC.registerMutator;
let unregister = ABAC.unregisterMutator;

describe("Mutators Checking", function () {
    it(": toInt", function () {
        let rules = {
            target: [
                'user.str..toInt=100',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                str: '100'
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": toInt - negative case", function () {
        let rules = {
            target: [
                'user.str..toInt=100',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                str: '200'
            }
        };

        expect(policy.check(data)).to.equal(false);
    });

    it(": toString", function () {
        let rules = {
            target: [
                'user.num..toString="100"',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                num: 100
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": toString - negative case", function () {
        let rules = {
            target: [
                'user.num..toString="200"',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                num: 100
            }
        };

        expect(policy.check(data)).to.equal(false);
    });


    it(": left side lowercase", function () {
        let rules = {
            target: [
                'user.name..lowercase="joe"',
                "user.name..lowercase=\"joe\"",
                "user.name..lowercase='joe'",
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

    it(": left side trim & multi mutation", function () {
        let rules = {
            target: [
                'user.name..trim="Joe"',
                'user.name..trim..lowercase="joe"',
                'user.name..trim..uppercase="JOE"',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                name: ' Joe '
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": right side lowercase", function () {
        let rules = {
            target: [
                'user.name="Joe"..lowercase'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                name: 'joe'
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": right side uppercase", function () {
        let rules = {
            target: [
                'user.name="Joe"..uppercase'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                name: 'JOE'
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": right side multi mutation", function () {
        let rules = {
            target: [
                'user.name="Joe"..uppercase..lowercase'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                name: 'joe'
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": Date mutations", function () {
        let rules = {
            target: [
                'action.date..month>=6', // only at summer
                'action.date..month<=8',
                'action.date..weekday^=[6,7]', // only in work day
                'action.date..hour>=21', // only after 21.30
                'action.date..minute>30',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            action: {
                date: 'Jul 11 2018 21:48:30 GMT+0300'
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": Date mutations - Date instance", function () {
        let rules = {
            target: [
                'action.date..month>=6', // only at summer
                'action.date..month<=8',
                'action.date..weekday^=[6,7]', // only in work day
                'action.date..hour>=21', // only after 21.30
                'action.date..minute>30',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            action: {
                date: new Date('Jul 11 2018 21:48:30 GMT+0300')
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": Date mutations - negative case", function () {
        let rules = {
            target: [
                'action.date..month>=6', // only at summer
                'action.date..month<=8',
                'action.date..weekday^=[6,7]', // only in work day
                'action.date..hour<=21', // only before 21.30
                'action.date..minute<30',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            action: {
                date: 'Jul 11 2018 21:48:30 GMT+0300'
            }
        };

        expect(policy.check(data)).to.equal(false);
    });

    it(": OR", function () {
        let rules = {
            target: [
                'user.role..or="user"',
                'user.role..or="admin"',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                role: 'admin'
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": OR - negative case", function () {
        let rules = {
            target: [
                'user.role..or="user"',
                'user.role..or="admin"',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                role: 'super_user'
            }
        };

        expect(policy.check(data)).to.equal(false);
    });

    it(": radius && inArea", function () {
        let rules = {
            target: [
                'user.location..radius=100',
                'user.location..inArea=[49.82218642, 35.55960819]',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                location: [49.9935, 36.2304]
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": radius && inArea - right side", function () {
        let rules = {
            target: [
                '100=user.location..radius',
                '[49.82218642, 35.55960819]=user.location..inArea',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                location: [49.9935, 36.2304]
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": radius && inArea - negative case", function () {
        let rules = {
            target: [
                'user.location..radius=100',
                'user.location..inArea=[49.25182306, 33.26346561]',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                location: [49.9935, 36.2304]
            }
        };

        expect(policy.check(data)).to.equal(false);
    });

    it(": custom mutator", function () {
        register('add10', (a) => (a + 10));
        let rules = {
            target: [
                'user.num..add10=110',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                num: 100
            }
        };

        expect(policy.check(data)).to.equal(true);
        unregister('add10');
    });

    it(": custom mutator - right side", function () {
        register('add10', (a) => (a + 10));
        let rules = {
            target: [
                '110=user.num..add10',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                num: 100
            }
        };

        expect(policy.check(data)).to.equal(true);
        unregister('add10');
    });

    it(": custom mutator - negative case", function () {
        register('add10', (a) => (a + 10));
        let rules = {
            target: [
                'user.num..add10=120',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                num: 100
            }
        };

        expect(policy.check(data)).to.equal(false);
        unregister('add10');
    });

    it(": custom mutator - unregister case", function () {
        let rules = {
            target: [
                'user.num..add10=110',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                num: 100
            }
        };

        expect(policy.check(data)).to.equal(false);
    });

});