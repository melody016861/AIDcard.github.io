from flask import Flask, request, jsonify, render_template, url_for, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image
import os  # 需要加入這個模組
from classification_model.Google_gemini import classification_with_retry
from pymongo import MongoClient  # type: ignore

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

from pymongo import MongoClient # type: ignore
client = MongoClient('mongodb://localhost:27017/')
db = client['leaderboard_db']
users_collection = db['users']

result = users_collection.update_many({}, {'$set': {'points': 0}})
print(f'Matched {result.matched_count}, Modified {result.modified_count}')

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    # 日誌輸出更新操作前的狀態
    users_before_update = list(users_collection.find())
    print(f'Before update: {users_before_update}')
    
    # 重置所有使用者的積分為 0
    result = users_collection.update_many({}, {'$set': {'points': 0}})
    print(f'Matched {result.matched_count}, Modified {result.modified_count}')
    
    # 確認更新後的結果
    users_after_update = list(users_collection.find())
    print(f'After update: {users_after_update}')
    
    # 從 MongoDB 中獲取更新後的排行榜，按分數排序
    leaderboard = list(users_collection.find().sort("points", -1))
    
    # 準備返回的資料
    leaderboard_data = [{'username': user['username'], 'points': user['points']} for user in leaderboard]
    
    return jsonify(leaderboard_data)

# 設定檔案上傳的資料夾路徑
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 設定最大上傳檔案大小 16MB

# 如果 'uploads' 資料夾不存在，則創建
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# 處理檔案上傳的路由
@app.route('/api/recycling-diary', methods=['POST'])
def upload_diary():
    if 'image' not in request.files:
        return jsonify({'error': '沒有找到圖片檔案'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': '沒有選擇檔案'}), 400

    # 確保檔案名稱是安全的，並儲存在指定目錄中
    filename = secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    
    # 返回成功的回應，包括圖片的 URL
    file_url = url_for('uploaded_file', filename=filename)
    return jsonify({'message': '檔案上傳成功', 'file_url': file_url})

# 提供靜態資源的路由，用來顯示上傳的圖片
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == '__main__':
    app.run(port=5000)
