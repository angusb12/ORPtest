import { E2eFixture } from '../e2e.fixture';

describe('BlogController (e2e)', () => {
  const fixture = new E2eFixture();

  beforeAll(async () => {
    await fixture.init();
  });

  it('blog/:id (GET)', () => {
    return fixture
      .request()
      .get('/blog/1')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain(
          '<h2 class="govuk-heading-l">Making regulation more accessible: Value driven by the ORP</h2>',
        );
      });
  });
});
