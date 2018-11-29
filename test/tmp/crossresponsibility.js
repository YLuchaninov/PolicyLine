let expect = require('chai').expect;
let PolicyLine = require('../dist/policyline.min');

let Policy = PolicyLine.Policy;

describe("Crooss Responsibility Checking", function () {
    it("test", function () {
        let policyGroup = { // all algorithms set in 'all' by default
            expression: 'unregisteredUser',//'admin OR superAdmin OR user OR unregisteredUser',
            policies: {
                // admin: {
                //     target: [
                //         "user.role='admin'",
                //         "resource.company=user.company",
                //     ]
                // },
                // superAdmin: {
                //     target: [
                //         "user.role='superAdmin'"
                //     ]
                // },
                // user: {
                //     target: [
                //         "user.role='user'",
                //         "user.company~=[\"company_a\",\"company_b\"]",
                //         "user.company=resource.company"
                //     ]
                // },
                unregisteredUser: {
                    target: [
                        "user.company='company_a'"
                    ]
                },
            }
        };

        const policy = new Policy(policyGroup);
      const data = {
          resource: {
            location: {coordinates: [49.9935, 36.2304], type: 'Point'},
            tags: ['tag', 'location'],
            category: 'inner',
            title: 'post',
            content: 'content user company_b',
            author: 'cjot05axm000161s5g5ip0b96',
            company: 'company_b',
            cuid: 'cjot05b3k000861s5mpoiwd3e',
          }
        };
        console.log(policy.check(data)) // todo should be false
      //const watchers = policy.getWatchers(data);
      //console.log(JSON.stringify(watchers, null, 2));
      // let result = {
      //     role: 'super_admin'
      // };
      // expect(watchers).to.deep.equal(result);
    });

});