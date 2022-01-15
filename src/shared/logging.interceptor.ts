import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const req=context.switchToHttp().getRequest();
    const method=req.method;
    const url=req.url;
    const now=Date.now();

    
    return next
      .handle()
      .pipe(
        tap(() => console.log(new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit',hour: '2-digit',minute: '2-digit',second: '2-digit',hour12:true }),context.getClass().name,`- status:${response.statusCode} - ${method} ${url} ${Date.now()-now}ms`)),
      );
  }
}