/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { INestApplicationContext, WebSocketAdapter } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import type { Server, ServerOptions, Socket } from 'socket.io';
import { User } from 'src/core/lib/database';

import { LoggerService } from '../../core/lib';
import type { SocketStateService } from './socket-state.service';

interface ITokenPayload {
  readonly userId: number;
  readonly username: string;
}

export interface IAuthenticatedSocket extends Socket {
  auth: ITokenPayload;
  data: User;
}

export class RedisIoAdapter extends IoAdapter implements WebSocketAdapter {
  private logger = new LoggerService(RedisIoAdapter.name);

  public constructor(
    private readonly app: INestApplicationContext,
    private readonly socketStateService: SocketStateService,
    private jwtService: JwtService,
  ) {
    super(app);
  }

  private adapterConstructor: ReturnType<typeof createAdapter>;

  connectToRedis(): void {
    const pubClient = createClient({ url: 'redis://localhost:6379' });
    const subClient = pubClient.duplicate();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);

    return server;
  }

  public create(port: number, options: ServerOptions): Server {
    const server = this.createIOServer(port, options);

    server.use((socket: IAuthenticatedSocket, next) => {
      const token = (socket.handshake.query?.token || socket.handshake.headers?.authorization) as string;

      if (!token) {
        socket.auth = null;

        // not authenticated connection is still valid
        // thus no error
        return next();
      }

      try {
        const decoded = this.jwtService.verify<{
          sub: number;
          username: string;
        }>(token, { secret: process.env.JWT_SECRET });

        socket.auth = {
          userId: decoded.sub,
          username: decoded.username,
        };

        return next();
      } catch (error) {
        setTimeout(() => {
          socket.disconnect(true);
        });

        return next(error);
      }
    });

    return server;
  }

  public bindClientConnect(server: Server, callback: Function): void {
    server.on('connection', async (socket: IAuthenticatedSocket) => {
      if (socket?.auth) {
        await this.socketStateService.add(socket.auth.userId, socket);

        socket.on('disconnect', async () => {
          await this.socketStateService.remove(socket.auth.userId, socket);

          socket.removeAllListeners('disconnect');
        });

        socket.on('disconnecting', (reason) => {
          this.logger.log(
            `Socket ${socket.id} ${
              socket?.auth?.userId ? ` | ${socket.auth.userId}` : ''
            } disconnecting because of ${reason}`,
          );

          socket.removeAllListeners('disconnecting');

          for (const room of socket.rooms) {
            socket.to(room).emit('user-disconnected', { userId: socket.auth.userId });
          }
        });
      }

      callback(socket);
    });
  }
}
