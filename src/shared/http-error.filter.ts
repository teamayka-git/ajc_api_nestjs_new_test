import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { execFile } from 'child_process';
@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    var exceptionResponse = JSON.parse(JSON.stringify(exception));

    var status = 500;
    if (exceptionResponse.hasOwnProperty('status')) {
      status = exceptionResponse.status;
    }

    var reasonString = 'nil';
    if (exceptionResponse.hasOwnProperty('response')) {
      reasonString = exceptionResponse.response.message;
    }

var message:String=exception.message || null



    const errorResponse = {
      code: status,
      timestamp: new Date().toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
      path: request.url,
      method: request.method,
      message: message,

      reason: reasonString,
      //    reason:"nil"
    };
    console.log('API ERROR  - ' + JSON.stringify(errorResponse));
    response
      .status(status)
      .json({ message: message, data: errorResponse });
  }
}
