    // ★ここを自分のGASのURLに書き換えてください
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzY2JQzKr72WeXjjtTz7NmamNDZyyc1SXpkOmRQTVISQUXdL9BhWUPY_eMd9UV-QMfR/exec";

let currentDay = '';
let selectedMood = '😐';
let selectedActivity = '';
const database = {};

    // 1. カレンダー作成
function createCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    for (let i = 1; i <= 30; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        if (database[i]) dayDiv.classList.add('has-data');
        dayDiv.innerText = i;
        dayDiv.onclick = () => openEntry(i);
        grid.appendChild(dayDiv);
    }
}

// openEntry関数を更新
function openEntry(day) {
    currentDay = day;
    // 日付だけをセット
    document.getElementById('displayDate').innerText = `4月 ${day}日`;
    
    const entry = database[day] || { mood: '😐', activity: '', memo: '', time: '' };
    document.getElementById('memo').value = entry.memo;
    
    selectedMood = entry.mood;
    selectedActivity = entry.activity || '';

    // 時刻のセット
    let targetTime = entry.time;
    if (!targetTime) {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        targetTime = `${hh}:${mm}`;
    }
    
    // タイトルの中にある入力欄にセット
    document.getElementById('entryTime').value = targetTime;

    resetMoodButtons(selectedMood);
    resetActivityButtons(selectedActivity);
    showPage('entryPage');
}

    // 3. 気分を選択したときの処理（アラートなし）
function setMood(emoji, element) {
    selectedMood = emoji;
        // 全ボタンから選択クラスを消して、クリックしたものだけに付ける
    document.querySelectorAll('.mood-item').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
}
// できごとを選択した時の関数
function setActivity(emoji, element) {
    selectedActivity = emoji;
    document.querySelectorAll('.activity-item').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
}


    // 4. ボタンの見た目をリセットする
function resetMoodButtons(activeEmoji) {
    document.querySelectorAll('.mood-item').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.querySelector('.emoji').innerText === activeEmoji) {
            btn.classList.add('selected');
        }
    });
}

// できごとボタンのリセット用関数
function resetActivityButtons(activeEmoji) {
    document.querySelectorAll('.activity-item').forEach(btn => {
        btn.classList.remove('selected');
        // ボタン内のテキスト（絵文字）が含まれているかチェック
        if (btn.innerText.includes(activeEmoji) && activeEmoji !== '') {
            btn.classList.add('selected');
        }
    });
}

    // 5. 保存処理（爆速・楽観的UI版）
async function saveData() {
    const year = 2026;
    const month = "04";
    const dayStr = String(currentDay).padStart(2, '0');
    const dateKey = `${year}${month}${dayStr}`; 

    const data = {
        date: dateKey,
        time: document.getElementById('entryTime').value || "", 
        mood: selectedMood || "😐",
        activity: selectedActivity || "",
        memo: document.getElementById('memo').value || ""
    };

        // 先に画面を更新（爆速！）
    database[currentDay] = data;
    createCalendar();
    showPage('calendarPage');

        // 裏で送信
    try {
        await fetch(GAS_URL, { method: "POST", body: JSON.stringify(data) });
    } catch (e) {
        alert("保存に失敗しました。ネット環境を確認してください。");
    }
}


    // 6. データ読み込み（GET）
async function loadData() {
    try {
        const response = await fetch(GAS_URL);
        const data = await response.json();
        data.forEach(item => {
            const day = parseInt(item.date.slice(-2)); 
            database[day] = item;
        });
        createCalendar();
    } catch (e) { console.error("読み込み失敗", e); }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

    // 起動時に読み込み
window.onload = loadData;