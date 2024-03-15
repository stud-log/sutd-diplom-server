import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export class CommonService {

  // generateHash = async (group: string) => {
  //   const d = new Date();
  //   const time = `${d.getHours()}:${d.getMinutes()}`;
  //   //set expire time as 72 hour
  //   d.setHours(d.getHours() + 72);
  //   const algorithm = 'aes-192-cbc';
  //   const secret = `${group}-${time}`;

  //   // First, we'll generate the key. The key length is dependent on the algorithm.
  //   // In this case for aes192, it is 24 bytes (192 bits).
  //   return await new Promise<{ hashId: number; hash: string }>((resolve, reject) => {
  //     crypto.scrypt(secret, 'secretSaltForPassRecoveryRB', 24, (err, key) => {
  //       if (err) reject(err);
  //       // Then, we'll generate a random initialization vector
  //       return crypto.randomFill(new Uint8Array(16), async (err, iv) => {
  //         if (err) reject(err);
  //         const cipher = crypto.createCipheriv(algorithm, key, iv);
  //         let encrypted = cipher.update('some clear text data', 'utf8', 'hex');
  //         encrypted += cipher.final('hex');

  //         here i get encrypted string
  //         const invite = await Invite.create({
  //           group,
  //           hash: encrypted,
  //           expires: d.toString(),
  //         });

  //         resolve({ hashId: invite.id, hash: invite.hash });
  //       });
  //     });
  //   });
  // };

  // getInvite = async (hashId: number, hash: string, group: string) => {
  //   return await Invite.findOne({
  //     where: {
  //       group,
  //       id: hashId,
  //       hash,
  //     },
  //   });
  // };

  // checkHash = async (dto: InviteCheckDto) => {
  //   const recoveryRow = await this.getInvite(dto.hashId, dto.hash, dto.group);
  //   if (recoveryRow) {
  //     const expires = new Date(recoveryRow.expires);
  //     const now = new Date();
  //     if (now < expires) {
  //       return true;
  //     }
  //     throw 'Срок приглашения истек';
  //   }
  //   throw 'Не найдена запись о приглашении';
  // };
}
