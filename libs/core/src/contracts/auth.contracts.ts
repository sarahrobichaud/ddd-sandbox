import { UserId } from "#identity/domain/values/ids.value";

export type Username = {
  value: string
  discriminator: string
}

export type Identity = {
  email: string;
  profileId: string | null;
  userId: UserId;
  isOnboarded: boolean;
  username: Username;
};

export type ActiveIdentity = Identity & {
  sessionId: string;
};

export type TokenType = "Bearer";

export type Tokens = {
  access_token: string;
  refresh_token: string;
  token_type: TokenType;
  expires_in: number;
};

export type AuthenticationResult = {
  identity: ActiveIdentity;
  tokens: Tokens;
};

export type SessionDetails = {
  id: string;
  user_agent: string | null;
  ip_address: string | null;
};
