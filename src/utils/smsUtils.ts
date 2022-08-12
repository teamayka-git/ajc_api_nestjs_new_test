import { GlobalConfig } from "src/config/global_config";

export class SmsUtils {
 async  sendSms(toNumber:String,smsContent:String)  {

  

    const twilioClient = require('twilio')(
      GlobalConfig().TWILIO_SMS_GATEWAY_ACCOUNT_SID,
      GlobalConfig().TWILIO_SMS_GATEWAY_AUTH_TOKEN,
    );

    var asdf = await twilioClient.messages.create({
      body: smsContent,
      messagingServiceSid: GlobalConfig().TWILIO_SMS_GATEWAY_SERVICE_SID,  
      to: '+91'+toNumber,
    });
    
  }

  
}
