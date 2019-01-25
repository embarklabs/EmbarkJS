/* global before,describe,it */
const {startRPCMockServer, TestProvider} = require('./test');

const async = require('async');
const {assert} = require('chai');

const Blockchain = require('../dist/blockchain');

describe('Blockchain', () => {
  describe('#connect', () => {
    before(() => {
      Blockchain.default.registerProvider('web3', TestProvider);
      Blockchain.default.setProvider('web3', {});
    });

    const scenarios = [
      {
        description: 'should not keep trying other connections if connected',
        servers: [true, true],
        visited: [true, false],
        error: false
      },
      {
        description: 'should keep trying other connections if not connected',
        servers: [false, true],
        visited: [true, true],
        error: false
      },
      {
        description: 'should return error if no connections succeed',
        servers: [false, false],
        visited: [true, true],
        error: true
      }
    ];

    scenarios.forEach(scenario => {
      it(scenario.description, done => {
        async.parallel(
          scenario.servers.map(validServer =>
            (cb) => startRPCMockServer({successful: validServer}, cb)
          ),
          (_err, servers) => {
            const connStrings = servers.map(server => server.connectionString);
            Blockchain.default.connect(connStrings, {}, err => {
              if(scenario.error) assert(err);

              servers.forEach((server, idx) => {
                assert.strictEqual(server.visited, scenario.visited[idx]);
              });
              done();
            });
          }
        );
      });
    });
  });
});
