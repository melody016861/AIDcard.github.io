from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from PIL import Image
from classification_model.Google_gemini import classify_image_with_retry  # 使用修改後的分類函數

app = Flask(__name__)

@app.route('/receive_images', methods=['POST'])
def receive_images():
    data = request.get_json()
    image_urls = data.get('image_urls', [])
    label = data.get('label', 'unknown')

    # 將 image_urls 和 label 儲存到伺服器或做其他處理
    print(f'Received {len(image_urls)} images with label: {label}')

    return jsonify({"message": "Images received successfully", "count": len(image_urls)})

@app.route('/', methods=['GET'])
def home():
    return render_template('index_new.html')

@app.route('/Gemini_connect') 
def new_page():
    return render_template('Gemini_connect.html')

# 設置允許的文件類型
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/classify_image', methods=['POST'])
def classify_image_endpoint():
    print("Request received!")
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        try:
            image = Image.open(file)
            # 使用 Google_gemini.py 中的分類函數來進行分類
            category = classify_image_with_retry(image)

            return jsonify({"category": category}), 200
        except Exception as e:
            print(f"Error during classification: {str(e)}")
            return jsonify({"error": "Internal server error occurred"}), 500
    else:
        return jsonify({"error": "Invalid file type"}), 400
    
@app.route('/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()  # 接收 JSON 資料
    email = data.get('email') if data else None  # 確保有收到資料
    
    if email:
        # 處理訂閱邏輯 (可以將 email 儲存到資料庫中或其他操作)
        return jsonify({'message': 'Subscription successful'}), 200
    else:
        return jsonify({'error': 'Email is required'}), 400


if __name__ == '__main__':
    app.run(port=5000)
