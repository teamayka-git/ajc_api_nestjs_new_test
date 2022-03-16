import * as nodemailer from 'nodemailer';

// export enum GlobalConfig {
// }
export const GlobalConfig = () => ({

  JWT_SECRET_KEY: String(process.env.JWT_SECRET_KEY),
  THUMB_SIZE: Number(process.env.THUMB_SIZE),
  PORT_CHAT_SOCKET: Number(process.env.PORT_CHAT_SOCKET),
  DUMMY_MONGODB_ID:"0000000F000F0F00000FFFF0",
  DEFAULT_EMAIL_TRANSPORTER: nodemailer.createTransport({
    service: process.env.DEFAULT_EMAIL_SERVICE, //smtp.gmail.com  //in place of service use host...
    secure: false, //true
    port: Number(process.env.DEFAULT_EMAIL_PORT), //465
    auth: {
      user: process.env.DEFAULT_EMAIL_ID,
      pass: process.env.DEFAULT_EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  }),
  
  RESPONSE_RESTRICT_DEFAULT_COUNT:1000,
  RESPONSE_RESTRICT_RESPONSE:"Response restrict count exceeded, ",
});


