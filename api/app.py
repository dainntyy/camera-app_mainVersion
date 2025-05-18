# api/app.py

from flask import Flask, request, jsonify
import cv2
import numpy as np
import mediapipe as mp
import base64

app = Flask(__name__)
pose = mp.solutions.pose.Pose(static_image_mode=True)

def decode_base64_image(data):
    """Decodes a base64-encoded image string to an OpenCV image.

    Args:
        data (str): Base64 string (can include data URI prefix).

    Returns:
        numpy.ndarray: Decoded image in BGR format.
    """
    content = base64.b64decode(data.split(",")[-1])
    image_array = np.frombuffer(content, dtype=np.uint8)
    return cv2.imdecode(image_array, cv2.IMREAD_COLOR)

def extract_nose_coords(image):
    """Extracts normalized nose coordinates (x, y) from a given image.

    Args:
        image (numpy.ndarray): OpenCV image in BGR format.

    Returns:
        tuple or None: (x, y) coordinates of the nose or None if not found.
    """
    result = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    if result.pose_landmarks:
        nose = result.pose_landmarks.landmark[mp.solutions.pose.PoseLandmark.NOSE]
        return (nose.x, nose.y)
    return None

@app.route("/analyze", methods=["POST"])
def analyze():
    """API endpoint to analyze head position compared to a reference image.

    Expects form-data POST with two image files:
    - 'userImage': the current image to evaluate
    - 'referenceImage': the desired pose reference image

    Returns:
        JSON with direction tip, alignment label, and confidence score.
    """
    user_file = request.files.get("userImage")
    ref_file = request.files.get("referenceImage")

    if not user_file or not ref_file:
        return jsonify({
            "tip": "Both userImage and referenceImage files are required.",
            "confidence": 0.0
        })

    # Read uploaded image files into OpenCV-compatible format
    user_bytes = np.frombuffer(user_file.read(), np.uint8)
    ref_bytes = np.frombuffer(ref_file.read(), np.uint8)
    user_image = cv2.imdecode(user_bytes, cv2.IMREAD_COLOR)
    ref_image = cv2.imdecode(ref_bytes, cv2.IMREAD_COLOR)

    # Extract nose coordinates from both images
    user_nose = extract_nose_coords(user_image)
    ref_nose = extract_nose_coords(ref_image)

    if not user_nose or not ref_nose:
        return jsonify({
            "tip": "Failed to detect nose in one or both images.",
            "confidence": 0.0
        })

    diff_x = user_nose[0] - ref_nose[0]
    diff_y = user_nose[1] - ref_nose[1]

    # Determine dominant misalignment direction
    if abs(diff_y) > abs(diff_x):
        if diff_y > 0.05:
            alignment = "down"
            tip = "🔽 Tilt the camera down"
        elif diff_y < -0.05:
            alignment = "up"
            tip = "🔼 Tilt the camera up"
        else:
            alignment = "center"
            tip = "✅ Good alignment"
    else:
        if diff_x > 0.05:
            alignment = "right"
            tip = "🔄 Move the camera to the right"
        elif diff_x < -0.05:
            alignment = "left"
            tip = "🔄 Move the camera to the left"
        else:
            alignment = "center"
            tip = "✅ Good alignment"

    confidence = 1 - min(abs(diff_x) + abs(diff_y), 1.0)

    return jsonify({
        "tip": tip,
        "alignment": alignment,
        "confidence": round(confidence, 2)
    })

if __name__ == "__main__":
    app.run(debug=True)
