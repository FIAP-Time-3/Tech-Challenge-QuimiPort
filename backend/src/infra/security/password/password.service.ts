import configurations from '../../configurations/configurations.js';
import * as bcrypt from 'bcrypt';

const salt = configurations().password.salt;

export class PasswordService {
  static async hash({ password }: { password: string }) {
    return await bcrypt.hash(password, salt);
  }

  static async compare({ password, hash }: { password: string; hash: string }) {
    return await bcrypt.compare(password, hash);
  }
}
