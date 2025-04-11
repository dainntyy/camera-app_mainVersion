/**
 * @file IntroSlider.js
 * @description Displays an onboarding slider for first-time users to explain the main features of the Camera App.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import PropTypes from 'prop-types'; // Додаємо імпорт PropTypes

/**
 * A list of slides used in the introductory slider.
 * Each slide contains a title, description text, and background color.
 * @type {Array<{ key: string, title: string, text: string, backgroundColor: string }>}
 */

const slides = [
  {
    key: '1',
    title: 'Welcome to Camera App!',
    text: 'This app helps you take photos with alignment features.',
    backgroundColor: '#083e68',
  },
  {
    key: '2',
    title: 'Select Reference Photo',
    text: 'You can select a reference photo from your gallery to overlay on the camera.',
    backgroundColor: '#114f7e',
  },
  {
    key: '3',
    title: 'Use Camera Features',
    text: 'Flip between the front and back cameras, and enable/disable the flash.',
    backgroundColor: '#1363a0',
  },
  {
    key: '4',
    title: 'Capture and Save',
    text: 'Take photos and save them to your gallery easily!',
    backgroundColor: '#2c71a5',
  },
];

/**
 * IntroSlider component – displays an introduction slider with usage instructions.
 *
 * @component
 * @param {object} props - Component props
 * @param {Function} props.onDone - Callback function triggered when the slider is finished
 * @returns {JSX.Element} The rendered intro slider component
 */

/**
 *
 * @param root0
 * @param root0.onDone
 */
function IntroSlider({ onDone }) {
  /**
   * Handles completion of the intro slider.
   * Calls the onDone prop function if provided.
   */
  const handleDone = () => {
    if (onDone) {
      onDone(); // Викликаємо пропс для завершення слайдера
    }
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

IntroSlider.propTypes = {
  onDone: PropTypes.func.isRequired, // Додаємо перевірку PropTypes
};

/**
 * Renders a single slide in the intro slider.
 *
 * @param {object} param
 * @param {{ title: string, text: string, backgroundColor: string }} param.item - Slide data
 * @returns {JSX.Element} Rendered slide content
 */
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

export default IntroSlider;
