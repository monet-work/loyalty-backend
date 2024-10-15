import { Role, TokenType } from "@prisma/client";
import { Moment } from "moment";

export interface TokenResponse {
  token: string;
  expires: Date;
}

export interface AuthTokensResponse {
  access: TokenResponse;
  refresh?: TokenResponse;
}

export interface CustomJWTPayload {
  sub: string;
  role: Role;
  iat: Number;
  exp: Number;
  type: TokenType;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface BigInt {
  /** Convert to BigInt to string form in JSON.stringify */
  toJSON: () => string;
}
BigInt.prototype.toJSON = function () {
  return this.toString();
};
