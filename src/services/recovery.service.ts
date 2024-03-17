import { TemporaryLink } from '../models/tmp-links.model';
import crypto from 'crypto';

class RecoveryService {

  async generateHashForPassRecovery (email: string): Promise<{hash: string;expires: string}> {
    const d = new Date();
    const time = `${d.getHours()}:${d.getMinutes()}`;
    
    //set expire time as 1 hour
    d.setHours(d.getHours() + 1);
    const algorithm = 'aes-192-cbc';
    const secret = `${email}-${time}`;
    
    return new Promise((resolve, reject) => {
    // First, we'll generate the key. The key length is dependent on the algorithm.
    // In this case for aes192, it is 24 bytes (192 bits).
      return crypto.scrypt(secret, 'secretSaltForPassRecoveryRB', 24, (err, key) => {
        if (err) throw reject(err);
        // Then, we'll generate a random initialization vector
        return crypto.randomFill(new Uint8Array(16), async (err, iv) => {
          if (err) throw reject(err);
          const cipher = crypto.createCipheriv(algorithm, key, iv);
          let encrypted = cipher.update('some clear text data', 'utf8', 'hex');
    
          encrypted += cipher.final('hex');
    
          //here i get encrypted string
          resolve({
            hash: encrypted,
            expires: d.toString(),
          });
        });
      });
    });
  }
    
  async checkPassRecoveryHash (recoveryId: string, hash: string) {
    const recoveryRow = await TemporaryLink.findOne({
      where: {
        id: recoveryId,
        hash,
      },
    });
    
    if (recoveryRow) {
      const expires = new Date(recoveryRow.expires);
      const now = new Date();
    
      if (now < expires) {
        return true;
      }
      throw 'Ссылка восстановления более не действительна. Это сделано в целях безопасности. Пожалуйста, запросите новую, если проблема все еще актуальна.';
    }
    throw 'Запрос на восстановление пароля c такими данными не существует. Пожалуйста, проверьте ссылку.';
  }
    
}

export default new RecoveryService();