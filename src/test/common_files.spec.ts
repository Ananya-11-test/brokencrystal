
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
    it('should not access common files', () => {
      return runner.createScan({ tests: [TestType.COMMON_FILES], name: 'COMMON_FILES' })
        .timeout(3000000)
        .run({
          method: 'GET',
          url: `${process.env.SEC_TESTER_TARGET}`
        });
    });
  });
});
