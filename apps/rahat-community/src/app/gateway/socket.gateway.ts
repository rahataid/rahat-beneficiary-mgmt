import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EVENTS } from '../../constants';

@WebSocketGateway({
  pingTimeout: 5000,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SocketGateway.name);

  constructor() {}
  @WebSocketServer()
  io: Server;

  afterInit() {
    this.logger.log('Websocket Initialized!');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client id: ${client.id} connected`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }

  @OnEvent(EVENTS.TARGETING_COMPLETED)
  async notifyTargeting(targetUuid: string) {
    this.logger.log(`targeting completed for ${targetUuid}`);
    this.io.emit('targeting-completed', targetUuid);
  }
}
