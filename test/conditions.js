let expect = require('chai').expect;
let PolicyLine = require('../dist/policyline.min');

let Policy = PolicyLine.Policy;

describe("Conditions Checking", function () {
    it(": temporary test", function () {
        let rules = {
            target: [
                'user.company=resource.company',
                'resource.type="inner"',
                'resource.value>=100',
                'resource.value<200',
                'resource.likes~=["vaporizing", "talking"]',
                'resource.occupation="host/gi"..regExp', // /host/gi
                'resource.name.last="Ghost"',
                'resource.name.first~=["Ghost", "Non"]',
                // 'resource.department..or="R&D"',
                // 'resource.department..or="sale"',
                // 'resource.location..radius=100',
                // 'resource.location..inArea=user.location'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                location: [49.9935, 36.2304],
                company: 'companyA'
            }
        };

        expect(policy.check(data)).to.equal(true);
        console.log(policy.getConditions(null));
    });
});