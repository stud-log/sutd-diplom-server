import { TemporaryLink } from '../models/tmp-links.model';
import crypto from 'crypto';

class RecoveryService {

  async generateHashForPassRecovery(email: string): Promise<{hash: string; expires: string}> {
    const d = new Date();
    const time = `${d.getHours()}:${d.getMinutes()}`;
    
    // Устанавливаем время истечения на 2 недели
    d.setDate(d.getDate() + 14);
  
    const algorithm = 'aes-192-cbc';
    const secret = `${email}-${time}`;
  
    return new Promise((resolve, reject) => {
      // Генерируем ключ. Для aes-192 длина ключа должна быть 24 байта (192 бита).
      return crypto.scrypt(secret, 'secretSaltForPassRecoveryRB', 24, (err, key) => {
        if (err) return reject(err);
        
        // Генерируем случайный вектор инициализации (IV)
        return crypto.randomFill(new Uint8Array(16), (err, iv) => {
          if (err) return reject(err);
          
          const cipher = crypto.createCipheriv(algorithm, key, iv);
          let encrypted = cipher.update('some clear text data', 'utf8', 'hex');
          encrypted += cipher.final('hex');
          
          // Возвращаем зашифрованный текст и время истечения
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