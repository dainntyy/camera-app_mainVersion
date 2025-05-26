/**
 * @file App.js
 * @description Entry point for the application. Handles navigation and determines whether to show onboarding.
 * @description[uk] Точка входу для програми. Керує навігацією та визначає, чи показувати підключення.
 */

import React, { useState, useEffect } from 'react';
import { initializeI18n } from '../components/utils/i18nInit';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as tf from '@tensorflow/tfjs';

import CameraScreen from '../components/CameraScreen';
import IntroSlider from '../components/IntroSlider';
import ReportBugScreen from '../components/ReportBugScreen';
import ReferenceImageScreen from '../components/ReferenceImageScreen';
import SettingsScreen from '../components/SettingsScreen';
import { log } from '../components/utils/logger';
import i18n from '../components/utils/i18n';

import '@tensorflow/tfjs-react-native';

const Stack = createStackNavigator();

/**
 * The main entry point of the application.
 *
 * This component manages the navigation flow of the app. On the first launch,
 * it displays an introductory slider. After that, it navigates directly to the camera screen.
 * The launch status is stored persistently using AsyncStorage.
 *
 * @component
 * @description[uk] Основна точка входу програми. Цей компонент керує процесом навігації програми. Під час першого запуску відображається вступний слайдер. Після цього він переходить безпосередньо на екран камери. Статус запуску постійно зберігається за допомогою AsyncStorage.
 * @returns {JSX.Element|null} The app's navigation container or null while checking launch state.
 */
function App() {
  const [firstLaunch, setFirstLaunch] = useState(true);
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initializeI18n(); // ← блокуємо, поки AsyncStorage не прочитається
      setLanguageReady(true); // після цього locale вже виставлено
    })();
  }, []);
  
  useEffect(() => {
    if (!languageReady) return;

    (async () => {
      const launched = await AsyncStorage.getItem('hasLaunched');
      if (launched === null) {
        setFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setFirstLaunch(false);
      }
    })();
  }, [languageReady]);

  if (!languageReady || firstLaunch === null) {
    return <View style={styles.splash} />;
  }

  useEffect(() => {
    async function prepare() {
      await tf.ready();
    }
    prepare();
  }, []);

  // useEffect(() => {
  //   const checkFirstLaunch = async () => {
  //     try {
  //       log.info('[I000] App started: Checking first launch');
  //       const hasLaunched = await AsyncStorage.getItem('hasLaunched');
  //       if (hasLaunched === null) {
  //         log.info('[I001] First launch detected');
  //         setFirstLaunch(true);
  //         await AsyncStorage.setItem('hasLaunched', 'true');
  //         log.debug('[D001] Flag hasLaunched set to true');
  //       } else {
  //         log.info('[I002] Not first launch');
  //         setFirstLaunch(false);
  //       }
  //     } catch (error) {
  //       log.error('[E000] Error checking first launch:', error);
  //     }
  //   };
  //   checkFirstLaunch();
  // }, []);

  if (firstLaunch === null) {
    log.debug('[D002] Launch state unknown, rendering null');
    return null;
  }

  return (
    <NavigationContainer
      onStateChange={state => {
        const currentRoute = state.routes[state.index]?.name;
        log.info(`[I010] Navigation to screen: ${currentRoute}`);
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {firstLaunch ? (
          <Stack.Screen name="IntroSlider">
            {props => (
              <IntroSlider
                key={i18n.locale}
                {...props}
                onDone={() => {
                  log.info('[I003] IntroSlider completed');
                  setFirstLaunch(false);
                }}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="CameraScreen" component={CameraScreen} />
        )}
        <Stack.Screen name="ReferenceImageScreen" component={ReferenceImageScreen} />
        <Stack.Screen
          name="ReportBugScreen"
          component={ReportBugScreen}
          options={{ title: 'Report a Bug' }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
