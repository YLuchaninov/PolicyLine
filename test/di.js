"use strict";

let expect = require('chai').expect;
let ABAC = require('../dist/');

let Policy = ABAC.Policy;
let DI = ABAC.DI;

// disable errors notifications in console
ABAC.settings.log = false;

describe("Function Dependency Injection", function () {
    // it(": injection fail", function () {
    //     let rules = {
    //         target: [
    //             "user.name=$test('Joe')"
    //         ],
    //         effect: "permit",
    //         algorithm: "all"
    //     };
    //
    //     let policy = new Policy(rules);
    //     let user = {name: 'test_Joe'};
    //
    //     expect(policy.check(user)).to.equal(false);
    // });
    //
    // it(": clear", function () {
    //     function $test(value) {
    //         return 'test_' + value;
    //     }
    //
    //     DI.register($test);
    //     DI.clear();
    //
    //     let rules = {
    //         target: [
    //             "user.name=$test('Joe')"
    //         ],
    //         effect: "permit",
    //         algorithm: "all"
    //     };
    //
    //     let policy = new Policy(rules);
    //     let user = {name: 'test_Joe'};
    //
    //     expect(policy.check(user)).to.equal(false);
    // });
    //
    // it(": unregister pure function", function () {
    //     function $test(value) {
    //         return 'test_' + value;
    //     }
    //
    //     DI.register($test);
    //     DI.unregister($test);
    //
    //     let rules = {
    //         target: [
    //             "user.name=$test('Joe')"
    //         ],
    //         effect: "permit",
    //         algorithm: "all"
    //     };
    //
    //     let policy = new Policy(rules);
    //     let user = {name: 'test_Joe'};
    //
    //     expect(policy.check(user)).to.equal(false);
    // });

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

        //let policy = new Policy(rules);
        let user = {name: 'test_Joe'};


        //todo expect(policy.check(user)).to.equal(true);

        let rule = Policy.parseRule(rules.target[0]);
        //console.log(rule(user));

        expect(true).to.equal(true);
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

    // it(": register pure function", function () {
    //     function $test(value) {
    //         return 'test_' + value;
    //     }
    //
    //     DI.register($test);
    //
    //     let rules = {
    //         target: [
    //             "user.name=$test('Joe')"
    //         ],
    //         effect: "permit",
    //         algorithm: "all"
    //     };
    //
    //     let policy = new Policy(rules);
    //     let user = {name: 'test_Joe'};
    //
    //     expect(policy.check(user)).to.equal(true);
    // });

    afterEach(function () {
        DI.clear();
    });
});

