import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as poseDetection from '@tensorflow-models/pose-detection';

async function loadImageAsTensor(uri) {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const imageData = new Uint8Array(arrayBuffer);
  return decodeJpeg(imageData);
}

export default async function alignWithReference(userUri, referenceUri) {
  await tf.ready();

  const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  });

  const [userImageTensor, refImageTensor] = await Promise.all([
    loadImageAsTensor(userUri),
    loadImageAsTensor(referenceUri),
  ]);

  const [userPose] = await detector.estimatePoses(userImageTensor);
  const [refPose] = await detector.estimatePoses(refImageTensor);

  if (!userPose || !refPose) return 'Не вдалося розпізнати пози';

  const getNoseY = pose => pose.keypoints.find(p => p.name === 'nose')?.y;

  const userY = getNoseY(userPose);
  const refY = getNoseY(refPose);

  if (userY == null || refY == null) return 'Не знайдено носа на фото';

  const diff = userY - refY;

  if (diff > 30) return 'Підніми камеру';
  if (diff < -30) return 'Опусти камеру';

  return 'Добре вирівняно!';
}
