# 專案簡報_Final version
https://drive.google.com/file/d/10insmR9ger3LBUPxJuEcfgRcBSO7dKMX/view?usp=sharing

## 上傳專案資料夾的方式
```
1. cd path/to/your/folder
2. git add .
3. git commit -m "Initial commit"
4. git push -u origin main
```

## 複製專案

```
git clone https://github.com/melody016861/AIDcard.github.io.git
cd AIDcard.github.io
```

下載影像辨識模型 VGG16 所需權重
https://drive.google.com/file/d/1JhLIOjlVwObElupBOCBrbdY0edNMgYQY/view?usp=sharing
並且將其放置於 backend/classification_model 中。

查看爬蟲產出的圖片: 
https://drive.google.com/drive/u/0/folders/1HIoygEZd4SJUjBsbMcyo2UV16g3QcEI9

## 安裝需要的 module 

開啟 server 端，可以傳送圖片

```
python backend\server.py
```
開啟另外一個終端機執行以下指令。開啟網頁，可以展示圖片
```
cd AIDcard.github.io
npm install express
node frontend\app.js
```

進入此網址執行操作
http://localhost:3000/index.html


## Google Gemini API使用指南

Gemini API 適用的 Python SDK 包含在 google-generativeai 套件。使用 pip 安裝依附元件： pip install -q -U google-generativeai

注意事項: (1)請確保您的開發環境 須符合下列條件：Python 3.9 以上版本 (2)若要使用自用的Google Gemini API，在 Google_gemini.py檔案中 程式碼中的變數GOOGLE_API_KEY進行更改 (3)預設的API是最簡易的版本(並非付費版本)，因此有使用次數限制，若一次進行過多次請求，會發生請求失誤的問題。

※若想創建自己的金鑰，請進入此網址執行操作 : https://aistudio.google.com/app/apikey

# 聖安
20240908
在 Image Predict Page, 不只可以從手機上傳圖片，也可以直接用 upload image bottom 上傳指定圖片！

20240904
還原到原始版本

20240822
已將我的CNN影像辨識模型, VGG16，訓練於 trashnet 資料集，放到網頁上去、並且可以展示結果！

20240816
把詠琪的基礎網頁，增加可以讀取指定資料夾的最新圖片的網頁，並且也可以正常從我的手機傳到電腦上。

20240811
找到可以有方法可以做到把手機拍的照片傳到電腦上。code 留在 D 槽， codes, 然後學到了手機裡面的 “捷徑” app 這招！

## Todo
* 增加如何將 iphone 圖片傳送到電腦的教學
* 增加怎麼創虛擬環境、深度學習模型所需 package 的教學
* 將 gemini model 放上去。
* 把接收資料夾不要每次都用覆蓋的、可以自動偵測指定資料夾的檔名、並且自動加在最後面。
* 多 train 一個 yolo 上去做 object detection.
https://github.com/AgaMiko/waste-datasets-review
* 多 train 一個 mobilenet 上去。
* 紀錄回收內容。
* 有三個影像辨識模型可以做投票。
* Arduino 有機會可以做重量預測?
* 有沒有可能用 generative AI, 生成垃圾圖片?

# 詠琪
2024.09.15
1. 回收日記功能完成。
2. 使用者反饋網頁完成。
3. 回收教育宣導網頁完成。

20240909
將雨翾的Arduino 相關資料夾檔案加入web_easy。

20240901
1. 加入回收日記功能。(還須解決bug)
2. 加入抽獎功能。

20240828
1. 將專案套入模板中。
2. Todo list 中的資料分析敘述優化。(請看下方)

20240825
1. 爬蟲圖片品質提升。不過一般垃圾的圖片品質依然無法解決。
2. Image Predict 路徑問題解決。
3. Figma 流程圖完成。

20240822
1. 註冊登入功能完成。
2. 將測驗功能完成，並在測驗結束後可以返回排行榜網頁查看積分。
3. 測驗結果的圖表分析功能完成。
4. 在各個網頁中加入滾動式功能。

## Todo
1. 抽獎機制
2. 社群互動
3. 資料分析
   * 測驗結果分析：提供詳細的測驗結果分析，展示用戶在各個測驗中的表現，並識別高分和低分趨勢。
   * 用戶參與度追蹤：追蹤用戶的測驗參與次數，並透過時間序列圖呈現參與度的變化趨勢，幫助了解用戶活躍度。
   * 測驗時間與表現分析：分析用戶在不同測驗上所花費的平均時間，並將其與測驗表現進行關聯，探索時間管理對成績的影響。
   * 測驗完成時間分佈：透過視覺化圖表展示各測驗的完成時間分佈，識別出耗時較長的測驗，優化測驗設計。
4. 回收教育宣導內容
5. 積分系統要每次關掉都可以歸0
6. 多測幾個測驗，圖表只要能顯示出測驗的比例就好

# 沂萱
## Todo
1. 連接網頁
2. 提升效能，如果有大量圖片需要處理，可以使用多線程或多進程來提升效能，避免單線程的時間延遲
3. 增加日誌記錄，使用日誌記錄而非 print，可以更好追蹤、排錯
