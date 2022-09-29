import { GlobalConfig } from "src/config/global_config";
let fetch = require('node-fetch');
export class SmsUtils {
 async  sendSmsTwilio(toNumber:String,smsContent:String)  {
  try {

    const twilioClient = require('twilio')(
      GlobalConfig().TWILIO_SMS_GATEWAY_ACCOUNT_SID,
      GlobalConfig().TWILIO_SMS_GATEWAY_AUTH_TOKEN,
    );


    var asdf = await twilioClient.messages.create({
      body: smsContent,
      messagingServiceSid: GlobalConfig().TWILIO_SMS_GATEWAY_SERVICE_SID,  
      to: '+91'+toNumber,
    });
  } catch (error) {

    console.log("Sms gateway error "+JSON.stringify(error));
  }
  }

  async  sendSmsSMSBits(toNumber:String,otp:String)  {
    fetch(`https://app.smsbits.in/api/web?id=OTk5NTg0Mzk4NQ&senderid=AJCAST&to=${toNumber}&msg=Dear abc, you OTP is ${otp}. Thank you for using our service by CNTSMS&port=TA&dltid=9995843985&tempid=1707161960458377485`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: '{}'
    }).then(response => {
      console.log(response);
    }).catch(err => {console.log(err);});
  }
  
}
