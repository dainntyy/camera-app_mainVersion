import * as MediaLibrary from 'expo-media-library';
import { takePicture } from '../utils/cameraUtils';

jest.mock('expo-media-library', () => ({
  saveToLibraryAsync: jest.fn(),
}));

describe('takePicture', () => {
  const mockCameraRef = {
    current: {
      takePictureAsync: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should take a picture and save it to the library', async () => {
    const mockUri = 'test-uri';
    (mockCameraRef.current.takePictureAsync as jest.Mock).mockResolvedValueOnce({ uri: mockUri });
    (MediaLibrary.saveToLibraryAsync as jest.Mock).mockResolvedValueOnce({ uri: mockUri });

    await takePicture(mockCameraRef, false); // Виклик для задньої камери
    expect(mockCameraRef.current.takePictureAsync).toHaveBeenCalled();
    expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalledWith(mockUri);
  });

  it('should take a picture and handle flipping for front camera', async () => {
    const mockUri = 'test-uri';
    const flippedUri = 'flipped-uri'; // Мок для віддзеркаленого URI (після обробки)

    (mockCameraRef.current.takePictureAsync as jest.Mock).mockResolvedValueOnce({ uri: mockUri });

    // Якщо використовуватиметься специфічний метод для перевертання, потрібно буде мокаємо його
    // Тут можна вказати логіку перевертання URI, якщо вона імплементована.
    (MediaLibrary.saveToLibraryAsync as jest.Mock).mockResolvedValueOnce({ uri: flippedUri });

    await takePicture(mockCameraRef, true); // Виклик для фронтальної камери
    expect(mockCameraRef.current.takePictureAsync).toHaveBeenCalled();
    expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalledWith(mockUri);
  });
});
