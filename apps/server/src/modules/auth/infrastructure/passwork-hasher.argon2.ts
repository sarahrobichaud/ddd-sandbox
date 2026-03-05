import { PasswordHasherPort } from "@cavok/core/auth";
import { Password } from "@cavok/core/auth/domain/values/password.value";
import argon2 from "argon2";

export class Argon2PasswordHasher implements PasswordHasherPort {
  async hash(plain: Password): Promise<Password> {
    return Password.fromHash(await argon2.hash(plain.hash));
  }
  async compare(plain: Password, hash: Password): Promise<boolean> {
    //TODO: Handle failure better
    return await argon2.verify(hash.hash, plain.hash);
  }
}
