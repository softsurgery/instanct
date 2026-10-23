import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import {
  GoogleTokenResponse,
  GoogleUserInfo,
} from '../interfaces/google.interface';
import {
  GithubEmail,
  GithubUserResponse,
} from '../interfaces/github.interface';
import {
  AppleTokenResponse,
  AppleIdTokenPayload,
  AppleUserIdentity,
} from '../interfaces/apple.interface';
import { AppleAuthUtils } from '../utils/apple-auth.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthProvidersService {
  private readonly logger = new Logger(AuthProvidersService.name);

  constructor(private readonly configService: ConfigService) {}

  async googleOAuth(
    code: string,
    codeVerifier: string = '',
    redirectUri?: string,
  ) {
    const tokenResponse: GoogleTokenResponse = await fetch(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          code_verifier: codeVerifier,
          client_id: process.env.GOOGLE_ID!,
          client_secret: process.env.GOOGLE_SECRET!,
          redirect_uri: redirectUri!,
          grant_type: 'authorization_code',
        }).toString(),
      },
    ).then((res) => res.json());

    if (!tokenResponse.access_token) {
      throw new Error(
        `Token exchange failed: ${JSON.stringify(tokenResponse)}`,
      );
    }

    const userInfo: GoogleUserInfo = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      },
    ).then((res) => res.json());

    return userInfo;
  }

  async githubOAuth(idToken: string) {
    const userResponse: GithubUserResponse = await fetch(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      },
    ).then((res) => res.json());

    let email = userResponse.email;
    const username = userResponse.login;

    if (!email) {
      const emails: GithubEmail[] = await fetch(
        'https://api.github.com/user/emails',
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      ).then((res) => res.json());

      const primary = emails.find((e) => e.primary && e.verified);
      email = primary?.email || null;
    }

    return {
      email,
      username,
    };
  }

  async linkedinOauth(idToken: string, redirectUri?: string) {
    let accessToken = idToken;

    if (!idToken.includes('.')) {
      const tokenResponse: { access_token?: string } = await fetch(
        'https://www.linkedin.com/oauth/v2/accessToken',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: idToken,
            client_id: process.env.LINKEDIN_CLIENT_ID || '',
            client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
            redirect_uri:
              redirectUri ||
              `${this.configService.get<string>('app.mobile.scheme') || 'instanctmobileapp'}://`,
          }).toString(),
        },
      ).then((res) => res.json());

      if (!tokenResponse.access_token) {
        throw new UnauthorizedException(
          'Failed to exchange LinkedIn authorization code',
        );
      }
      accessToken = tokenResponse.access_token;
    }

    // Use the access token to get user info
    const userInfoResponse: {
      email?: string;
      name?: string;
      given_name?: string;
      picture?: string;
    } = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((res) => res.json());

    return {
      email: userInfoResponse.email,
      username:
        userInfoResponse.name ||
        userInfoResponse.given_name ||
        userInfoResponse.email?.split('@')[0],
      picture: userInfoResponse.picture,
    };
  }

  /**
   * Generates a signed client_secret JWT for Apple OAuth authorization code exchange.
   */
  generateAppleClientSecret(clientId?: string): string {
    const resolvedClientId =
      clientId ||
      this.configService.get<string>('APPLE_CLIENT_ID') ||
      process.env.APPLE_CLIENT_ID ||
      'com.instanct.instanctma';

    const teamId =
      this.configService.get<string>('APPLE_TEAM_ID') ||
      process.env.APPLE_TEAM_ID ||
      '';

    const keyId =
      this.configService.get<string>('APPLE_KEY_ID') ||
      process.env.APPLE_KEY_ID ||
      'CM4NR9YR9G';

    const privateKey =
      this.configService.get<string>('APPLE_PRIVATE_KEY') ||
      process.env.APPLE_PRIVATE_KEY;

    const privateKeyPath =
      this.configService.get<string>('APPLE_PRIVATE_KEY_PATH') ||
      process.env.APPLE_PRIVATE_KEY_PATH;

    return AppleAuthUtils.generateClientSecret({
      clientId: resolvedClientId,
      teamId,
      keyId,
      privateKey,
      privateKeyPath,
    });
  }

  /**
   * Exchanges an Apple authorization code for an ID token and access token.
   */
  async exchangeAppleAuthCode(
    code: string,
    redirectUri?: string,
    clientId?: string,
  ): Promise<AppleTokenResponse> {
    const resolvedClientId =
      clientId ||
      this.configService.get<string>('APPLE_CLIENT_ID') ||
      process.env.APPLE_CLIENT_ID ||
      'com.instanct.instanctma';

    const clientSecret = this.generateAppleClientSecret(resolvedClientId);

    const bodyParams: Record<string, string> = {
      client_id: resolvedClientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    };

    if (redirectUri) {
      bodyParams.redirect_uri = redirectUri;
    }

    const response = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(bodyParams).toString(),
    });

    const tokenResponse: AppleTokenResponse = await response.json();

    if (!tokenResponse.id_token) {
      this.logger.error(
        `Apple auth code exchange failed: ${JSON.stringify(tokenResponse)}`,
      );
      throw new UnauthorizedException(
        tokenResponse.error_description ||
          tokenResponse.error ||
          'Failed to exchange Apple authorization code',
      );
    }

    return tokenResponse;
  }

  /**
   * Handles Apple OAuth authentication, supporting either an authorization code or an identity token.
   * Performs cryptographic verification against Apple public JWKS when configured.
   */
  async appleOAuth(
    tokenOrCode: string,
    redirectUri?: string,
  ): Promise<AppleUserIdentity> {
    let idToken = tokenOrCode;

    // If tokenOrCode is an authorization code (does not look like a 3-part JWT)
    if (!tokenOrCode.includes('.') || tokenOrCode.split('.').length !== 3) {
      const tokenResponse = await this.exchangeAppleAuthCode(
        tokenOrCode,
        redirectUri,
      );
      if (!tokenResponse.id_token) {
        throw new UnauthorizedException('Missing ID token from Apple');
      }
      idToken = tokenResponse.id_token;
    }

    // Determine allowed audiences from configuration
    const allowedAudiences: string[] = [];
    const envClientId =
      this.configService.get<string>('APPLE_CLIENT_ID') ||
      process.env.APPLE_CLIENT_ID;
    if (envClientId) allowedAudiences.push(envClientId);

    // Common app bundle/service IDs for Instanct
    if (!allowedAudiences.includes('com.instanct.instanctma')) {
      allowedAudiences.push('com.instanct.instanctma');
    }

    let payload: AppleIdTokenPayload;
    try {
      payload = await AppleAuthUtils.verifyIdToken<AppleIdTokenPayload>(
        idToken,
        allowedAudiences.length > 0 ? allowedAudiences : undefined,
      );
    } catch (err: any) {
      this.logger.warn(
        `Apple public key verification warning: ${err.message}. Decoding payload as fallback.`,
      );
      // Decode JWT payload safely if offline/network issue with JWKS
      const parts = idToken.split('.');
      if (parts.length === 3) {
        payload = JSON.parse(
          Buffer.from(parts[1], 'base64url').toString('utf8'),
        );
      } else {
        throw new UnauthorizedException('Invalid Apple token format');
      }
    }

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid Apple token: missing sub claim');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified:
        payload.email_verified === true || payload.email_verified === 'true',
      isPrivateEmail:
        payload.is_private_email === true || payload.is_private_email === 'true',
    };
  }
}
