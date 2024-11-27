import * as ImagePicker from 'expo-image-picker';
import { openGallery } from '../utils/galleryUtils';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

describe('openGallery', () => {
  beforeEach(() => {
    // Скидаємо всі моки перед кожним тестом
    jest.clearAllMocks();
  });

  it('should throw an error if permission is denied', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false });

    await expect(openGallery()).rejects.toThrow("Permission to access media library is required!");
  });

  it('should return null if the user cancels', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: true });

    const result = await openGallery();
    expect(result).toBeNull();
  });

  it('should return the URI of the selected image', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'test-uri' }],
    });

    const result = await openGallery();
    expect(result).toBe('test-uri');
  });
});
