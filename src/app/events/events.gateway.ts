/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/require-await */
import { Logger, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../../core/guards';
import { IAuthenticatedSocket } from '../adapters';

import { chatRoomKey, userRoomKey } from './enum';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  async handleConnection(client: IAuthenticatedSocket) {
    if (client?.auth?.userId) {
      await client.join(userRoomKey(client.auth.userId));
    }

    this.logger.log(`Client connected: ${client.id} | ${client.auth?.userId}`);
  }

  async handleDisconnect(client: IAuthenticatedSocket) {
    this.logger.log(
      `Client disconnected: ${client.id} | ${client.auth?.userId}`,
    );
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
