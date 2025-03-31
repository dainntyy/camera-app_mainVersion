import * as MediaLibrary from 'expo-media-library';
import { PixelRatio, Dimensions, ImageEditor } from 'react-native';

export const takePicture = async (cameraRef, isFrontCamera) => {
  if (!cameraRef.current) {
    throw new Error('Camera reference is not available.');
  }

  // Отримання зображення з камери
  const photo = await cameraRef.current.takePictureAsync({
    quality: 1,
    skipProcessing: false, // Перевірка на сумісність із вашою камерою
  });

  let finalUri = photo.uri;

  // Імітація перевертання зображення для фронтальної камери (з використанням ImageEditor, якщо це потрібно)
  if (isFrontCamera) {
    const screenWidth = Dimensions.get('window').width * PixelRatio.get();
    const screenHeight = Dimensions.get('window').height * PixelRatio.get();

    try {
      const flippedImage = await ImageEditor.cropImage(finalUri, {
        offset: { x: 0, y: 0 },
        size: { width: screenWidth, height: screenHeight },
        displaySize: { width: screenWidth, height: screenHeight },
        resizeMode: 'contain',
      });

      finalUri = flippedImage;
    } catch (err) {
      console.error('Error flipping image:', err);
    }
  }

  // Збереження фото в бібліотеку
  await MediaLibrary.saveToLibraryAsync(finalUri);
  return finalUri;
};
