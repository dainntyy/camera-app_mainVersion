/**
 * @file CameraScreen.js
 *
 * @description
 * CameraScreen is the main component that manages photo capture,
 * camera switching, flash toggling, overlaying a reference image, and gallery access.
 *
 * == Architecture ==
 * - The camera is implemented via the `CameraView` component from the expo-camera library.
 * - The photo is stored via the Expo MediaLibrary.
 * - The reference image is an overlay image that helps the user align the shot.
 * - The interface is built using standard React Native components.
 *
 * == Business logic ==
 * - If the user has enabled the reference image, it is superimposed on top of the camera with the specified transparency.
 * - The photo is mirrored only in the case of the front camera.
 * - The gallery shows the last saved photo.
 *
 * == Heavy algorithms ==
 * - Automatic determination of the path to the last photo, taking into account different URIs (for example, `ph://` on iOS).
 * - Image manipulation (mirroring) using `ImageManipulator` only in the case of the front camera.
 *
 * == Component Interaction ==
 * - Camera state (type, flash, last photo) is controlled via React useState/useEffect.
 * - Other screens interact via `React Navigation`, for example, to select a reference image.
 * - The camera is called via ref: `cameraRef.current.takePictureAsync()`.
 *
 * == Additional ==
 * - JSDoc is used to document each function.
 * - Test IDs for E2E tests are supported (`testID` on buttons).
 *
 * @description[uk] CameraScreen є основним компонентом, який керує фотозйомкою, перемиканням камери, перемиканням спалаху, накладанням контрольного зображення та доступом до галереї.
 * == Архітектура ==
 * - Камера реалізована через компонент `CameraView` з бібліотеки expo-camera.
 * - Фото зберігається через Expo MediaLibrary.
 * - Референсне зображення — накладене зображення, яке допомагає користувачеві вирівняти знімок.
 * - Інтерфейс побудований з використанням стандартних React Native компонентів.
 *
 * == Бізнес-логіка ==
 * - Якщо користувач увімкнув референсне зображення, воно накладається поверх камери з заданою прозорістю.
 * - Фото дзеркально відображається лише у випадку фронтальної камери.
 * - Галерея показує останнє збережене фото.
 *
 * == Важкі алгоритми ==
 * - Автоматичне визначення шляху до останнього фото, з урахуванням різних URI (наприклад, `ph://` на iOS).
 * - Маніпуляція зображенням (дзеркальне відображення) з використанням `ImageManipulator` тільки якщо фронтальна камера.
 *
 * == Взаємодія компонентів ==
 * - Стейт камери (тип, спалах, останнє фото) керується через React useState/useEffect.
 * - Інші екрани взаємодіють через `React Navigation`, наприклад, для вибору референсного зображення.
 * - Камера викликається через реф: `cameraRef.current.takePictureAsync()`.
 *
 * == Додатково ==
 * - Використовується JSDoc для документації кожної функції.
 * - Підтримуються тестові ID для E2E тестів (`testID` на кнопках).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text, Dimensions } from 'react-native';
import { CameraView } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import PropTypes from 'prop-types';
import Slider from '@react-native-community/slider';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import flipCameraIcon from './icons/flip_camera.png';
import FlashOnIcon from './icons/flash_icon.png';
import FlashOffIcon from './icons/flash_off.png';
import RefIcon from './icons/ref_icon.png';
import RefOffIcon from './icons/ref_off_icon.png';
import log from './utils/logger';
import { logToFile, rotateLogsIfNeeded, readLogFile } from './utils/logger';
import i18n from './utils/i18n';

const getContextInfo = async (screen, functionName) => {
  return {
    screen,
    function: functionName,
    platform: Platform.OS,
    appVersion: Constants.expoConfig.version,
    timestamp: new Date().toISOString(),
  };
};

/**
 * CameraScreen is a React component that provides a custom camera interface
 * with support for flash, switching cameras, overlays, and saving photos
 *
 * @description[uk] React-компонент, що надає інтерфейс камери з підтримкою спалаху, перемикання камер, накладання зображень та збереження фото
 * @param {object} props - Component props
 * @param {object} props.route - React Navigation route object
 * @param {object} props.route.params - Parameters passed to this screen
 * @param {string} [props.route.params.referencePhotoUri] - URI of the reference image to overlay
 * @returns {React.ReactElement}
 */
