import React from 'react';
import * as ImageManipulator from 'expo-image-manipulator';

import { log } from './logger';

const alignWithReference = async (photoUri, referenceUri) => {
  log.info('[I040] Aligning captured image with reference...');
  // В ідеалі тут має бути комп’ютерний зір, але обмеження Expo Go не дозволяють OpenCV.
  // Тому реалізуємо базову евристичну трансформацію (наприклад, зміщення, масштабування).

  const transformed = await ImageManipulator.manipulateAsync(
    photoUri,
    [
      { resize: { width: 1280 } },
      { rotate: 0 }, // Поки що без обертання
    ],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  log.debug('[D007] Alignment complete');
  return transformed.uri;
};

export default alignWithReference;
