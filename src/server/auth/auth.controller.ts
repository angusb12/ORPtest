import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Request,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import AuthRegisterDto from './types/AuthRegister.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { ErrorFilter } from '../error.filter';
import { AuthExceptionFilter } from './filters/authException.filter';
import { ViewDataInterceptor } from '../../view-data-interceptor.service';
import { ValidateForm } from '../form-validation';

@UseFilters(new AuthExceptionFilter())
@UseFilters(new ErrorFilter())
@UseInterceptors(ViewDataInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('register')
  @Render('pages/auth/register')
  register() {
    return;
  }

  @Post('register')
  @ValidateForm()
  @Redirect('/auth/unconfirmed')
  async registerPost(@Body() authRegisterDto: AuthRegisterDto, @Request() req) {
    await this.authService.registerUser(authRegisterDto);
    req.session.unconfirmedEmail = authRegisterDto.email;
    return;
  }
  @Get('login')
  @Render('pages/auth/login')
  login() {
    return;
  }
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @Redirect('/search')
  loginPost(@Request() req) {
    return req.user;
  }

  @Get('/logout')
  @Redirect('/auth/login')
  logout(@Request() req): any {
    req.session.destroy();
    return { msg: 'The user session has ended' };
  }

  @Get('unconfirmed')
  @Render('pages/auth/unconfirmed')
  unconfirmed() {
    return;
  }

  @Get('/resend-confirmation')
  async resendConfirmation(@Request() req, @Res() res) {
    const email = req.session.unconfirmedEmail;
    req.session.unconfirmedEmail = undefined;

    if (!email) {
      return res.redirect('/auth/login');
    }
    await this.authService.resendConfirmationCode(email);
    return res.render('pages/auth/confirmationSent');
  }
}