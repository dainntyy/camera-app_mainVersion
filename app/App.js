import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from '../components/CameraScreen';
import IntroSlider from '../components/IntroSlider';
import ReferenceImageScreen from '../components/ReferenceImageScreen';  // новий екран
import AsyncStorage from '@react-native-async-storage/async-storage';  // Для збереження стану

const Stack = createStackNavigator();

export default function App() {
  const [firstLaunch, setFirstLaunch] = useState(null); // Стан для перевірки, чи перший запуск

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setFirstLaunch(false);
      }
    };

    checkFirstLaunch();
  }, []);

  // Якщо стан still null, не рендеримо нічого, щоб уникнути помилки
  if (firstLaunch === null) {
    return null; // Можна додати спінер або порожній екран
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {firstLaunch ? (
          // Якщо це перший запуск, показуємо слайдер
          <Stack.Screen name="IntroSlider">
            {props => <IntroSlider {...props} onDone={() => setFirstLaunch(false)} />}
          </Stack.Screen>
        ) : (
          // Показуємо екран камери після завершення слайдера
          <Stack.Screen name="CameraScreen" component={CameraScreen} />
        )}

        {/* Новий екран для вибору референсного зображення */}
        <Stack.Screen name="ReferenceImageScreen" component={ReferenceImageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
