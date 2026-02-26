import { Password } from "#identity/domain/values/password.value";

export interface PasswordHasherPort {
  hash(plain: Password): Promise<Password>;
  compare(plain: Password, hash: Password): Promise<boolean>;
}
