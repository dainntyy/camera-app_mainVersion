import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CameraScreen from '../CameraScreen';

describe('CameraScreen toggleFlash', () => {
    it('should toggle flash mode correctly', () => {
      const route = { params: { referencePhotoUri: '../templatePictures/image1.jpeg' } };
    const { getByTestId } = render(<CameraScreen route={route} />);
    const flashButton = getByTestId('flash-toggle-button'); // Передбачено, що flashButton має testID

    // Початковий стан flashMode
    expect(getByTestId('flash-mode').props.children).toBe('off');

    // Тест перемикання на "on"
    fireEvent.press(flashButton);
    expect(getByTestId('flash-mode').props.children).toBe('on');

    // Тест перемикання на "auto"
    fireEvent.press(flashButton);
    expect(getByTestId('flash-mode').props.children).toBe('auto');

    // Тест повернення до "off"
    fireEvent.press(flashButton);
    expect(getByTestId('flash-mode').props.children).toBe('off');
  });
});
