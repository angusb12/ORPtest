import { Controller, Get, Render, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ViewDataInterceptor } from '../view-data.interceptor';

@Controller()
@UseInterceptors(ViewDataInterceptor)
export class SupportingLinksController {
  private url;
  constructor(private readonly config: ConfigService) {
    this.url = `https://${config.get<string>('domain')}`;
  }
  @Get('/sitemap')
  @Render('pages/supportingLinks/index')
  async getSitemap() {
    return {
      siteSections: {
        Home: this.url,
        Blog: {
          ['Blog posts']: `${this.url}/blog`,
          ['Blog post: Making regulation more accessible: Value driven by the ORP']: `${this.url}/blog/1`,
        },
        'Register Your Interest': {
          'Register Your Interest': `${this.url}/subscribe`,
        },
        Search: {
          'Search for Regulatory Material': `${this.url}/search`,
        },
        Upload: {
          'Upload a document': `${this.url}/ingest`,
        },
        'Developer Portal': {
          'Your API credentials': `${this.url}/developer`,
          'Metadata Schema': `${this.url}/developer/metadata-schema`,
          'API Documentation': `${this.url}/developer/api/docs`,
        },
        Authorisation: {
          'Sign In': `${this.url}/auth/login`,
          'Your Account': `${this.url}/user`,
          'Create Account': `${this.url}/auth/register`,
          'Delete Account': `${this.url}/auth/delete-user`,
          'Change your password': `${this.url}/auth/reset-password`,
          'Forgotten password': `${this.url}/auth/new-password`,
        },
        Support: {
          Cookies: `${this.url}/cookies`,
        },
      },
    };
  }

  @Get('/cookies')
  @Render('pages/supportingLinks/cookies')
  async getCookies() {
    return {};
  }

  @Get('/accessibility')
  @Render('pages/supportingLinks/accessibility')
  async getAccessibilityStatement() {
    return {};
  }

  @Get('/privacy')
  @Render('pages/supportingLinks/privacy')
  async getPrivacyStatement() {
    return {};
  }
}
