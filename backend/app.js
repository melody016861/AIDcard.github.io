// backend/app.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel'); // 引入userModel
const Achievement = require('./models/achievementModel');
const path = require('path'); // 新增這一行
const achievementRoutes = require('./routes/achievementRoutes');
const quizRoutes = require('./routes/quizRoutes');
const { router: authRoutes, authMiddleware } = require('./routes/authRoutes');
const lotteryRoutes = require('./routes/lotteryRoutes');
const multer = require('multer');
const RecyclingDiary = require('./models/recyclingDiaryModel'); // 引入回收日記模型
// const google_gemini_connect = require('/')

const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport');  // SerialPort
const { ReadlineParser } = require('@serialport/parser-readline');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// copy portname 
// 替換為你的設備名稱 (Windows 通常是 COMx 形式)
const port = new SerialPort({ path: 'COM3', baudRate: 9600 }, (err) => {
    if (err) {
        return console.log('Error opening port: ', err.message);
    }
});

// 錯誤事件監聽
port.on('error', function (err) {
    console.log('Error: ', err.message);
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('turnOnLight1', () => {
        port.write('1');
        setTimeout(() => {
            port.write('0');  // 3秒後關燈1
        }, 3000);
    });

    socket.on('turnOnLight2', () => {
        port.write('3');
        setTimeout(() => {
            port.write('2');  // 3秒後關燈2
        }, 3000);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// 解析 JSON 請求
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 使用路由
console.log('Before mounting achievements route');
app.use('/api/achievements', achievementRoutes);
console.log('After mounting achievements route');

app.use('/api/auth', authRoutes); // 使用 /api/auth 路由
app.use('/api', quizRoutes);
app.use('/api', lotteryRoutes);

// app.listen(5000, () => {
//     console.log('Server is running on http://localhost:5000');
// });

console.log("Quiz routes are set up");


// 設定靜態文件路徑，指向 'frontend/src' 目錄
app.use(express.static(path.join(__dirname, '../frontend/src')));

// 處理根路徑的 GET 請求
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/src', 'index_new.html'));
});

// 資料庫連接
mongoose.connect('mongodb://localhost:27017/web_easy', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

// 註冊功能
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ username, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, 'yourSecretKey', { expiresIn: 360000 });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 登入功能
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, 'yourSecretKey', { expiresIn: 360000 });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 添加測驗完成的路由，假設測驗完成後獲得10分
app.post('/completeQuiz', async (req, res) => {
    const { userId } = req.body;

    try {
        let user = await User.findById(userId);
        if (user) {
            user.points += 10; // 增加10分
            await user.save();
            return res.json({ msg: '測驗完成，積分增加10分', points: user.points });
        } else {
            return res.status(404).json({ msg: '用戶未找到' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 獲取用戶排行榜，按積分從高到低排序
app.get('/leaderboard', async (req, res) => {
    try {
        let users = await User.find().sort({ points: -1 }).limit(10); // 查詢積分最高的前10位用戶
        return res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/completeDailyChallenge', async (req, res) => {
    const { userId } = req.body;

    try {
        let user = await User.findById(userId);
        if (user && !user.dailyChallenge) {
            user.points += 20; // 增加20分
            user.dailyChallenge = true; // 標記每日挑戰已完成
            await user.save();
            return res.json({ msg: '每日挑戰完成，積分增加20分', points: user.points });
        } else if (user.dailyChallenge) {
            return res.status(400).json({ msg: '今日挑戰已完成' });
        } else {
            return res.status(404).json({ msg: '用戶未找到' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/unlockAchievement', async (req, res) => {
    const { userId, achievementId } = req.body;

    console.log(`userId: ${userId}, achievementId: ${achievementId}`);  // 新增日誌

    try {
        let user = await User.findById(userId);
        let achievement = await Achievement.findById(achievementId);

        if (user && achievement) {
            user.points += achievement.points; // 增加成就獎勵的積分
            if (!user.achievements) {
                user.achievements = [];
            }
            user.achievements.push(achievementId);
            await user.save();
            return res.json({ msg: '成就解鎖', points: user.points });
        } else {
            return res.status(404).json({ msg: '用戶或成就未找到' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


app.post('/updateProfile', async (req, res) => {
    const { userId, profileData } = req.body;

    try {
        let user = await User.findById(userId);
        if (user) {
            // 假設 profileData 包含用戶的所有新資料
            Object.assign(user, profileData);
            await user.save();
            return res.json({ msg: '資料更新成功', user });
        } else {
            return res.status(404).json({ msg: '用戶未找到' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 中間件的定義
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // if (token == null) return res.sendStatus(401); // 如果沒有 token，返回 401

    // jwt.verify(token, process.env.SECRET_KEY || 'your_jwt_secret', (err, user) => {
    //     if (err) return res.sendStatus(403); // 如果 token 無效，返回 403
    //     req.user = user; // 如果 token 有效，將用戶信息附加到請求對象
    //     next(); // 調用 next() 進入下一個中間件或路由處理程序
    // });
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (e) {
        res.status(403).json({ msg: 'Token is not valid' });
    }
}

// 配置 multer 用於圖片上傳
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 指定文件保存的文件夾
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 使用當前時間戳作為文件名
    }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));

// 回收日記路由
app.post('/api/recycling-diary', authMiddleware, async (req, res) => {
    try {
        console.log("Request body:", req.body); // 添加這一行來檢查請求體
        const { title, content, date } = req.body;
        const userId = req.user.id;

        const newDiaryEntry = new RecyclingDiary({
            userId,
            title,
            content,
            image: req.file ? req.file.path : null,  // 如果有圖片則存儲路徑
            date: date || new Date()
        });

        await newDiaryEntry.save();
        res.json({ msg: '日記已保存', diary: newDiaryEntry });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/api/recycling-diary', authMiddleware, async (req, res) => {
    try {
        const diaries = await RecyclingDiary.find({ userId: req.user.id });
        console.log('Diaries retrieved:', diaries); // 添加這行來檢查日誌
        res.json(diaries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.put('/api/recycling-diary/:id', authMiddleware, async (req, res) => {
    try {
        const { title, content, date } = req.body;
        const diary = await RecyclingDiary.findById(req.params.id);

        if (!diary) {
            return res.status(404).json({ msg: '日記未找到' });
        }

        if (diary.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: '無權編輯此日記' });
        }

        diary.title = title || diary.title;
        diary.content = content || diary.content;
        diary.date = date || diary.date;

        await diary.save();
        res.json({ msg: '日記已更新', diary });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.delete('/api/recycling-diary/:id', authMiddleware, async (req, res) => {
    try {
        const diary = await RecyclingDiary.findById(req.params.id);

        if (!diary) {
            return res.status(404).json({ msg: '日記未找到' });
        }

        if (diary.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: '無權刪除此日記' });
        }

        await diary.remove();
        res.json({ msg: '日記已刪除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 圖像分類路由
app.post('/classify_image', (req, res) => {
    // 假設 req.body 包含圖像資料
    const imageData = req.body.image;

    // 調用Google Gemini分類功能，這裡假設已經在某個模組中定義該功能
    googleGemini.classifyImage(imageData)
        .then(result => {
            res.json({ classification: result });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Image classification failed' });
        });
});

const Contact = require('./models/contactModel');

// 保存表單資料到 MongoDB 的路由
app.post('/send-message', async (req, res) => {
    try {
        console.log('Received request body:', req.body);  // 添加日誌來檢查請求體

        const { name, email, subject, message } = req.body;

        const newContact = new Contact({
            name,
            email,
            subject,
            message
        });

        await newContact.save(); // 保存到 MongoDB

        res.status(200).json({ message: '訊息已成功保存' });
    } catch (err) {
        console.error('Error saving contact:', err.message);
        res.status(500).json({ error: '無法保存訊息，請稍後再試' });
    }
});

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });

const subscribeRoutes = require('./subscribe'); // 根據實際路徑調整
app.use('/api', subscribeRoutes);

// 啟動伺服器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`伺服器運行在 http://localhost:${PORT}`));