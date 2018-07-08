let expect = require('chai').expect;
let ABAC = require('../dist/policyline.min');

let Policy = ABAC.Policy;

describe("Mutations Checking", function () {
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


});