export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
};

export type CompleteInviteSessionInput = {
  accessToken: string;
  refreshToken: string;
};

export type InviteFragmentPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number | null;
  tokenType: string | null;
  type: string | null;
};

export type UpdatePasswordPayload = {
  password: string;
};
