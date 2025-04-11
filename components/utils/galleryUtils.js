import * as ImagePicker from 'expo-image-picker';

/**
 * Opens the image gallery allowing the user to select an image.
 *
 * @async
 * @function openGallery
 * @description[uk] Відкриває галерею зображень для вибору фото
 * @returns {Promise<void>}
 */
export const openGallery = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    throw new Error('Permission to access media library is required!');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }
  return result.assets[0].uri;
};
