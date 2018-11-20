let expect = require('chai').expect;
let PolicyLine = require('../dist/policyline.min');

let Policy = PolicyLine.Policy;

describe("Conditions Checking", function () {
    it(": positive case condition", function () {
        let rules = {
            target: [
                'user.role="admin"',
                'user.company=resource.company',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                role: 'admin',
                company: 'companyA'
            }
        };

        expect(policy.check(data)).to.equal(true);

        let conditions = policy.getConditions();
        let result = {company: 'companyA'};
        expect(conditions).to.deep.equal(result);
    });

    it(": positive case condition with mixin", function () {
        let rules = {
            target: [
                'resource.author=user.cuid',
                'resource.company="company_c"'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                cuid: '873n4y2xn4'
            },
            resource: {
                id: '98245n524n'
            }
        };

        expect(policy.check(data)).to.equal(true);

        let conditions = policy.getConditions();
        let result = {
            id: '98245n524n',
            author: '873n4y2xn4',
            company: 'company_c'
        };
        expect(conditions).to.deep.equal(result);
    });

    it(": double condition checking", function () {
        let rules = {
            target: [
                'user.role="admin"',
                'user.company=resource.company',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                role: 'admin',
                company: 'companyA'
            }
        };

        expect(policy.check()).to.equal(false);
        expect(policy.getConditions()).to.equal(undefined);

        expect(policy.check(data)).to.equal(true);
        expect(policy.getConditions()).to.deep.equal({company: 'companyA'});
    });

    it(": empty condition", function () {
        let rules = {
            target: [
                'user.role="admin"'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                role: 'admin'
            }
        };

        expect(policy.check(data)).to.equal(true);
        let conditions = policy.getConditions();
        expect(Object.keys(conditions).length).equal(0);
    });

    it(": negative case condition", function () {
        let rules = {
            target: [
                'user.role="admin"',
                'user.company=resource.company',
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                role: 'developer',
                company: 'companyA'
            }
        };

        expect(policy.check(data)).to.equal(false);
        let conditions = policy.getConditions();
        expect(conditions).to.equal(undefined);
    });

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

        let conditions = policy.getConditions();
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