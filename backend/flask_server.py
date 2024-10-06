from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from PIL import Image
from classification_model.Google_gemini import classification_with_retry
  # 使用修改後的分類函數

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




if __name__ == '__main__':
    app.run(port=5000)
