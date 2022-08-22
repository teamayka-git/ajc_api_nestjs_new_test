import { GlobalConfig } from "src/config/global_config";

export class SmsUtils {
 async  sendSms(toNumber:String,smsContent:String)  {
  try {
  console.log("___a1 "+toNumber);

    const twilioClient = require('twilio')(
      GlobalConfig().TWILIO_SMS_GATEWAY_ACCOUNT_SID,
      GlobalConfig().TWILIO_SMS_GATEWAY_AUTH_TOKEN,
    );

    console.log("___a2");

    var asdf = await twilioClient.messages.create({
      body: smsContent,
      messagingServiceSid: GlobalConfig().TWILIO_SMS_GATEWAY_SERVICE_SID,  
      to: '+91'+toNumber,
    });
    console.log("___a3 "+JSON.stringify(asdf) );
  } catch (error) {

    console.log("Sms gateway error "+JSON.stringify(error));
  }
  }

  
}
