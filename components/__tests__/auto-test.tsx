import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ReferenceImageScreen from '../ReferenceImageScreen';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';

// Mocking MediaLibrary
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getAssetsAsync: jest.fn(() =>
    Promise.resolve({
      assets: [{ uri: 'mockUri', id: '1' }], // Mock gallery images
    })
  ),
  getAssetInfoAsync: jest.fn(() =>
    Promise.resolve({
      localUri: 'mockLocalUri', // Mock detailed asset information
    })
  ),
}));

// Mocking useNavigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('ReferenceImageScreen Integration Tests', () => {
  const navigateMock = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock navigation
    useNavigation.mockReturnValue({ navigate: navigateMock });

    // Mock MediaLibrary functions
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (MediaLibrary.getAssetsAsync as jest.Mock).mockResolvedValue({
      assets: [{ uri: 'mockUri', id: '1' }],
    });
    (MediaLibrary.getAssetInfoAsync as jest.Mock).mockResolvedValue({ localUri: 'mockLocalUri' });
  });

  test('Navigates to CameraScreen with selected image from gallery', async () => {
    const { getAllByTestId, getByText, findByTestId } = render(<ReferenceImageScreen />);

    // Wait for gallery images to load
    const galleryImage = await findByTestId('gallery-image-1'); // Replace with your specific test ID if set
    fireEvent.press(galleryImage);

    // Confirm selection
    const confirmButton = getByText('Confirm Selection');
    fireEvent.press(confirmButton);

    // Assert navigation was called
    expect(navigateMock).toHaveBeenCalledWith('Camera', { referencePhotoUri: 'mockLocalUri' });
  });
});
