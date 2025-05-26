import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import PropTypes from 'prop-types';
import i18n from './utils/i18n';

function IntroSlider({ onDone }) {
  const slides = [
    {
      key: '1',
      title: i18n.t('slide1_title'),
      text: i18n.t('slide1_text'),
      backgroundColor: '#083e68',
    },
    {
      key: '2',
      title: i18n.t('slide2_title'),
      text: i18n.t('slide2_text'),
      backgroundColor: '#114f7e',
    },
    {
      key: '3',
      title: i18n.t('slide3_title'),
      text: i18n.t('slide3_text'),
      backgroundColor: '#1363a0',
    },
    {
      key: '4',
      title: i18n.t('slide4_title'),
      text: i18n.t('slide4_text'),
      backgroundColor: '#2c71a5',
    },
  ];

  const handleDone = () => {
    if (onDone) {
      onDone();
    }
  };

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={handleDone}
      showSkipButton={true}
      onSkip={handleDone}
    />
  );
}

IntroSlider.propTypes = {
  onDone: PropTypes.func.isRequired,
};

const renderItem = ({ item }) => (
  <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.text}>{item.text}</Text>
  </View>
);

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
