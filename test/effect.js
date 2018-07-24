let expect = require('chai').expect;
let PolicyLine = require('../dist/policyline.min');

let Policy = PolicyLine.Policy;

describe("Effect Checking", function () {
    it(": 'permit'", function () {
        let rules = {
            target: [
                'user.name=="Joe"'
            ],
            effect: 'permit'
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                name: 'Joe'
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

    it(": 'permit' - negative case", function () {
        let rules = {
            target: [
                'user.name=="Joe"'
            ],
            effect: 'permit'
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                name: 'Sam'
            }
        };

        expect(policy.check(data)).to.equal(false);
    });

    it(": 'permit by default'", function () {
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

    it(": 'permit by default' - negative case", function () {
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

    it(": 'deny'", function () {
        let rules = {
            target: [
                'user.name=="Joe"'
            ],
            effect: 'deny'
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                name: 'Joe'
            }
        };

        expect(policy.check(data)).to.equal(false);
    });

    it(": 'deny' - negative case", function () {
        let rules = {
            target: [
                'user.name=="Joe"'
            ],
            effect: 'deny'
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                name: 'Sam'
            }
        };

        expect(policy.check(data)).to.equal(true);
    });

});