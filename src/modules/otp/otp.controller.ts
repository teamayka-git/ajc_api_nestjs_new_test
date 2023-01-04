import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateGeneralOtp, CreateOtp } from './otp.dto';
import { OtpService } from './otp.service';

@ApiTags("OTP Docs") 
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}


  @Post("createOtp")
  create(@Body() dto: CreateOtp) {
    return this.otpService.create(dto);
  }

  @Post("createOtpGeneral")
  createOtpGeneral(@Body() dto: CreateGeneralOtp) {
    return this.otpService.createOtpGeneral(dto);
  }



}
