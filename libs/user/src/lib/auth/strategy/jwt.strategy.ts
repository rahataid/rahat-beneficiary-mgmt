import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '@rahat/prisma';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PrismaService } from '@rumsan/prisma';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    // Extrac Bearer Token from Authorization header request

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; authAddress: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    return user; // User is appended to req.user
  }
}
