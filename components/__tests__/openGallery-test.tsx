import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CameraScreen from '../CameraScreen'; // Ваш компонент
import * as ImagePicker from 'expo-image-picker';

// Мокуємо функцію ImagePicker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

describe('CameraScreen openGallery', () => {
  it('should open gallery and set selected image URI', async () => {
    // Мокування результату відкриття галереї
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'selected-image-uri' }],
    });

    const route = { params: { referencePhotoUri: '../templatePictures/image1.jpeg' } };
    const { getByTestId } = render(<CameraScreen route={route} />);

    // Натискання на кнопку для відкриття галереї
    const openGalleryButton = getByTestId('open-gallery-button');
    fireEvent.press(openGalleryButton);

    // Очікуємо, поки URI зображення з'явиться
    await waitFor(() => {
      const imageUriText = getByTestId('image-uri');
      expect(imageUriText.props.children).toBe('selected-image-uri');
    });
  });

  it('should handle when the user cancels the picker', async () => {
    // Мокування результату скасування вибору
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: true });

    const route = { params: { referencePhotoUri: '../templatePictures/image1.jpeg' } };
    const { getByTestId } = render(<CameraScreen route={route} />);

    // Натискання на кнопку для відкриття галереї
    const openGalleryButton = getByTestId('open-gallery-button');
    fireEvent.press(openGalleryButton);

    // Перевірка, що URI не було оновлено
    await waitFor(() => {
      const imageUriText = getByTestId('image-uri');
      expect(imageUriText).toBeFalsy(); // URI не має бути встановлене
    });
  });

  it('should handle error during image picker', async () => {
    // Мокування помилки під час виклику ImagePicker
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValueOnce(new Error('Picker error'));

    const route = { params: { referencePhotoUri: '../templatePictures/image1.jpeg' } };
    const { getByTestId } = render(<CameraScreen route={route} />);

    // Натискання на кнопку для відкриття галереї
    const openGalleryButton = getByTestId('open-gallery-button');
    fireEvent.press(openGalleryButton);

    // Перевірка, чи оброблено помилку
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error picking image:', new Error('Picker error'));
    });
  });
});
