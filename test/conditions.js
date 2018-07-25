let expect = require('chai').expect;
let PolicyLine = require('../dist/policyline.min');

let Policy = PolicyLine.Policy;

describe("Conditions Checking", function () {
    it(": complex test", function () {
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
                'resource.department..or="R&D"',
                'resource.department..or="sale"',
                'resource.location..radius=100',
                'resource.location..inArea=user.location'
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

        let conditions = policy.getConditions(null);
        let result = {
            "company": "companyA",
            "type": "inner",
            "value": {
                "$gte": 100,
                "$lt": 200
            },
            "likes": {
                "$in": [
                    "vaporizing",
                    "talking"
                ]
            },
            "occupation": /host/gi,
            "name.last": "Ghost",
            "name.first": {
                "$in": [
                    "Ghost",
                    "Non"
                ]
            },
            "department": {
                "$or": [
                    "R&D",
                    "sale"
                ]
            },
            "location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [
                            49.9935,
                            36.2304
                        ]
                    },
                    "$maxDistance": 100000
                }
            }
        };

        expect(conditions).to.deep.equal(result);
    });
});