import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RedisIoAdapter } from './redis-io.adapter';
import { SocketStateService } from './socket-state.service';

export const initAdapters = (app: INestApplication): INestApplication => {
  const socketStateService = app.get(SocketStateService);
  const jwtService = app.get(JwtService);

  const redisIoAdapter = new RedisIoAdapter(app, socketStateService, jwtService);
  redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  return app;
};
