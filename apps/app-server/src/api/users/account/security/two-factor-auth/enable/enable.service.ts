import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { dataAbstraction } from 'src/data/data-abstraction';
import { encryptAuthenticatorSecret } from 'src/utils';

import type { EndpointValues } from './enable.controller';

@Injectable()
export class EnableService {
  async isTwoFactorAuthEnabled({ userId }: EndpointValues): Promise<boolean> {
    return await dataAbstraction().hget(
      'user',
      userId,
      'two-factor-auth-enabled',
    );
  }

  async generateTwoAuthSecret() {
    return authenticator.generateSecret();
  }

  async saveTwoAuthSecretInDb({
    userId,
    authenticatorSecret,
    dtrx,
  }: EndpointValues) {
    await dataAbstraction().patch(
      'user',
      userId,
      {
        encrypted_authenticator_secret: encryptAuthenticatorSecret(
          authenticatorSecret!,
        ),
      },
      { dtrx },
    );
  }

  async createResponse({ userId, authenticatorSecret }: EndpointValues) {
    return {
      secret: authenticatorSecret,
      keyUri: authenticator.keyuri(
        await dataAbstraction().hget('user', userId, 'email'),
        'DeepNotes',
        authenticatorSecret!,
      ),
    };
  }
}
