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

  async  sendSmsSMSBits(toNumber:String,otp:String,userName:String)  {
    fetch(
      
      // `https://app.smsbits.in/api/web?id=OTk5NTg0Mzk4NQ&senderid=AJCAST&to=${toNumber}&msg=Dear ${userName}, you OTP is ${otp}. Thank you for using our service by CNTSMS&port=TA&dltid=9995843985&tempid=1707161960458377485`
      `https://app.smsbits.in/api/web?id=OTQwMDI1MjMwMg&senderid=SMSBIT&to=${toNumber}&msg=Dear ${userName},this is your ${otp} --- to login the user account. SMSBIT&port=TA&dltid=9400252302&tempid=1707168836463685702`
    
    
    
      , {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: '{}'
    }).then(response => {
     // console.log(response);
    }).catch(err => {
     // console.log(err);
    });
  }
  
}
