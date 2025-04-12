import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from '../../components/CameraScreen'; // Adjust the import path as necessary
import IntroSlider from '../../components/IntroSlider'; // Додай шлях до IntroSlider
import ReferenceImageScreen from '../../components/ReferenceImageScreen'; // Import your new screen

const Stack = createStackNavigator();

export default function App() {
  const [firstLaunch, setFirstLaunch] = useState(true); // Стан для контролю показу слайдера

  const handleIntroDone = () => {
    setFirstLaunch(false); // Після завершення слайдера змінюємо стан
  };

  return (
    <>
      <Stack.Navigator initialRouteName={firstLaunch ? "IntroSlider" : "Camera"}>
        {firstLaunch && (
          <Stack.Screen 
            name="IntroSlider" 
            options={{ headerShown: false }} 
          >
            {(props) => <IntroSlider {...props} onDone={handleIntroDone} />}
          </Stack.Screen>
        )}
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen} 
          options={{ title: 'Camera', headerShown: false }} 
        />
        <Stack.Screen 
          name="ReferenceImageScreen" // Add this screen to the stack
          component={ReferenceImageScreen} // ReferenceImageScreen component
          options={{ title: 'Select Reference Image', headerShown: true }}
        />
      </Stack.Navigator>
    </>
  );
}
