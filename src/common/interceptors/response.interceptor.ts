import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseUtil } from '../utils/response.util';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.path;

    // Optionally skip docs/health endpoints
    if (path.includes('health') || path.includes('docs')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // If already in standardized format, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        // Handle paginated responses (if controller returns {items, meta})
        if (data && Array.isArray(data.items) && data.meta) {
          return ResponseUtil.paginated(
            data.items,
            data.meta.total,
            data.meta.page,
            data.meta.limit,
            data.message || 'Data retrieved successfully'
          );
        }
        // Standard success response
        return ResponseUtil.success(data);
      })
    );
  }
}
