import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

export default function useFCM(onMessage) {
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    // Request permissions on iOS
    messaging().requestPermission().then(authStatus => {
      if (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      ) {
        getToken();
      }
    });

    // Get token on Android
    if (Platform.OS === 'android') {
      getToken();
    }

    // Listen for foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (onMessage) onMessage(remoteMessage);
      Alert.alert(remoteMessage.notification?.title, remoteMessage.notification?.body);
    });

    // Listen for token refresh
    const tokenRefreshUnsubscribe = messaging().onTokenRefresh(token => {
      setFcmToken(token);
    });

    return () => {
      unsubscribe();
      tokenRefreshUnsubscribe();
    };
  }, []);

  const getToken = async () => {
    const token = await messaging().getToken();
    setFcmToken(token);
    // TODO: Send token to your backend if needed
  };

  return fcmToken;
}