import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CameraScreen from '../CameraScreen';
import * as MediaLibrary from 'expo-media-library';

jest.mock('expo-camera', () => ({
  Camera: jest.fn(() => null),
  CameraType: { back: 'back', front: 'front' },
}));
jest.mock('expo-media-library', () => ({
  saveToLibraryAsync: jest.fn(),
}));
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
}));

describe('CameraScreen', () => {
  it('should take a picture and save it', async () => {
    const route = { params: { referencePhotoUri: '../templatePictures/image1.jpeg' } };
    const { getByTestId } = render(<CameraScreen route={route} />);
    const takePictureButton = getByTestId('take-picture-button');

    fireEvent.press(takePictureButton);

    await waitFor(() => {
      expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalled();
    });
  });
});
