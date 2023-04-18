import { GlobalConfig } from 'src/config/global_config';

const axios = require('axios');
export class FcmUtils {
  async sendFcm(title: String, body: String, fcmIds: String[], data: Object) {
    const headers = {
      Authorization: `key=${GlobalConfig().FIREBASE_FCM_SERVER_KEY}`,
    };
    while (fcmIds.length != 0) {
      var tempFcmIds = fcmIds.splice(0, 1000);
      var dataFinalObject = {
        registration_ids: tempFcmIds,
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
}
