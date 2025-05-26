import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import * as Updates from 'expo-updates';
import i18n from './utils/i18n';

const SettingsScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const navigation = useNavigation();

  // Завантажити мову при монтуванні
  useEffect(() => {
    (async () => {
      const lang = await AsyncStorage.getItem('appLanguage');
      const fallback = lang || 'en';
      setSelectedLanguage(fallback);
    })();
  }, []);

  /** Відкрити модалку підтвердження */
  const requestLanguageChange = lang => {
    if (lang === selectedLanguage) return; // Уже вибрана – нічого не робимо

    Alert.alert(
      i18n.t('confirm_restart_title'),
      i18n.t('confirm_restart_msg'),
      [
        {
          text: i18n.t('confirm_restart_cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('confirm_restart_ok'),
          onPress: () => applyLanguage(lang),
        },
      ],
      { cancelable: false }
    );
  };

  /** Підтверджено → змінюємо та перезапускаємо */
  const applyLanguage = async lang => {
    try {
      await AsyncStorage.setItem('appLanguage', lang);
      // i18n.locale = lang; // аби спливи одразу в модалках / toast
      // setSelectedLanguage(lang);
      await Updates.reloadAsync(); // перезавантаження
    } catch (e) {
      console.error('Language change failed', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('choose_language')}</Text>

      <TouchableOpacity
        style={[styles.button, selectedLanguage === 'en' && styles.selectedButton]}
        onPress={() => requestLanguageChange('en')}
      >
        <Text style={styles.buttonText}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, selectedLanguage === 'uk' && styles.selectedButton]}
        onPress={() => requestLanguageChange('uk')}
      >
        <Text style={styles.buttonText}>Українська</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{i18n.t('alert_cancel')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: 'white',
    marginBottom: 30,
  },
  button: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#444',
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#1e90ff',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  backButton: {
    marginTop: 30,
    padding: 10,
  },
  backText: {
    color: '#888',
  },
});
