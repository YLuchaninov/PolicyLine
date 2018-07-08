"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/policyline.min').Policy;

describe("Array service functions", function () {
    it(": $in", function () {
        let rules = {
            target: [
                "$in(['admin', 'user'],user.role)"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {role: 'admin'};

        expect(policy.check(user)).to.equal(true);
    });
});