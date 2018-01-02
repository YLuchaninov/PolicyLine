"use strict";

let expect = require('chai').expect;
let ABAC = require('../dist/policyline.min');

let Policy = ABAC.Policy;
let DI = ABAC.DI;

// disable errors notifications in console by singleton settings
ABAC.settings.log = false;

describe("Dependency Injection", function () {
     it(": register by name", function () {
        DI.register('$test', function (value) {
            return 'test_' + value;
        });

        let rules = {
            target: [
                "user.name=$test('Joe')"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: 'test_Joe'};

        expect(policy.check(user)).to.equal(true);
    });

    it(": register pure function", function () {
        function $test(value) {
            return 'test_' + value;
        }

        DI.register($test);

        let rules = {
            target: [
                "user.name=$test('Joe')"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: 'test_Joe'};

        expect(policy.check(user)).to.equal(true);
    });

    it(": right site injection", function () {
        function $test(value) {
            return 'test_' + value;
        }

        DI.register($test);

        let rules = {
            target: [
                "$test('Joe')=user.name"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: 'test_Joe'};

        expect(policy.check(user)).to.equal(true);
    });

    it(": injection fail", function () {
        let rules = {
            target: [
                "user.name=$test('Joe')"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: 'test_Joe'};

        expect(policy.check(user)).to.equal(false);
    });

    it(": clear", function () {
        function $test(value) {
            return 'test_' + value;
        }

        DI.register($test);
        DI.clear();

        let rules = {
            target: [
                "user.name=$test('Joe')"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: 'test_Joe'};

        expect(policy.check(user)).to.equal(false);
    });

    it(": unregister pure function", function () {
        function $test(value) {
            return 'test_' + value;
        }

        DI.register($test);
        DI.unregister($test);

        let rules = {
            target: [
                "user.name=$test('Joe')"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: 'test_Joe'};

        expect(policy.check(user)).to.equal(false);
    });

   it(": unregister by name", function () {
        function $test(value) {
            return 'test_' + value;
        }

        DI.register($test);
        DI.unregister('$test');

        let rules = {
            target: [
                "user.name=$test('Joe')"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: 'test_Joe'};

        expect(policy.check(user)).to.equal(false);
    });

    afterEach(function () {
        DI.clear();
    });

    after(function () {
        DI.loadPresets();
    });
});

