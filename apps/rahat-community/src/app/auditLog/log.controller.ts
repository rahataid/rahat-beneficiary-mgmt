import { Controller, Post, Body } from '@nestjs/common';
import { LogService } from './log.service';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post()
  async addLog(
    @Body()
    logData: {
      userUUID: string;
      action: string;
      data?: Record<string, any>;
    },
  ) {
    return this.logService.addLog(
      logData.userUUID,
      logData.action,
      logData.data,
    );
  }
}
