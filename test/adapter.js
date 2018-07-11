let expect = require('chai').expect;
let ABAC = require('../dist/policyline.min');

let Policy = ABAC.Policy;

describe("Adaptors Checking", function () {
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

});