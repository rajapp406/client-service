import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';

export interface ResponseOptions {
  statusCode?: HttpStatus;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ResponseUtil {
  static success<T>(
    data: T,
    message = 'Operation successful',
    options: ResponseOptions = {}
  ): ApiResponse<T> {
    const { meta, statusCode = HttpStatus.OK } = options;
    
    return  {
      success: true,
      message,
      data,
      ...(meta && { meta }),
      statusCode,
    };
  }

  static error(
    message: string,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, any>,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
  ): ApiResponse<null> {
    return {
      success: false,
      message,
      error: { code, details },
      statusCode,
    };
  }

  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Data retrieved successfully',
    statusCode: HttpStatus = HttpStatus.OK
  ): ApiResponse<T[]> {
    return {
      success: true,
      message,
      data: items,
      meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      statusCode,
    };
  }
}
