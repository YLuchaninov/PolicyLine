"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/policyline.min').Policy;

describe("Time service functions", function () {
    it(": $moment", function () {
        let rules = {
            target: [
                "action.time = $strToInt($moment(user.time, 'unix').add(1, 'days').format('X'))"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {time: 1514820406};
        let action = {time: 1514906806};

        expect(policy.check(user, action)).to.equal(true);
    });

    it(": $timeBetween", function () {
        let rules = {
            target: [
                "$timeBetween($moment(env.time, 'HH:mm a').format('HH:mm a'),'9:00','18:00')"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let env = {time: 1514820406};

        expect(policy.check(null, null, env)).to.equal(true);
    });

    it(": $dataToTimestamp", function () {
        let rules = {
            target: [
                "$dataToTimestamp('2013-05-14 01:00')=1368482400"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let env = {time: 1368482400};

        expect(policy.check(null, null, env)).to.equal(true);
    });

    it(": $year", function () {
        let rules = {
            target: [
                "$year(env.time)=2013"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let env = {time: 1368482400};

        expect(policy.check(null, null, env)).to.equal(true);
    });

    it(": $quarter", function () {
        let rules = {
            target: [
                "$quarter(env.time)=2"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let env = {time: 1368482400};

        expect(policy.check(null, null, env)).to.equal(true);
    });

    it(": $month", function () {
        let rules = {
            target: [
                "$month(env.time)=4"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let env = {time: 1368482400};

        expect(policy.check(null, null, env)).to.equal(true);
    });
});