
// ========= GLOBAL STATE & CORE VARS =========
const API = ""; 
let user = {}; let resType = ''; let currentCategory = ''; let lastResults = []; let currentType = ''; 
let pageCount = 1; let currentScreen = 'home';
let isAIModalOpen = false;

let currentChatId = localStorage.getItem("chat_uid") || createNewChatId();
let chatHistory = [];
let isTyping = false;

window.onload = async () => {
    if(localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');
    checkLogin();
    fetchLive();
    loadMessages();
    setInterval(loadMessages, 5000);
    
    injectV10UI(); // Chat history panel
    
    localStorage.setItem("chat_uid", currentChatId);
    await loadChatFromCloud();
    await loadRecentChats();
    initVoiceInput();
};

function createNewChatId() { return "chat_" + Date.now(); }

function injectV10UI() {
    document.body.insertAdjacentHTML("beforeend", `
    <div id="v10-home" style="position:fixed;top:0;left:0;width:100%;height:100%;background:var(--bg);color:var(--main);z-index:1999;overflow:auto;display:none;">
        <div style="padding:18px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee; background:var(--white);">
            <div style="display:flex; align-items:center; gap:10px;">
                <button onclick="closeV10Home()" style="background:none; border:none; font-size:22px; color:var(--blue); cursor:pointer;">⬅</button>
                <div style="font-size:20px;font-weight:900;color:var(--blue);">VidyaJobsAI HISTORY</div>
            </div>
        </div>
        <div style="padding:15px;font-size:12px;opacity:.7;font-weight:800;">RECENT CONVERSATIONS</div>
        <div id="recentChats" style="padding-bottom:100px;"></div>
        <button onclick="startNewChat()" style="position:fixed;right:20px;bottom:100px;background:var(--ai-gradient);color:#fff;border:none;padding:15px 20px;border-radius:40px;font-weight:900;font-size:14px;box-shadow:0 5px 15px rgba(0,0,0,0.2);z-index:2001;">+ NEW VidyaJobsAI CHAT</button>
    </div>
    `);
}

// AI Functions with VidyaJobsAI Label
function addBotMessage(text) {
    const body = document.getElementById("ai-chat-body");
    body.innerHTML += `<div class="chat-bubble bubble-left"><span class="chat-user">VidyaJobsAI</span>${formatMessage(text)}</div>`;
    body.scrollTop = body.scrollHeight;
}

// All other functions (saveLogin, showDash, askOpenRouter, etc.)
// ... (Exactly as provided in original but with Name updates)
