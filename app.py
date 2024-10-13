import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Load the pre-trained YOLOv5s model
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Read the image file
    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')

    # Perform inference
    results = model(img)

    # Get results as pandas DataFrame
    results_df = results.pandas().xyxy[0].to_dict(orient="records")

    # Render and save results (image with bounding boxes)
    annotated_img = np.squeeze(results.render())  # Extract the rendered image

    # Convert the annotated image from BGR (OpenCV format) to RGB
    annotated_img = cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB)

    # Convert the image to base64
    _, buffer = cv2.imencode('.jpg', annotated_img)
    img_str = base64.b64encode(buffer).decode('utf-8')

    return jsonify({
        'message': 'Image processed successfully',
        'results': results_df,  # Detected objects
        'annotated_image': img_str  # Base64 encoded image
    })

if __name__ == '__main__':
    app.run(debug=True)
