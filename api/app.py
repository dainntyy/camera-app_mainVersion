# api/app.py
from flask import Flask, request, jsonify
import cv2
import numpy as np
import mediapipe as mp
import base64

app = Flask(__name__)
pose = mp.solutions.pose.Pose(static_image_mode=True)

def decode_base64_image(data):
    content = base64.b64decode(data.split(",")[-1])
    image_array = np.frombuffer(content, dtype=np.uint8)
    return cv2.imdecode(image_array, cv2.IMREAD_COLOR)

def extract_nose_y(image):
    result = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    if result.pose_landmarks:
        return result.pose_landmarks.landmark[mp.solutions.pose.PoseLandmark.NOSE].y
    return None

@app.route("/analyze", methods=["POST"])
def analyze():
    user_file = request.files.get("userImage")
    ref_file = request.files.get("referenceImage")

    if not user_file or not ref_file:
        return jsonify({"tip": "Не надіслано зображення", "confidence": 0.0})

    user_bytes = np.frombuffer(user_file.read(), np.uint8)
    ref_bytes = np.frombuffer(ref_file.read(), np.uint8)

    user_image = cv2.imdecode(user_bytes, cv2.IMREAD_COLOR)
    ref_image = cv2.imdecode(ref_bytes, cv2.IMREAD_COLOR)

    user_result = pose.process(cv2.cvtColor(user_image, cv2.COLOR_BGR2RGB))
    ref_result = pose.process(cv2.cvtColor(ref_image, cv2.COLOR_BGR2RGB))

    if not user_result.pose_landmarks or not ref_result.pose_landmarks:
        return jsonify({"tip": "Не знайдено носа", "confidence": 0.0})

    user_nose = user_result.pose_landmarks.landmark[mp.solutions.pose.PoseLandmark.NOSE]
    ref_nose = ref_result.pose_landmarks.landmark[mp.solutions.pose.PoseLandmark.NOSE]

    diff_y = user_nose.y - ref_nose.y
    diff_x = user_nose.x - ref_nose.x

    # Визначаємо напрямок: найбільше відхилення
    if abs(diff_y) > abs(diff_x):
        if diff_y > 0.05:
            alignment = "down"
            tip = "🔽 Нахили камеру вниз"
        elif diff_y < -0.05:
            alignment = "up"
            tip = "🔼 Нахили камеру вгору"
        else:
            alignment = "center"
            tip = "✅ Добре вирівняно"
    else:
        if diff_x > 0.05:
            alignment = "right"
            tip = "🔄 Вирівняй камеру правіше"
        elif diff_x < -0.05:
            alignment = "left"
            tip = "🔄 Вирівняй камеру лівіше"
        else:
            alignment = "center"
            tip = "✅ Добре вирівняно"

    confidence = 1 - min(abs(diff_x) + abs(diff_y), 1.0)

    return jsonify({
        "tip": tip,
        "alignment": alignment,
        "confidence": round(confidence, 2)
    })


if __name__ == "__main__":
    app.run(debug=True)
