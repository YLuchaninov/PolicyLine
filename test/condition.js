"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/').Policy;

describe("Condition", function () {
    it(": mixins", function () {
        let rules = {};

        let policy = new Policy(rules);
        let user = {firstName: 'John'};

        policy.check(user);
        let condition = policy.condition({lastName: 'Doe'});

        expect(condition).to.deep.equal({
            user: { lastName: 'Doe', firstName: 'John' },
            action: undefined,
            env: undefined,
            resource: undefined,
            condition: undefined
        });
    });

    it(": compile", function () {
        let rules = {
            condition: [
                'resource.name="post"',
                "resource.location=user.location"
            ]
        };

        let policy = new Policy(rules);
        let user = {location: 'NY'};

        policy.check(user);
        let condition = policy.condition();
        console.log(condition);

        expect(condition).to.deep.equal({
            user: { location: 'NY' },
            action: undefined,
            env: undefined,
            resource: undefined,
            condition: {
                name: 'post',
                location: 'NY'
            }
        });
    });

});