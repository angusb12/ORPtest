import { E2eFixture } from '../e2e.fixture';

describe('BlogController (e2e)', () => {
  const fixture = new E2eFixture();

  beforeEach(async () => {
    await fixture.init();
  });

  it('blog/:id (GET)', () => {
    return fixture
      .request()
      .get('/blog/1')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain(
          '<h2 class="govuk-heading-l">Building the Open Regulation Platform</h2>',
        );
      });
  });
});