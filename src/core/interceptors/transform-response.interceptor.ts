/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Document } from 'mongoose';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const dataToFormat = data?.data || data;

        let finalData: any;

        if (Array.isArray(dataToFormat)) {
          finalData = dataToFormat.map((item) => (item instanceof Document ? item.toJSON() : item));
        } else {
          finalData = dataToFormat instanceof Document ? dataToFormat.toJSON() : dataToFormat;
        }
        return {
          success: true,
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: data?.message || '',
          data: finalData,
          totalRow: data?.totalRow || 0,
        };
      }),
    );
  }
}
