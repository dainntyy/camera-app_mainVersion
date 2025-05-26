import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import i18n from './i18n';

export async function initializeI18n() {
  const saved = await AsyncStorage.getItem('appLanguage');
  const lang = saved || Localization.getLocales()[0].languageCode || 'en';
  i18n.locale = lang;
  return lang; // ← ПОВЕРТАЄМО встановлену мову
}
