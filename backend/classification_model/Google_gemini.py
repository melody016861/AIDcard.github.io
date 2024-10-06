import os
import google.generativeai as genai
import time
import os
import requests
import base64
from dotenv import load_dotenv
load_dotenv()


# 將 API 鍵設置為變數
GOOGLE_API_KEY = "AIzaSyCnzKY6McxENFeJDwfrODSXq49GNc9ji_w"


genai.configure(api_key=GOOGLE_API_KEY)




# 定義圖片所在路徑

url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"



# 定義分類函數
def classification(img_path):
     with open(img_path, "rb") as image_file:
        image_base64_string = base64.b64encode(image_file.read()).decode('utf-8')

    # 構建請求數據
        headers = {'Content-Type': 'application/json'}
        data = {
            "contents": [
            {
                "parts": [
                    {"text": """Which category does this image belong to: glass, metal, paper, cardboard, plastic, or trash ? 
                            Please directly output one of these categories without any other words, and must choose one closest to definitions.If the image cannot be recognized, it will be classified as trash."""},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_base64_string
                        }
                    }
                ]
            }
        ]
    }


        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            try:
                result = response.json()

                answer = result['candidates'][0]['content']['parts'][0]['text'].strip()
                valid_categories = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']
                if answer.lower() in valid_categories:
                    return answer
                else:
                    return "trash"  # 如果答案無效，返回 "trash"
            except KeyError:
                return "trash"  # 如果 KeyError，返回 "trash"
        else:
            return "trash"  # 如果請求失敗，返回 "trash"

def classification_with_retry(img_path, retries=3, delay=5):
    for attempt in range(retries):
        try:
            return classification(img_path) or "trash"  # 無論如何返回 "trash"
        except requests.ConnectionError:
            if attempt < retries - 1:
                time.sleep(delay)
            else:
                return "trash"  # 如果所有嘗試失敗，返回 "trash"
