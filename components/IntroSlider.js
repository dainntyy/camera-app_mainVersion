import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const slides = [
  {
    key: '1',
    title: 'Welcome to Camera App!',
    text: 'This app helps you take photos with alignment features.',
    backgroundColor: '#59b2ab',
  },
  {
    key: '2',
    title: 'Select Reference Photo',
    text: 'You can select a reference photo from your gallery to overlay on the camera.',
    backgroundColor: '#febe29',
  },
  {
    key: '3',
    title: 'Use Camera Features',
    text: 'Flip between the front and back cameras, and enable/disable the flash.',
    backgroundColor: '#22bcb5',
  },
  {
    key: '4',
    title: 'Capture and Save',
    text: 'Take photos and save them to your gallery easily!',
    backgroundColor: '#3395ff',
  },
];

export default function IntroSlider({ onDone }) {
  const handleDone = () => {
    onDone(); // Викликаємо пропс для завершення слайдера
  };

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      onDone={handleDone}
      showSkipButton={true}
      onSkip={handleDone}
    />
  );
}

const renderItem = ({ item }) => {
  return (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
