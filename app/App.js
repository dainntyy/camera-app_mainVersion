/**
 * @file App.js
 * @description Entry point for the application. Handles navigation and determines whether to show onboarding.
 * @description[uk] Точка входу для програми. Керує навігацією та визначає, чи показувати підключення.
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Для збереження стану
import * as tf from '@tensorflow/tfjs';

import CameraScreen from '../components/CameraScreen';
import IntroSlider from '../components/IntroSlider';
import ReportBugScreen from '../components/ReportBugScreen';
import ReferenceImageScreen from '../components/ReferenceImageScreen'; // новий екран
import { log } from '../components/utils/logger';

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
  const [firstLaunch, setFirstLaunch] = useState(null); // Стан для перевірки, чи перший запуск

  useEffect(() => {
    /**
     *
     */
    async function prepare() {
      await tf.ready();
    }
    prepare();
  }, []);

  useEffect(() => {
    /**
     * Checks whether the app has been launched before by accessing AsyncStorage.
     * Sets the `firstLaunch` state accordingly.
     *
     * @async
     * @function checkFirstLaunch
     * @description[uk] Перевіряє, чи була програма раніше запущена за допомогою доступу до AsyncStorage. Відповідно встановлює стан `firstLaunch`.
     * @returns {Promise<void>}
     */
    const checkFirstLaunch = async () => {
      try {
        log.info('[I000] App started: Checking first launch');

        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          log.info('[I001] First launch detected');
          setFirstLaunch(true);
          await AsyncStorage.setItem('hasLaunched', 'true');
          log.debug('[D001] Flag hasLaunched set to true');
        } else {
          log.info('[I002] Not first launch');
          setFirstLaunch(false);
        }
      } catch (error) {
        log.error('[E000] Error checking first launch:', error);
      }
    };
    checkFirstLaunch();
  }, []);

  // Якщо стан still null, не рендеримо нічого, щоб уникнути помилки
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
          // Якщо це перший запуск, показуємо слайдер
          <Stack.Screen name="IntroSlider">
            {props => (
              <IntroSlider
                {...props}
                onDone={() => {
                  log.info('[I003] IntroSlider completed');
                  setFirstLaunch(false);
                }}
              />
            )}
          </Stack.Screen>
        ) : (
          // Показуємо екран камери після завершення слайдера
          <Stack.Screen name="CameraScreen" component={CameraScreen} />
        )}

        {/* Новий екран для вибору референсного зображення */}
        <Stack.Screen name="ReferenceImageScreen" component={ReferenceImageScreen} />
        <Stack.Screen
          name="ReportBugScreen"
          component={ReportBugScreen}
          options={{ title: 'Report a Bug' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
