import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeI18n } from '../../components/utils/i18nInit';

import CameraScreen from '../../components/CameraScreen';
import IntroSlider from '../../components/IntroSlider';
import ReportBugScreen from '../../components/ReportBugScreen';
import ReferenceImageScreen from '../../components/ReferenceImageScreen';
import SettingsScreen from '../../components/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
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
          setFirstLaunch(true);
        }
      })();
    }, [languageReady]);
  
  const [firstLaunch, setFirstLaunch] = useState<boolean | null>(true);

  // useEffect(() => {
  //   const checkFirstLaunch = async () => {
  //     const hasLaunched = await AsyncStorage.getItem('hasLaunched');
  //     if (hasLaunched === null) {
  //       setFirstLaunch(true);
  //       await AsyncStorage.setItem('hasLaunched', 'true');
  //     } else {
  //       setFirstLaunch(false);
  //     }
  //   };
  //   checkFirstLaunch();
  // }, []);

  // if (firstLaunch === null) return null;
  // setFirstLaunch(true);

  return (
    <Stack.Navigator initialRouteName={firstLaunch ? 'IntroSlider' : 'Camera'}>
      {firstLaunch && (
        <Stack.Screen
          name="IntroSlider"
          options={{ headerShown: false }}
        >
          {(props) => (
            <IntroSlider
              {...props}
              onDone={() => {
                setFirstLaunch(false);
              }}
            />
          )}
        </Stack.Screen>
      )}
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: 'Camera', headerShown: false }}
      />
      <Stack.Screen
        name="ReferenceImageScreen"
        component={ReferenceImageScreen}
        options={{ title: 'Select Reference Image', headerShown: true }}
      />
      <Stack.Screen
        name="ReportBugScreen"
        component={ReportBugScreen}
        options={{ title: 'Report a Bug' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}