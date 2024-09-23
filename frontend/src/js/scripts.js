document.addEventListener('DOMContentLoaded', function () {
    // 當 DOM 加載完成後執行的代碼
    const token = localStorage.getItem('token');
    // const userId = localStorage.getItem('userId'); // 確保 userId 被定義
    const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

    // 確保 userId 被存儲在 localStorage 中
    if (userId) {
        localStorage.setItem('userId', userId);
    }

    console.log("Token:", token);  // 用于调试
    console.log("UserId:", userId);  // 用于调试

    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loggedInFeatures = document.getElementById('loggedInFeatures');

    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const leaderboardNav = document.getElementById('leaderboardNav');
    const achievementsNav = document.getElementById('achievementsNav');
    const quizNav = document.getElementById('quizNav');
    const quizAnalyticsNav = document.getElementById('quizAnalyticsNav');
    const GeminiNav = document.getElementById('GeminiNav');
    const LotteryNav = document.getElementById('LotteryNav');
    const recycling_diaryNav = document.getElementById('recycling_diaryNav');
    const arduinoNav = document.getElementById('arduinoNav');
    const educationNav = document.getElementById('educationNav');
    const feedbackNav = document.getElementById('feedbackNav');



    if (token && userId) {
        console.log("User is logged in.");  // 用于调试
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (loggedInFeatures) loggedInFeatures.style.display = 'block';

        if (loginNav) loginNav.style.display = 'none'; // 隱藏登入連結
        if (registerNav) registerNav.style.display = 'none'; // 隱藏註冊連結
        if (leaderboardNav) leaderboardNav.style.display = 'block'; // 顯示排行榜連結
        if (achievementsNav) achievementsNav.style.display = 'block'; // 顯示成就連結
        if (quizNav) quizNav.style.display = 'block'; // 顯示成就連結
        if (quizAnalyticsNav) quizAnalyticsNav.style.display = 'block';
        if (GeminiNav) GeminiNav.style.display = 'block';
        if (LotteryNav) LotteryNav.style.display = 'block';
        if (recycling_diaryNav) recycling_diaryNav.style.display = 'block';
        if (arduinoNav) arduinoNav.style.display = 'block';
        if (educationNav) educationNav.style.display = 'block';
        if (feedbackNav) feedbackNav.style.display = 'block';

    } else {
        console.log("User is not logged in.");  // 用于调试
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loggedInFeatures) loggedInFeatures.style.display = 'none';

        if (loginNav) loginNav.style.display = 'block'; // 顯示登入連結
        if (registerNav) registerNav.style.display = 'block'; // 顯示註冊連結
        if (leaderboardNav) leaderboardNav.style.display = 'none'; // 隱藏排行榜連結
        if (achievementsNav) achievementsNav.style.display = 'none'; // 隱藏成就連結
        if (quizNav) quizNav.style.display = 'none'; // 顯示成就連結
        if (quizAnalyticsNav) quizAnalyticsNav.style.display = 'none';
        if (GeminiNav) GeminiNav.style.display = 'none';
        if (LotteryNav) LotteryNav.style.display = 'none';
        if (recycling_diaryNav) recycling_diaryNav.style.display = 'none';
        if (arduinoNav) arduinoNav.style.display = 'block';
        if (educationNav) educationNav.style.display = 'block';
        if (feedbackNav) feedbackNav.style.display = 'block';
    }

    // 如果是在quiz.html頁面，則加載測驗題目
    if (document.getElementById('quizForm')) {
        loadQuiz();
    }

    // 抽獎功能代碼
    const spinButton = document.getElementById('spinButton');
    const wheel = document.getElementById('wheel');
    let currentRotation = 0;

    if (spinButton && wheel) {
        spinButton.addEventListener('click', function () {
            const segments = [
                'Gold Watch',
                'Gold Necklace',
                'Silver Ring',
                'Silver Bracelet',
                'Bronze Medal',
                'Bronze Keychain',
                'Participation Certificate',
                'Pen'
            ];

            const spinDeg = Math.floor(Math.random() * 360) + 1080;
            currentRotation += spinDeg;
            wheel.style.transition = 'transform 5s ease-out';
            wheel.style.transform = `rotate(${currentRotation}deg)`;

            setTimeout(() => {
                const normalizedDeg = currentRotation % 360;
                const segmentAngle = 360 / segments.length;
                const winningIndex = Math.floor(normalizedDeg / segmentAngle);
                const selectedPrize = segments[segments.length - winningIndex - 1];

                document.getElementById('lotteryResult').innerText = `恭喜你獲得了 ${selectedPrize}！`;
            }, 5000);
        });
    } else {
        console.error('Spin button or wheel element is missing.');
    }

    // 回收日記功能代碼
    const diaryForm = document.getElementById('diaryForm');
    if (diaryForm) {
        const diaryEntry = document.getElementById('diaryEntry');
        const diaryImage = document.getElementById('diaryImage');
        const message = document.getElementById('message');
        const diaryList = document.getElementById('diaryList');

        diaryForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const entryTitle = document.getElementById('diaryTitle').value.trim();
            const entryText = diaryEntry.value.trim();
            if (!entryText) {
                message.textContent = "請填寫日記內容！";
                return;
            }

            const formData = new FormData();
            formData.append('title', entryTitle); // 如果沒有 title 可以將其設置為空字串
            formData.append('entry', entryText);
            if (diaryImage.files[0]) {
                formData.append('image', diaryImage.files[0]);
            }

            const token = localStorage.getItem('token');

            if (!token) {
                message.textContent = "未能獲取授權令牌，請重新登入。";
                return;
            }

            try {
                const response = await fetch('/api/recycling-diary', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error: ${errorText}`);
                }

                const result = await response.json();
                console.log("伺服器回應結果:", result);

                message.textContent = "日記提交成功！";
                loadDiary();
                diaryEntry.value = '';
                if (diaryTitle) diaryTitle.value = ''; // 清空標題欄
                diaryImage.value = '';

            } catch (error) {
                message.textContent = `提交失敗: ${error.message}`;
            }
        });

        async function loadDiary() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token is missing');
                }

                const response = await fetch('/api/recycling-diary', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // 添加 token 到請求標頭
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to load diaries: ${response.statusText}`);
                }

                const diaries = await response.json();
                if (!Array.isArray(diaries)) {
                    throw new Error('Unexpected response format');
                }

                // 處理日記顯示邏輯
                diaryList.innerHTML = '';

                diaries.forEach(diary => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <p>${new Date(diary.date).toLocaleString()}</p>
                        <p>${diary.entry}</p>
                        ${diary.image ? `<img src="${diary.image}" alt="日記圖片" style="max-width:100px;"/>` : ''}
                    `;
                    diaryList.appendChild(listItem);
                });
            } catch (error) {
                console.error('Error loading diary entries:', error);
                alert('無法加載日記條目，請確認您的身份是否驗證通過。');
            }
        }

        loadDiary();
    } else {
        console.error('Diary form element is missing.');
    }
});

// 當用戶提交註冊表單時
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message);

    if (response.status === 201) {  // 註冊成功後跳轉到登入頁面
        window.location.href = 'login.html';
    }
});

// 當用戶提交登入表單時
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    console.log("Received userId from server:", data.userId); // 新增这行代码
    if (data.token && data.userId) {
        // // 將 token 儲存到 localStorage
        // const token = data.token;
        // localStorage.setItem('token', token);

        // // 解析 token 以取得 userId
        // const payload = JSON.parse(atob(token.split('.')[1]));
        // const userId = payload.userId;

        // // localStorage.setItem('token', data.token); // 儲存 JWT
        // localStorage.setItem('userId', data.userId); // 儲存 userId

        // console.log('Token stored:', localStorage.getItem('token'));
        // console.log('UserId stored:', localStorage.getItem('userId'));

        // alert('登入成功');
        // window.location.href = 'index.html';  // 登入成功後跳轉到首頁
        localStorage.setItem('token', data.token); // 儲存 JWT
        localStorage.setItem('userId', data.userId); // 儲存 userId

        console.log('Token stored:', localStorage.getItem('token'));
        console.log('UserId stored:', data.userId);

        alert('登入成功');
        window.location.href = 'index_new.html';  // 登入成功後跳轉到首頁
    } else {
        alert(data.message);
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = 'index_new.html';
}

// 加載測驗的函數
async function loadQuiz() {

    const token = localStorage.getItem('token');
    // const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
    const userId = localStorage.getItem('userId');
    console.log('userId in localStorage:', userId);
    // console.log('userId in localStorage:', localStorage.getItem('userId'));

    try {
        const quizResponse = await fetch('/api/getQuizzes');
        if (!quizResponse.ok) {
            console.error('Response status:', quizResponse.status);
            console.error('Response text:', await quizResponse.text());
            throw new Error('Failed to load quizzes');
        }

        const quizzes = await quizResponse.json();
        localStorage.setItem('quizzes', JSON.stringify(quizzes));

        if (quizzes.length === 0) {
            alert('目前沒有可用的測驗');
            return;
        }

        const quizContainer = document.getElementById('quizContainer');
        quizContainer.innerHTML = quizzes.map((quiz, index) => `
            <div class="quiz-item">
                <h3>${quiz.question}</h3>
                ${quiz.options.map((option) => `
                    <label>
                        <input type="${quiz.correctAnswer.length > 1 ? 'checkbox' : 'radio'}"
                               name="quizOption${index}" value="${option}" />
                        ${option}
                    </label><br/>
                `).join('')}
            </div>
        `).join('');

        document.getElementById('quizForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            // const userId = localStorage.getItem('userId');
            // console.log('userId:', userId);  // 添加這行来檢查 userId

            const selectedAnswers = quizzes.map((quiz, index) => {
                const selectedOptions = [...document.querySelectorAll(`input[name="quizOption${index}"]:checked`)]
                    .map(input => input.value);
                return { quizId: quiz._id, selectedOptions };
            });

            console.log('selectedAnswers:', selectedAnswers);  // 確認這行輸出的是一個有效的數組

            if (selectedAnswers.length === 0) {
                alert('請選擇至少一個選項');
                return;
            }

            try {
                const response = await fetch('/api/submitQuiz', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ userId, selectedAnswers })
                });

                if (!response.ok) {
                    const errorText = await response.text(); // 獲取錯誤訊息
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }

                const result = await response.json();
                alert(result.msg);
                window.location.href = 'leaderboard.html';
            } catch (error) {
                console.error('Error submitting quiz:', error);
                alert('提交答案時出現錯誤: ' + error.message);
            }
        });

    } catch (error) {
        console.error('Error fetching quiz:', error);
        alert('無法加載測驗，請檢查網絡連接或聯繫管理員。');
    }
}
