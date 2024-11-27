import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CameraScreen from '../CameraScreen'; // Ваш компонент

describe('CameraScreen toggleCameraType', () => {
  it('should toggle camera type from back to front', () => {
    const route = { params: { referencePhotoUri: '../templatePictures/image1.jpeg' } };
    const { getByTestId } = render(<CameraScreen route={route} />);

    const toggleButton = getByTestId('toggle-camera-button');
    const cameraTypeText = getByTestId('camera-type');

    // Початковий тип камери - "back"
    expect(cameraTypeText.props.children).toBe('back');

    // Натискання кнопки для перемикання на "front"
    fireEvent.press(toggleButton);
    expect(cameraTypeText.props.children).toBe('front');

    // Натискання кнопки для перемикання назад на "back"
    fireEvent.press(toggleButton);
    expect(cameraTypeText.props.children).toBe('back');
  });
});
