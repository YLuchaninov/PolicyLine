let expect = require('chai').expect;
let PolicyLine = require('../dist/policyline.min');

let Policy = PolicyLine.Policy;

describe("Watchers Checking", function () {
    it(": simple case watcher", function () {
        let rules = {
            target: [
                'user.role="admin"',
                'user.company=resource.company',
            ]
        };

        let data = {
            resource: {
                company: 'companyA'
            }
        };

        let policy = new Policy(rules);
        let watchers = policy.getWatchers(data);

        let result = {role: 'admin', company: 'companyA'};
        expect(watchers).to.deep.equal(result);
    });

    it(": double case watcher", function () {
        let rules = {
            target: [
                'user.role="admin"',
                'user.company=resource.company',
            ]
        };

        let data = {
            resource: {
                company: 'companyA'
            }
        };

        let policy = new Policy(rules);
        policy.getWatchers(data);
        let watchers = policy.getWatchers(data);

        let result = {role: 'admin', company: 'companyA'};
        expect(watchers).to.deep.equal(result);
    });

    it(": empty watchers - empty object", function () {
        let rules = {
            target: []
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                role: 'admin'
            }
        };

        let watchers = policy.getWatchers(data);
        expect(Object.keys(watchers).length).equal(0);
    });

    it(": complex test", function () {
        let rules = {
            target: [
                'user.company=resource.company',
                'user.type="inner"',
                'user.value>=100',
                'user.value<200',
                'user.likes~=["vaporizing", "talking"]',
                'user.occupation="host/gi"..regExp', // /host/gi
                'user.name.last="Ghost"',
                'user.name.first~=["Ghost", "Non"]',
                'user.department..or="R&D"',
                'user.department..or="sale"',
                'user.location..radius=100',
                'user.location..inArea=resource.location'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            resource: {
                location: [49.9935, 36.2304],
                company: 'companyA'
            }
        };

        let watchers = policy.getWatchers(data);
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

        expect(watchers).to.deep.equal(result);
    });

});