function CameraScreen({ route }) {
  const navigation = useNavigation();
  const [type, setType] = useState('back'); // Резервне значення 'back'
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState('off');
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [lastPhotoUri, setLastPhotoUri] = useState(null);
  const [referencePhoto, setReferencePhoto] = useState(route.params?.referencePhotoUri || null);
  const [isFrontCamera, setIsFrontCamera] = useState(type === 'front');
  const [opacity, setOpacity] = useState(0.3);
  const cameraRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const generateErrorId = () => `ERR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  let errorId;
  useEffect(() => {
    logToFile('[TEST] This log will create logs.txt');
  }, []);

  useEffect(() => {
    log.info('[I001] App launched: CameraScreen mounted');
    log.debug(`[D001] Initial camera type: ${type}`);
    return () => log.info('[I002] App stopped: CameraScreen unmounted');
  }, [type]);

  useEffect(() => {
    log.debug('[D002] Getting window dimensions');
    const { width, height } = Dimensions.get('window');
    setWindowWidth(width);
    setWindowHeight(height);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.referencePhotoUri) {
        log.info('[I010] Reference photo updated from route');
        setReferencePhoto(route.params.referencePhotoUri);
      }
    }, [route.params?.referencePhotoUri])
  );

  useEffect(() => {
    /**
     * Requests camera and media library permissions and retrieves the most recent photo.
     *
     * @async
     * @description[uk] Запитує дозволи для камери та медіатеки та отримує останнє фото
     * @returns {Promise<void>}
     */
    const getPermissionsAndAssets = async () => {
      log.info('[I020] Checking permissions');
      if (!permission?.granted) {
        log.warn('[W001] Camera permission not granted, requesting...');
        const newPermission = await requestPermission();
        if (!newPermission.granted) {
          errorId = generateErrorId();
          const context = await getContextInfo('CameraScreen', 'getPermissionsAndAssets');
          log.error(`[${errorId}] Camera permission denied by user`, context);
          rotateLogsIfNeeded();
          logToFile(
            `[ERROR] [${errorId}] Camera permission denied by user: ${JSON.stringify(context)}`
          );
          Alert.alert(i18n.t('error_title'), i18n.t('permission_camera'), [
            { text: i18n.t('alert_ok') },
          ]);
          return;
        }
        log.info('[I021] Camera permission granted');
      }

      if (!mediaLibraryPermission?.granted) {
        log.warn('[W002] Media Library permission not granted, requesting...');
        const newMediaPermission = await requestMediaLibraryPermission();
        if (!newMediaPermission.granted) {
          errorId = generateErrorId();
          const context = await getContextInfo('CameraScreen', 'getPermissionsAndAssets');
          log.error(`[${errorId}] Media Library permission denied by user`, context);
          rotateLogsIfNeeded();
          logToFile(
            `[ERROR] [${errorId}]  Media Library permission denied by user: ${JSON.stringify(context)}`
          );
          Alert.alert(i18n.t('error_title'), i18n.t('permission_library'), [
            { text: i18n.t('alert_ok') },
          ]);
          return;
        }
        log.info('[I022] Media Library permission granted');
      }
      log.debug('[D003] Fetching latest photo from Media Library');
      const media = await MediaLibrary.getAssetsAsync({
        sortBy: MediaLibrary.SortBy.creationTime,
        mediaType: 'photo',
        first: 1,
      });

      if (media.assets.length > 0) {
        const lastAsset = media.assets[0];

        if (lastAsset.uri.startsWith('ph://')) {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(lastAsset.id);
          if (assetInfo.localUri) {
            setLastPhotoUri(assetInfo.localUri);
          }
        } else {
          setLastPhotoUri(lastAsset.uri);
          log.info('[I024] Last photo loaded from Media Library');
        }
      } else {
        log.info('[I025] No photos found in Media Library');
      }
    };

    getPermissionsAndAssets();
  }, [permission, mediaLibraryPermission]);

  useEffect(() => {
    setIsFrontCamera(type === 'front');
  }, [type]);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // TODO: Remove inline styles

  if (!mediaLibraryPermission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to access media library</Text>
        <TouchableOpacity onPress={requestMediaLibraryPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Media Library Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Captures a photo using the camera and optionally mirrors it if using the front camera.
   *
   * @async
   * @function takePicture
   * @description[uk] Робить фото за допомогою камери та при необхідності віддзеркалює його для фронтальної камери
   * @returns {Promise<void>}
   */
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        log.info('[I030] Taking picture...');
        const photo = await cameraRef.current.takePictureAsync();
        let finalUri = photo.uri;

        if (type === 'front') {
          log.debug('[D004] Using front camera, applying mirror flip');
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            photo.uri,
            [{ flip: ImageManipulator.FlipType.Horizontal }],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
          );
          finalUri = manipulatedImage.uri;
        }

        setPhotoUri(finalUri);
        const asset = await MediaLibrary.createAssetAsync(finalUri);
        await MediaLibrary.createAlbumAsync('MyApp', asset, false);
        setLastPhotoUri(finalUri);
        log.info('[I031] Photo captured and saved to Media Library');
      } catch (error) {
        errorId = generateErrorId();
        log.error(`[${errorId}] Error taking picture:`, {
          message: error.message,
          screen: 'CamerScreen',
          stack: error.stack,
        });
        rotateLogsIfNeeded();
        logToFile(
          `[ERROR] [${errorId}]  Error taking picture: ${JSON.stringify({
            message: error.message,
            screen: 'CamerScreen',
            stack: error.stack,
          })}`
        );
        Alert.alert(i18n.t('error_title'), i18n.t('error_take_photo'), [
          { text: i18n.t('alert_ok') },
          {
            text: i18n.t('alert_report'),
            onPress: () => {
              logToFile(`[REPORT] User reported error ID ${errorId}`);
            },
          },
        ]);
      }
    }
  };

  /**
   * Navigates to the reference image selection screen.
   *
   * @function pickReferenceImage
   * @description[uk] Переходить на екран вибору референтного зображення
   * @returns {void}
   */
  const pickReferenceImage = () => {
    navigation.navigate('ReferenceImageScreen');
  };

  /**
   * Clears the currently set reference photo.
   *
   * @function clearReferencePhoto
   * @description[uk] Очищає поточне референтне зображення
   * @returns {void}
   */
  const clearReferencePhoto = () => {
    setReferencePhoto(null);
  };

  /**
   * Opens the image gallery allowing the user to select an image.
   *
   * @async
   * @function openGallery
   * @description[uk] Відкриває галерею зображень для вибору фото
   * @returns {Promise<void>}
   */
  const openGallery = async () => {
    try {
      log.info('[I040] Opening image gallery');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        const warningMsg = '[W003] Gallery permission denied';
        log.warn(warningMsg);
        Alert.alert(i18n.t('error_title'), i18n.t('permission_library'), [
          { text: i18n.t('alert_ok') },
        ]);

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (!result.canceled) {
        log.info('[I041] Image selected from gallery:', result.assets[0].uri);
      } else {
        log.info('[I042] Gallery image selection canceled');
      }
    } catch (error) {
      errorId = generateErrorId();
      log.error(`[E004] Error picking image:`, {
        message: error.message,
        screen: 'CameraScreen',
        stack: error.stack,
      });
      rotateLogsIfNeeded();
      logToFile(
        `[ERROR] [${errorId}]  Error picking image: ${JSON.stringify({
          message: error.message,
          screen: 'CamerScreen',
          stack: error.stack,
        })}`
      );
      Alert.alert(i18n.t('error_title'), i18n.t('error_pick_image'), [
        { text: i18n.t('alert_ok') },
        {
          text: i18n.t('alert_report'),
          onPress: () => {
            logToFile(`[REPORT] User reported gallery error ID ${errorId}`);
          },
        },
      ]);

    }
  };

  /**
   * Toggles between front and back cameras.
   *
   * @function toggleCameraType
   * @description[uk] Перемикає між фронтальною та основною камерами
   * @returns {void}
   */
  function toggleCameraType() {
    setType(current => (current === 'back' ? 'front' : 'back'));
  }

  /**
   * Cycles through flash modes: off → on → auto → off.
   *
   * @function toggleFlash
   * @description[uk] Змінює режими спалаху: вимкнено → увімкнено → авто → вимкнено
   * @returns {void}
   */
  function toggleFlash() {
    setFlashMode(prevFlashMode => {
      switch (prevFlashMode) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        default:
          return 'off';
      }
    });
  }

  CameraScreen.propTypes = {
    route: PropTypes.shape({
      params: PropTypes.shape({
        referencePhotoUri: PropTypes.string,
      }),
    }).isRequired,
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={type} ref={cameraRef} flash={flashMode}>
        <View style={styles.overlayContainer}>
          {referencePhoto ? (
            <Image
              source={{ uri: referencePhoto }}
              style={[
                styles.overlayImage,
                {
                  opacity: opacity,
                  width: windowWidth,
                  height: windowHeight,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
              ]}
            />
          ) : null}
        </View>
        <View style={styles.header} />
        <View style={styles.topControls}>
          <TouchableOpacity
            testID="toggle-camera-button"
            onPress={toggleCameraType}
            style={styles.iconButton}
            accessibilityLabel="Toggle camera"
          >
            <Image
              source={flipCameraIcon}
              style={styles.iconImage}
              accessible={false} // Image is decorative; label provided on TouchableOpacity
            />
          </TouchableOpacity>
          <TouchableOpacity
            testID="toggle-flash-button"
            onPress={toggleFlash}
            style={styles.iconButton}
            accessibilityLabel={`Flash ${flashMode === 'off' ? 'off' : 'on'}`}
          >
            <Image
              source={flashMode === 'off' ? FlashOffIcon : FlashOnIcon}
              style={styles.iconImage}
              accessible={false} // Image is decorative; label provided on TouchableOpacity
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={clearReferencePhoto}
            style={styles.iconButton}
            accessibilityLabel="Clear reference photo"
          >
            <Image
              source={RefOffIcon}
              style={styles.iconImage}
              accessible={false} // Image is decorative; label provided on TouchableOpacity
            />
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={async () => {
              const error = new Error('💥 TEST_PERMISSION_DENIED_SIMULATION');
              const errorId = `ERR_${Date.now()}`;
              const context = await getContextInfo('CameraScreen', 'simulatePermission');

              log.error(`[${errorId}] Permission error test`, context);
              logToFile(`[ERROR] [${errorId}] Permission error test: ${JSON.stringify(context)}`);
              Alert.alert('Simulated Permission Error', 'This is just a test.');
              readLogFile();
            }}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Simulate Permission Error</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.bottomControlsContainer}>
          <View style={styles.bottomControls}>
            <TouchableOpacity
              onPress={pickReferenceImage}
              style={styles.iconButton}
              accessibilityLabel="Select reference photo"
            >
              <Image source={RefIcon} style={styles.iconImage} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="capture-button"
              onPress={takePicture}
              style={styles.captureButton}
              accessibilityLabel="Capture photo"
            >
              <View style={styles.captureCircle} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="open-gallery-button"
              onPress={openGallery}
              style={styles.iconButton}
              accessibilityLabel="Open Galery"
            >
              {lastPhotoUri ? (
                <Image source={{ uri: lastPhotoUri }} style={styles.galleryImage} />
              ) : (
                <Text style={styles.iconPlaceholder}>Gallery</Text>
              )}
            </TouchableOpacity>
          </View>
          {referencePhoto && (
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Opacity</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={opacity}
                onValueChange={setOpacity}
              />
            </View>
          )}
          <View style={styles.footer} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlayImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  header: {
    top: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 100,
  },
  topControls: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  footer: {
    ...StyleSheet.absoluteFillObject, // Зробити фон абсолютним в межах контейнера
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Напівпрозорий фон
    zIndex: -1,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    position: 'absolute', // Позиціонування кнопок поверх фону
    bottom: 30,
  },
  iconButton: {
    padding: 10,
  },
  captureButton: {
    alignSelf: 'center',
  },
  captureCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'gray',
  },
  galleryImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  iconPlaceholder: {
    fontSize: 12,
    color: 'white',
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  permissionButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    bottom: 100,
  },
  sliderLabel: {
    color: 'white',
    marginBottom: 5,
  },
  slider: {
    width: '80%',
  },
});

export default CameraScreen;
