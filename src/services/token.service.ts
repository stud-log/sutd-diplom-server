import { RefreshToken } from '../models/refresh-tokens.model';
import { RoleCreationDTO } from '@stud-log/news-types/dto';
import jwt from 'jsonwebtoken';

export type TokenPayload = {id: number; email: string; groupId: number; permissions: RoleCreationDTO['permissions']};
class TokenService {
  generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: '48h' });
    const refreshToken = jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: '30d' });
    return {
      accessToken,
      refreshToken
    };
  }

  validateAccessToken(token: string): TokenPayload | null {
    try {
      const userData = jwt.verify(token, process.env.SECRET_KEY as string);
      return userData as TokenPayload;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token: string): TokenPayload | null {
    try {
      const userData = jwt.verify(token, process.env.SECRET_KEY as string);
      return userData as TokenPayload;
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId: number, refreshToken: string) {
    const tokenData = await RefreshToken.findOne({ where: { userId } });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await RefreshToken.create({ userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken: string) {
    const tokenData = await RefreshToken.destroy({ where: { refreshToken } });
    return tokenData;
  }

  async findToken(refreshToken: string) {
    const tokenData = await RefreshToken.findOne({ where:{ refreshToken } });
    return tokenData;
  }
}

export default new TokenService();