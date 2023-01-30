import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { AwsConfig } from '../config';
import AuthRegisterDto from './types/AuthRegister.dto';
import { AuthException, AuthExceptionCode } from './types/AuthException';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
  ) {
    const { cognito } = config.get<AwsConfig>('aws');
    this.userPool = new CognitoUserPool({
      UserPoolId: cognito.userPoolId,
      ClientId: cognito.clientId,
    });
  }

  async registerUser(authRegisterUserDto: AuthRegisterDto) {
    const { email, password } = authRegisterUserDto;

    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, password, null, null, async (err, result) => {
        if (!result) {
          // callback error type set incorrectly in sdk
          const cognitoError = err as unknown as { code: AuthExceptionCode };
          reject(new AuthException({ code: cognitoError.code }));
        } else {
          const user = await this.userService.createUser(email);
          resolve(user);
        }
      });
    });
  }

  authenticateUser({ email, password }: { email: string; password: string }) {
    const userData = { Username: email, Pool: this.userPool };
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    const cognitoUser = new CognitoUser(userData);
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async () => {
          const user = await this.userService.getUserByEmail(email);
          resolve({
            email,
            regulator: user.regulator,
          });
        },
        onFailure: (err) => {
          reject(new AuthException({ code: err.code, meta: { email } }));
        },
      });
    });
  }

  async resendConfirmationCode(email: string) {
    const userData = { Username: email, Pool: this.userPool };
    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}