import { E2eFixture } from '../e2e.fixture';
import * as cheerio from 'cheerio';
import { getRegulatorSession } from '../helpers/userSessions';

const mockS3 = {
  send: jest.fn(),
};
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => mockS3),
    DeleteObjectCommand: jest.fn((args) => ({
      ...args,
      deleteObjectCommand: true,
    })),
    CopyObjectCommand: jest.fn((args) => ({
      ...args,
      copyObjectCommand: true,
    })),
    GetObjectCommand: jest.fn((args) => ({ ...args, getObjectCommand: true })),
    HeadObjectCommand: jest.fn((args) => ({
      ...args,
      headObjectCommand: true,
    })),
  };
});
describe('Ingest document: status', () => {
  const fixture = new E2eFixture();
  let regulatorSession = null;

  beforeAll(async () => {
    await fixture.init();
    regulatorSession = await getRegulatorSession(fixture);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('gets the meta and displays the options', () => {
      mockS3.send.mockResolvedValueOnce({ Metadata: { old: 'meta' } });
      return fixture
        .request()
        .get('/ingest/document/document-status?key=unconfirmeddoc')
        .set('Cookie', regulatorSession)
        .expect(200)
        .expect((res) => {
          const $ = cheerio.load(res.text);
          expect($('input[name="status"]').length).toEqual(2);
          expect($('button[type="submit"]').text().trim()).toEqual('Continue');
          expect(
            $('input[type="hidden"][value="unconfirmeddoc"][name="key"]')
              .length,
          ).toBeTruthy();
        });
    });

    describe('guards', () => {
      it('redirects unauthenticated users', () => {
        return fixture
          .request()
          .get('/ingest/document/document-status?key=unconfirmeddoc')
          .expect(302)
          .expect('Location', '/unauthorised/ingest');
      });
    });
  });

  describe('POST', () => {
    it('updates the meta data with selected option', async () => {
      mockS3.send
        .mockResolvedValueOnce({
          Metadata: { old: 'meta', regulator_id: 'public.io' },
        })
        .mockResolvedValueOnce({ updated: 'unconfirmed/key' });

      return fixture
        .request()
        .post('/ingest/document/document-status')
        .set('Cookie', regulatorSession)
        .send({ key: 'unconfirmed/key', status: 'published' })
        .expect(302)
        .expect('Location', '/ingest/document/submit?key=unconfirmed/key')
        .expect(() => {
          expect(mockS3.send).toBeCalledTimes(2);
        });
    });

    it('rejects if wrong regulator_id', async () => {
      mockS3.send
        .mockResolvedValueOnce({
          Metadata: { old: 'meta', regulator_id: 'something' },
        })
        .mockResolvedValueOnce({ updated: 'unconfirmed/key' });

      return fixture
        .request()
        .post('/ingest/document/document-status')
        .set('Cookie', regulatorSession)
        .send({ key: 'unconfirmed/key', status: 'published' })
        .expect(302)
        .expect('Location', '/unauthorised/ingest')
        .expect(() => {
          expect(mockS3.send).toBeCalledTimes(1);
        });
    });

    describe('guards', () => {
      it('redirects unauthenticated users', () => {
        return fixture
          .request()
          .post('/ingest/document/document-status')
          .send({ key: 'unconfirmed/key', status: 'published' })
          .expect(302)
          .expect('Location', '/unauthorised/ingest');
      });
    });
  });
});
