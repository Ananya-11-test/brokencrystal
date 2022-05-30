
import { SecRunner, SecScan } from '@sec-tester/runner';
import { TestType } from '@sec-tester/scan';

describe('/', () => {
  let runner: SecRunner;
  let scan: SecScan;

  beforeEach(async () => {
    runner = new SecRunner({ hostname: process.env.BRIGHT_CLUSTER });
    await runner.init();

  });

  afterEach(() => runner.clear());

  describe('GET /', () => {
    it('should contain proper SSL/TLS ciphers and configurations', () => {
      return runner.createScan({ tests: [TestType.INSECURE_TLS_CONFIGURATION], name: 'INSECURE_TLS_CONFIGURATION' })
        .timeout(3000000)
        .run({
          method: 'GET',
          url: `${process.env.SEC_TESTER_TARGET}`
        });
    });
  });
});
