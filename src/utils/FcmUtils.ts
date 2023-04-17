import { GlobalConfig } from 'src/config/global_config';

const axios = require('axios');
export class FcmUtils {
  async sendFcm(title: String, body: String, fcmIds: String[], data: Object) {
    const headers = {
      Authorization: `key=${GlobalConfig().FIREBASE_FCM_SERVER_KEY}`,
    };

    var dataFinalObject = {
      registration_ids: fcmIds,
      data: data,
      notification: {
        body: body,
        title: title,
      },
      priority: 'high',
    };

    var response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      dataFinalObject,
      { headers },
    );
 
  }
}
