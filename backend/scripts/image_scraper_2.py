import asyncio
import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from pyppeteer import launch  # 使用 pyppeteer 而不是 pyppeteer2
from IPython.display import display # type: ignore
import nest_asyncio # type: ignore
import numpy as np
import os # 用來處理檔案路徑和創建資料夾
import cv2  # OpenCV 用來進行圖像處理

nest_asyncio.apply()

async def fetch_image_urls(query, max_links_to_fetch):
    browser = await launch(executablePath='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless=True, args=['--no-sandbox'])
    try:
        page = await browser.newPage()
        search_url = f"https://www.google.com/search?q={query}&tbm=isch"
        await page.goto(search_url)
        image_urls = set()

        for _ in range(10):  # adjust the range to control scrolling
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight);')
            await asyncio.sleep(1)
            page_content = await page.content()
            soup = BeautifulSoup(page_content, 'html.parser')
            img_elements = soup.find_all('img')
            for img_elem in img_elements:
                url = img_elem.get('src') or img_elem.get('data-src')
                if url and url.startswith('http'):
                    image_urls.add(url)
                if len(image_urls) >= max_links_to_fetch:
                    break
            if len(image_urls) >= max_links_to_fetch:
                break

    finally:
        await browser.close()
        
    return list(image_urls)[:max_links_to_fetch]

def is_valid_image(image):
    """
    使用基本的內容分析來篩選圖片。
    例如，過濾掉過於鮮豔或太暗的圖片。
    """
    image = image.convert("RGB")
    np_image = np.array(image)

    # 計算圖像的平均顏色
    mean_color = np.mean(np_image, axis=(0, 1))

    # 如果圖像過於明亮或過於黑暗，則跳過
    if np.all(mean_color > 230) or np.all(mean_color < 20):
        return False

    # 計算飽和度，過濾色彩過於鮮豔的圖片
    hsv_image = cv2.cvtColor(np_image, cv2.COLOR_RGB2HSV)
    saturation = hsv_image[:, :, 1].mean()
    if saturation > 180:
        return False
    
    # 這裡可以添加更多的篩選邏輯
    return True

def save_images(image_urls, folder_path, start_index):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    for i, url in enumerate(image_urls):
        try:
            response = requests.get(url)
            image = Image.open(BytesIO(response.content))
            
            # 將圖片轉換為 RGB 模式，這樣可以保存為 JPEG
            if image.mode in ("P", "RGBA"):
                image = image.convert("RGB")
                
                
            # 篩選尺寸
            if image.width < 200 or image.height < 200:
                print(f"Skipped {url} due to small size: {image.size}")
                continue
            
             # 內容分析篩選
            if not is_valid_image(image):
                print(f"Skipped {url} due to content analysis")
                continue
            
           # 使用 start_index 來確保文件名唯一
            image_path = os.path.join(folder_path, f'image_{start_index + i}.jpg')
            image.save(image_path)
            print(f"Saved {image_path}")
        except Exception as e:
            print(f"Could not save {url}: {e}")

def main():
    labels = [
        "recyclable glass bottles",
        "recyclable glass jars",
        "recyclable glass containers",
        "recyclable glass packaging",
        "recyclable glass materials"
    ]
    max_images = 1000  # 每個標籤抓取的最大圖片數
    folder_path = "玻璃_images_2"
    start_index = 1  # 初始化開始的索引

    for label in labels:
        print(f"Fetching image URLs for label: {label}...")
        image_urls = asyncio.get_event_loop().run_until_complete(fetch_image_urls(label, max_images))
        print(f"Found {len(image_urls)} images for label: {label}.")

        # 保存圖片到統一的資料夾，並傳遞開始的索引
        save_images(image_urls, folder_path, start_index)

        # 更新 start_index 以確保圖片不被覆蓋
        start_index += len(image_urls)

        # 將圖片URL和標籤發送到Flask服務器
        server_url = "http://127.0.0.1:5000/receive_images"
        data = {
            "image_urls": image_urls,
            "label": label
        }
        response = requests.post(server_url, json=data)

        # 列印服務器的響應
        print("Server response:", response.text)

        # 嘗試解析 JSON 響應
        try:
            print(response.json())
        except Exception as e:
            print(f"Failed to parse JSON for label {label}: {e}")

if __name__ == "__main__":
    main()