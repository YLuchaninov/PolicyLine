let expect = require('chai').expect;
let PolicyLine = require('../dist/policyline.min');

let Policy = PolicyLine.Policy;

describe("Crooss Responsibility Checking", function () {
  it("test", function () {
    let policyGroup = { // all algorithms set in 'all' by default
      expression: 'admin OR superAdmin OR user OR unregisteredUser',//'admin OR superAdmin OR user OR unregisteredUser',
      policies: {
        admin: {
            target: [
                "user.role='admin'",
                "resource.company=user.company",
            ]
        },
        superAdmin: {
            target: [
                "user.role='superAdmin'"
            ]
        },
        user: {
            target: [
                "user.role='user'",
                "user.company~=[\"company_a\",\"company_b\"]",
                "user.company=resource.company"
            ]
        },
        unregisteredUser: {
          target: [
            "resource.company='company_a'"
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
      },
      action: {},
      env: {}
    };

    expect(policy.check(data)).to.equal(true);
    const watchers = policy.getConditions();
    console.log(watchers);

    let result = {
      '$or':
        [
          {
            '$or':
              [
                { role: 'superAdmin' },
                { role: 'admin', company: 'company_b' },
              ]
          },
          {
            role: 'user',
            company: {
              '$in': ['company_a', 'company_b'],
              '$eq': 'company_b'
            }
          }
        ]
    };
    expect(watchers).to.deep.equal(result);
  });

});