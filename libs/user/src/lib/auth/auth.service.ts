import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { totp } from 'otplib';
import { LoginDto, SignupDto, WalletLoginDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { EMAIL_TEMPLATES, EVENTS } from '../constants';
import { UserService } from '../user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
totp.options = { step: 150 };

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  async walletLogin(dto: WalletLoginDto) {
    try {
      const messageHash = ethers?.hashMessage(ethers?.toUtf8Bytes(dto.message));
      const walletAddress = ethers?.recoverAddress(messageHash, dto.signature);
      const user = await this.userService.getUserByAuthAddress(walletAddress);
      if (!user) throw new ForbiddenException('User does not exist!');
      return this.signToken(user.id, user.authAddress);
    } catch (err) {
      throw err;
    }
  }

  async login(dto: LoginDto) {
    try {
      const OTP_SECRET = this.config.get('OTP_SECRET');
      const { otp, authAddress } = dto;
      // Get user by authAddress
      const user = await this.userService.getUserByAuthAddress(authAddress);
      if (!user) throw new ForbiddenException('User not found!');
      if (otp !== user.otp) throw new ForbiddenException('OTP did not match!');
      // Validate OTP
      const isValid = totp.check(otp, OTP_SECRET);
      if (!isValid) throw new ForbiddenException('OTP did not match!');
      // Sign token
      return this.signToken(user.id, user.authAddress);
    } catch (err) {
      throw err;
    }
  }

  async saveAndSendOTP(dto: any) {
    try {
      const OTP_SECRET = this.config.get('OTP_SECRET');
      const otp = totp.generate(OTP_SECRET);
      console.log(otp);
      const exist = await this.userService.getUserByAuthAddress(
        dto.authAddress,
      );
      if (!exist) throw new HttpException('User does not exist!', 404);
      const user = await this.userService.updateOtpByAddress(
        dto.authAddress,
        otp,
      );
      const context = {
        name: user.firstName,
        to: dto.authAddress,
        template: EMAIL_TEMPLATES.LOGIN,
        subject: 'OTP for login',
        otp,
      };
      if (user.otp) delete user.otp;
      // EMIT EVENT
      this.eventEmitter.emit(EVENTS.SEND_OTP_EMAIL, context);
      return user;
    } catch (err) {
      throw err;
    }
  }

  async singup(dto: SignupDto) {
    try {
      return this.userService.createUser(dto);
    } catch (err) {
      throw err;
    }
  }

  async signToken(
    userId: number,
    authAddress: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      authAddress,
    };
    const secret = this.config.get('JWT_SECRET');
    const expiryTime = this.config.get('JWT_EXPIRY_TIME');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: expiryTime,
      secret: secret,
    });

    return {
      accessToken: token,
    };
  }
}
