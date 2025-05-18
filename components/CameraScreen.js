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
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  Dimensions,
  TouchableHighlight,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
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
import * as FileSystem from 'expo-file-system';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

// import alignWithReference from './utils/imageAlignment';
import analyzeImage from './utils/analyzeImage';
// import log from './utils/logger';
import { logToFile, log, rotateLogsIfNeeded } from './utils/logger';
import i18n from './utils/i18n';
import CustomButton from './Button';
import ZoomControls from './ZoomControls';

/**
 * Gathers contextual information about the app and environment for logging or error reporting.
 *
 * @async
 * @function getContextInfo
 * @param {string} screen - The screen name where the function is called.
 * @param {string} functionName - The name of the function being executed.
 * @returns {Promise<object>} An object containing screen name, function name, platform, app version, and timestamp.
 */
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
  const [alignmentHint, setAlignmentHint] = useState('');
  const [alignmentHelpEnabled, setAlignmentHelpEnabled] = useState(false);
  const cameraRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  // states for buttons
  const [zoom, setZoom] = useState(0);
  const [showZoomControls, setShowZoomControls] = useState(false);

  /**
   * Generates random Error ID for reporting and documenting bugs
   * @constant generateErrorId
   * @returns {number}
   */
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
    return () => {
      if (photoUri?.startsWith(FileSystem.documentDirectory)) {
        FileSystem.deleteAsync(photoUri, { idempotent: true });
      }
      setPhotoUri(null);
    };
  }, []);

  /**
   * Toggles between front and back cameras.
   *
   * @function toggleCameraType
   * @description[uk] Перемикає між фронтальною та основною камерами
   * @returns {void}
   */
  const toggleCameraType = useCallback(
    debounce(() => {
      setType(current => (current === 'back' ? 'front' : 'back'));
    }, 300),
    []
  );

  /**
   * Cycles through flash modes: off → on → auto → off.
   *
   * @function toggleFlash
   * @description[uk] Змінює режими спалаху: вимкнено → увімкнено → авто → вимкнено
   * @returns {void}
   */
  const toggleFlash = useCallback(
    debounce(() => {
      setFlashMode(prevFlashMode => {
        switch (prevFlashMode) {
          case 'off':
            return 'on';
          default:
            return 'off';
        }
      });
    }, 300),
    []
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
      console.time('[PERF] loadLastPhoto');
      const start = Date.now();
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
        console.timeEnd('[PERF] loadLastPhoto');
        console.log(`[PERF] loadLastPhoto duration: ${Date.now() - start}ms`);
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
        <Text style={styles.premissionText}>We need your permission to access media library</Text>
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
    if (!cameraRef.current) return;

    console.time('[PERF] takePicture');
    const start = Date.now();
    let tempToDelete = null;

    try {
      log.info('[I030] Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        skipProcessing: true,
        quality: 0.9,
      });

      let finalUri = photo.uri;
      if (type === 'front') {
        log.debug('[D004] Using front camera, applying flip and resize...');
        const manipulated = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ flip: ImageManipulator.FlipType.Horizontal }, { resize: { width: 1280 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        finalUri = manipulated.uri;
        tempToDelete = photo.uri;
      }

      setPhotoUri(finalUri);

      const asset = await MediaLibrary.createAssetAsync(finalUri);
      const albumName = 'CameraApp';
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      setLastPhotoUri(finalUri);

      // 👉 Аналіз фото
      if (alignmentHelpEnabled && referencePhoto) {
        await maybeAnalyzeImage(finalUri, referencePhoto);
      }

      log.info('[I031] Photo saved to Media Library');
      console.log(`[PERF] takePicture duration: ${Date.now() - start}ms`);

      if (tempToDelete) {
        await FileSystem.deleteAsync(tempToDelete, { idempotent: true });
        log.debug(`[D006] Deleted temp file: ${tempToDelete}`);
      }
    } catch (error) {
      const errorId = generateErrorId();
      log.error(`[${errorId}] Error taking picture:`, {
        message: error.message,
        screen: 'CameraScreen',
        stack: error.stack,
      });
      rotateLogsIfNeeded();
      logToFile(
        `[ERROR] [${errorId}] ${JSON.stringify({ message: error.message, screen: 'CameraScreen', stack: error.stack })}`
      );

      Alert.alert(i18n.t('error_title'), i18n.t('error_take_photo'), [
        { text: i18n.t('alert_ok') },
        {
          text: i18n.t('alert_report'),
          /**
           * Logs a user-reported error message to a file.
           *
           * @function
           * @returns {void}
           */
          onPress: () => logToFile(`[REPORT] User reported error ID ${errorId}`),
        },
      ]);
    } finally {
      console.timeEnd('[PERF] takePicture');
    }
  };

  /**
   * Sends the captured image and reference image to an alignment analysis API,
   * and sets an appropriate hint for the user based on the result.
   *
   * @async
   * @function maybeAnalyzeImage
   * @param {string} finalUri - URI of the captured image to analyze.
   * @param {string|null} referencePhoto - URI of the reference image for alignment comparison.
   * @returns {Promise<void>} No return value; sets hint text and logs results.
   */
  const maybeAnalyzeImage = async (finalUri, referencePhoto) => {
    if (!alignmentHelpEnabled) return;

    if (referencePhoto) {
      try {
        console.log('[DEBUG] Calling analyzeImage with', finalUri, referencePhoto);
        const result = await analyzeImage(finalUri, referencePhoto);
        console.log('Alignment result:', result);
        let hint;

        if (result.confidence >= 0.85 && result.tip === '✅ Good alignment') {
          hint = '✅ Good alignment!';
        } else {
          switch (result.alignment) {
            case 'left':
              hint = '🔄 Move the camera to the left';
              break;
            case 'right':
              hint = '🔄 Move the camera to the right';
              break;
            case 'up':
              hint = '🔼 Tilt the camera up';
              break;
            case 'down':
              hint = '🔽 Tilt the camera down';
              break;
          }
        }
        setAlignmentHint(hint);
        // Автоматичне приховування підказки через 3 секунди
        setTimeout(() => setAlignmentHint(null), 3000);
      } catch (err) {
        console.warn('Error to analyze photo:', err);
        setAlignmentHint(`❗️ Couldn't analyze photo`);
        setTimeout(() => setAlignmentHint(null), 3000);
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
  const clearReferencePhoto = async () => {
    try {
      const uri = referencePhoto;
      if (!uri) return;

      const isTemporary =
        uri.startsWith(FileSystem.documentDirectory) || uri.startsWith(FileSystem.cacheDirectory);

      if (isTemporary) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        log.debug(`[D007] Deleted local reference image: ${uri}`);
      } else {
        log.debug(`[D008] Reference image from gallery or system: ${uri} – not deleting`);
      }

      setReferencePhoto(null);
    } catch (error) {
      log.error('[E007] Failed to clear reference image', error);
    }
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
          /**
           * Logs a gallery-related error reported by the user to a file.
           *
           * @function
           */
          onPress: () => {
            logToFile(`[REPORT] User reported gallery error ID ${errorId}`);
          },
        },
      ]);
    }
  };

  CameraScreen.propTypes = {
    route: PropTypes.shape({
      params: PropTypes.shape({
        referencePhotoUri: PropTypes.string,
      }),
    }).isRequired,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraConteiner}>
        <CameraView
          style={styles.camera}
          facing={type}
          ref={cameraRef}
          flash={flashMode}
          zoom={zoom}
          resizeMode="cover"
        >
          <View style={styles.overlayContainer}>
            {referencePhoto && (
              <Image
                source={{ uri: referencePhoto }}
                style={[styles.overlayImage, { opacity: opacity }]}
                resizeMode="contain"
              />
            )}
          </View>
          {alignmentHelpEnabled && alignmentHint && (
            <View style={styles.alignmentConteiner}>
              <Text style={styles.alignmentText}>{alignmentHint}</Text>
            </View>
          )}
          <View>
            {referencePhoto && (
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Opacity</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.2}
                  maximumValue={0.9}
                  value={opacity}
                  valueLabelDisplay="auto"
                  onValueChange={setOpacity}
                  minimumTrackTintColor="#00DDDD" // колір залитої частини
                  maximumTrackTintColor="#2E2F3E" // колір незалитої частини (фон)
                  thumbTintColor="#ffffff" // білий thumb
                />
              </View>
            )}
          </View>
        </CameraView>
        <BlurView
          intensity={100}
          tint="dark"
          style={styles.blurContainer}
          experimentalBlurMethod="dimezisBlurView"
        >
          <Text style={styles.blurText}>Zoom: x{(10 * zoom).toFixed(1)}</Text>
        </BlurView>
      </View>
      {showZoomControls ? (
        <ZoomControls
          setZoom={setZoom}
          setShowZoomControls={setShowZoomControls}
          zoom={zoom ?? 1}
        />
      ) : (
        <View style={styles.container}>
          {/* top buttons */}
          <View style={styles.topButtonsContainer}>
            <CustomButton
              iconName="camera-reverse-outline"
              onPress={toggleCameraType}
              containerStyle={{ alignSelf: 'center' }}
              accessibilityLabel="Toggle camera"
              testID="toggle-camera-button"
            />
            <CustomButton
              iconName={flashMode === 'on' ? 'flash-outline' : 'flash-off-outline'}
              onPress={toggleFlash}
              containerStyle={{ alignSelf: 'center' }}
              accessibilityLabel={`Flash ${flashMode === 'off' ? 'off' : 'on'}`}
              testID="toggle-flash-button"
            />
            <CustomButton
              iconName="search-outline"
              onPress={() => setShowZoomControls(s => !s)}
              containerStyle={{ alignSelf: 'center' }}
            />
            <CustomButton
              iconName="color-wand"
              onPress={() => {
                setAlignmentHelpEnabled(prev => {
                  const newValue = !prev;

                  Alert.alert(
                    newValue ? 'Tips enabled' : 'Tips disabled',
                    newValue
                      ? 'You will now receive tips about camera position.'
                      : 'Camera tips have been turned off.'
                  );

                  return newValue;
                });
              }}
              containerStyle={{ alignSelf: 'center' }}
              accessibilityLabel="Smart tips"
            />

            <CustomButton
              iconName="bug-outline"
              onPress={() => navigation.navigate('ReportBugScreen')}
              containerStyle={{ alignSelf: 'center' }}
              accessibilityLabel="Report a problem"
            />
            <CustomButton
              iconName="settings-outline"
              // onPress={() => router.push('/_sitemap')}
              containerStyle={{ alignSelf: 'center' }}
            />

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

          {/* bottom buttons */}
          <View style={styles.bottomButtonsContainer}>
            {referencePhoto && (
              <>
                <CustomButton
                  iconName="close-circle-outline"
                  onPress={clearReferencePhoto}
                  containerStyle={{ alignSelf: 'center' }}
                  accessibilityLabel="Clear reference photo"
                />
              </>
            )}
            <CustomButton
              iconName="image"
              onPress={pickReferenceImage}
              containerStyle={{ alignSelf: 'center' }}
              accessibilityLabel="Select reference photo"
            />
            <TouchableHighlight>
              <Ionicons
                name="radio-button-on-sharp"
                testID="capture-button"
                size={65}
                onPress={takePicture}
                color="white"
                accessibilityLabel="Capture photo"
              />
            </TouchableHighlight>
            <CustomButton
              iconName="images-outline"
              onPress={openGallery}
              containerStyle={{ alignSelf: 'center' }}
              accessibilityLabel="Open Galery"
              testID="open-gallery-button"
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraConteiner: {
    flex: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  premissionText: {
    textAlign: 'center',
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
    right: 0,
    bottom: 0,
  },
  alignmentConteiner: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 12,
  },
  alignmentText: {
    color: 'white',
    fontSize: 16,
  },
  blurContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 10,
  },
  blurText: {
    color: 'white',
  },
  topButtonsContainer: {
    flex: 0.7,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  bottomButtonsContainer: {
    flex: 1.1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
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
    padding: 20,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
  },
  sliderLabel: {
    color: 'white',
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  slider: {
    width: '80%',
    height: 50,
  },
});

export default CameraScreen;
