import { Injectable } from '@nestjs/common';
import type { Socket } from 'socket.io';

import { RedisService } from '../../core/lib';

@Injectable()
export class SocketStateService {
  private socketState = new Map<number, Socket[]>();

  constructor(private readonly redis: RedisService) {}

  async remove(userId: number, socket: Socket): Promise<boolean> {
    const existingSockets = this.socketState.get(userId);

    await this.redis.removeUserOnl(userId, socket.id);

    if (!existingSockets) {
      return true;
    }

    const sockets = existingSockets.filter((s) => s.id !== socket.id);

    if (sockets.length === 0) {
      this.socketState.delete(userId);
    } else {
      this.socketState.set(userId, sockets);
    }

    return true;
  }

  async add(userId: number, socket: Socket): Promise<boolean> {
    await this.redis.setUserOnline(userId, socket.id);

    const existingSockets = this.socketState.get(userId) || [];

    const sockets = [...existingSockets, socket];

    this.socketState.set(userId, sockets);

    await this.redis.getUserOnline();

    return true;
  }

  public get(userId: number): Socket[] {
    return this.socketState.get(userId) || [];
  }

  public getAll(): Socket[] {
    const all = [];

    for (const sockets of this.socketState) {
      all.push(sockets);
    }

    return all;
  }
}
