import * as ImagePicker from 'expo-image-picker';

/**
 *
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
