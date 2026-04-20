// ========= VidyaJobs.AI CORE LOGIC (V10 PRO) =========
let user = {}; 
let resType = ''; 
let currentCategory = ''; 
let lastResults = []; 
let currentType = ''; 
let pageCount = 1; 
let currentScreen = 'home';
let isAIModalOpen = false;

// AI & Cloud Chat State
let currentChatId = localStorage.getItem("chat_uid") || "chat_" + Date.now();
let chatHistory = [];
let isTyping = false;

window.onload = async () => {
    // Theme Check
    if(localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    checkLogin();
    fetchLive();
    loadMessages(); // Community Chat
    
    // UI Initialization
    localStorage.setItem("chat_uid", currentChatId);
    initVoiceInput();
};

// --- AUTH & PROFILE ---
function checkLogin() {
    const saved = localStorage.getItem('vidya_user');
    if(saved) {
        user = JSON.parse(saved);
        showDash();
    } else {
        document.getElementById('login-sec').classList.remove('hidden');
    }
}

function saveLogin() {
    const name = document.getElementById('u-name').value;
    if(!name) return alert("Bhai naam to daal do!");
    
    user = { name: name, edu: selectedEdu };
    localStorage.setItem('vidya_user', JSON.stringify(user));
    document.getElementById('login-sec').classList.add('hidden');
    showDash();
}

let selectedEdu = [];
function toggleEdu(el, val) {
    el.classList.toggle('active');
    if(selectedEdu.includes(val)) {
        selectedEdu = selectedEdu.filter(i => i !== val);
    } else {
        selectedEdu.push(val);
    }
}

// --- NAVIGATION ---
function showDash() {
    hideAll();
    document.getElementById('dash-sec').classList.remove('hidden');
    document.getElementById('main-header').classList.remove('hidden');
    document.getElementById('bottom-bar').classList.remove('hidden');
    updateInitial();
}

function showResults() {
    hideAll();
    document.getElementById('res-sec').classList.remove('hidden');
}

function hideAll() {
    const sections = ['login-sec', 'dash-sec', 'res-sec', 'feed-sec', 'chat-sec', 'resume-sec', 'v10-ultra-dash'];
    sections.forEach(s => document.getElementById(s).classList.add('hidden'));
}

function updateInitial() {
    const initial = user.name ? user.name[0].toUpperCase() : 'U';
    document.getElementById('user-initial').innerText = initial;
}

// --- MAGADH UNIVERSITY LOGIC ---
function toggleResSub(id) {
    const subs = ['sub-magadh', 'sub-bihar-board', 'sub-railway', 'sub-ssc', 'sub-police'];
    subs.forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById('sub-' + id).classList.remove('hidden');
}

function updateMUSemButtons() {
    const session = document.getElementById('mu-session').value;
    const semCont = document.getElementById('mu-sem-container');
    const partCont = document.getElementById('mu-part-container');
    
    if(session === '2024-28' || session === '2023-27' || session === '2022-26') {
        semCont.classList.remove('hidden');
        partCont.classList.add('hidden');
    } else if(session) {
        semCont.classList.add('hidden');
        partCont.classList.remove('hidden');
    }
}

function setResType(btn, type) {
    const pills = document.querySelectorAll('.pill');
    pills.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    resType = type;
}

function muAction(action) {
    const session = document.getElementById('mu-session').value;
    if(!session || !resType) return alert("Session aur Part/Sem select karein!");
    
    const query = `Magadh University ${session} ${resType} ${action} 2026`;
    openJobs(query);
}

// --- SEARCH & API ---
async function openJobs(query) {
    hideAll();
    document.getElementById('feed-sec').classList.remove('hidden');
    document.getElementById('f-title').innerText = "SEARCHING...";
    document.getElementById('list').innerHTML = '<div class="btn-load">VidyaJobs AI searching...</div>';
    
    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        lastResults = data;
        renderList(data);
    } catch (e) {
        document.getElementById('list').innerHTML = "Bhai error aa gaya!";
    }
}

function renderList(items) {
    document.getElementById('f-title').innerText = "RESULTS FOUND";
    let html = '';
    items.forEach((item, index) => {
        html += `
            <div class="job-card" onclick="viewDetails(${index})">
                <div style="font-weight:800; color:var(--blue);">${item.title}</div>
                <div style="font-size:11px; margin-top:5px; color:var(--text-muted);">${item.snippet.substring(0, 80)}...</div>
            </div>
        `;
    });
    document.getElementById('list').innerHTML = html || "No results found.";
}

function viewDetails(index) {
    const item = lastResults[index];
    window.open(item.link, '_blank');
}

// --- AI CHAT (VidyaJobs AI) ---
function openV10Home() {
    document.getElementById('ai-modal').style.display = 'block';
    isAIModalOpen = true;
}

function backHomeV10() {
    document.getElementById('ai-modal').style.display = 'none';
    isAIModalOpen = false;
}

async function askOpenRouter() {
    const input = document.getElementById("ai-input");
    const msg = input.value.trim();
    if (!msg) return;

    addUserMessage(msg);
    input.value = "";
    showTyping();

    try {
        const res = await fetch("/ask_ai_v10", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: currentChatId, message: msg })
        });
        const data = await res.json();
        hideTyping();
        addBotMessage(data.reply);
    } catch (err) {
        hideTyping();
        addBotMessage("Sorry bhai, server error.");
    }
}

function addUserMessage(text) {
    const cont = document.getElementById('ai-chat-body');
    cont.innerHTML += `<div class="v8-msg user"><b>You:</b><br>${text}</div>`;
    cont.scrollTop = cont.scrollHeight;
}

function addBotMessage(text) {
    const cont = document.getElementById('ai-chat-body');
    cont.innerHTML += `<div class="v8-msg bot"><b>VidyaJobs AI:</b><br>${text}</div>`;
    cont.scrollTop = cont.scrollHeight;
}

function showTyping() {
    isTyping = true;
    const cont = document.getElementById('ai-chat-body');
    cont.innerHTML += `<div id="typing" class="v8-msg bot">Thinking...</div>`;
}

function hideTyping() {
    const t = document.getElementById('typing');
    if(t) t.remove();
}

// --- UI HELPERS ---
function toggleMenu() {
    document.getElementById('sideMenu').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function logout() {
    localStorage.removeItem('vidya_user');
    location.reload();
}

// Community Chat Dummy Logic
function loadMessages() {
    const cont = document.getElementById('chat-display');
    cont.innerHTML = '<div style="text-align:center; color:gray; font-size:12px;">Welcome to VidyaJobs Community</div>';
}

function showCommunityChat() {
    hideAll();
    document.getElementById('chat-sec').classList.remove('hidden');
}

function showResumeSection() {
    hideAll();
    document.getElementById('resume-sec').classList.remove('hidden');
    toggleMenu();
}

// ... Additional V10 Ultra Tools (OCR/PDF) can be added here ...
