const { Expo } = require('expo-server-sdk');
const expo = new Expo();

exports.sendPush = async (toToken, message) => {
  if (!Expo.isExpoPushToken(toToken)) return;

  try {
    await expo.sendPushNotificationsAsync([{
      to: toToken,
      sound: 'default',
      title: 'Order Update',
      body: message,
    }]);
  } catch (error) {
    console.error('Push error:', error);
  }
};
