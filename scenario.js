<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>音の足跡、記憶の鼓動</title>
    <style>
        :root {
            --cyber-blue: #00f2ff;
            --cyber-pink: #ff00ff;
            --wa-indigo: rgba(13, 27, 42, 0.95);
        }
        body, html { margin: 0; padding: 0; width: 100%; height: 100dvh; background-color: #000; color: #ffffff; font-family: "Sawarabi Mincho", serif; display: flex; justify-content: center; align-items: center; overflow: hidden; }
        #game-container { position: relative; width: 100%; max-width: 500px; height: 100%; background-color: #050505; display: none; flex-direction: column; }
        #menu-bar { position: absolute; top: 45px; left: 0; right: 0; z-index: 6000; display: flex; gap: 5px; justify-content: flex-end; padding: 0 10px; }
        .menu-btn { background: rgba(0, 20, 40, 0.9); border: 1px solid var(--cyber-blue); color: var(--cyber-blue); padding: 8px 10px; cursor: pointer; font-size: 0.65rem; font-weight: bold; border-radius: 4px; box-shadow: 0 0 10px rgba(0, 242, 255, 0.4); }
        .btn-note { border-color: var(--cyber-pink); color: var(--cyber-pink); box-shadow: 0 0 10px rgba(255, 0, 255, 0.4); }
        #fader { position: absolute; inset: 0; background: #000; z-index: 8000; opacity: 0; pointer-events: none; transition: opacity 1.5s ease; }
        #fader.active { opacity: 1; pointer-events: auto; }
        #bg-area { flex: 1; width: 100%; background-image: url('img/haikei01.png'); background-size: cover; background-position: center; position: relative; overflow: hidden; transition: background-image 0.5s ease; }
        .chara-stand { position: absolute; z-index: 2; display: none; filter: drop-shadow(0 0 15px #000); pointer-events: none; }
        .human-stand { height: 82%; bottom: -5px; left: 50%; transform: translateX(-50%); }
        .mascot-stand { height: 35%; bottom: 12%; right: 25px; }

        /* --- GPS Layer 修正なし版 --- */
        #gps-layer { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); z-index: 10; display: none; flex-direction: column; align-items: center; }
        .radar { position: relative; width: 240px; height: 240px; border: 2px solid var(--cyber-blue); border-radius: 50%; background-color: #050a10; background-image: radial-gradient(circle, rgba(0, 242, 255, 0.1) 0%, rgba(0, 0, 0, 0.7) 85%); overflow: hidden; box-shadow: 0 0 20px rgba(0, 242, 255, 0.3); }
        .radar-map-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(0, 242, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 255, 0.05) 1px, transparent 1px); background-size: 20px 20px; background-position: center; }
        .map-road { position: absolute; background: rgba(0, 242, 255, 0.15); }
        .road-main { top: 0; left: 40%; width: 20px; height: 100%; transform: rotate(10deg); }
        .road-sub { top: 55%; left: 0; width: 100%; height: 12px; transform: rotate(-5deg); }
        .map-building { position: absolute; background: rgba(0, 242, 255, 0.1); border: 1px solid rgba(0, 242, 255, 0.3); }
        .b-1 { top: 20%; left: 15%; width: 40px; height: 50px; }
        .b-2 { top: 15%; left: 65%; width: 30px; height: 70px; }
        .b-3 { top: 45%; left: 45%; width: 45px; height: 25px; }
        .b-4 { top: 75%; left: 20%; width: 35px; height: 35px; }
        .radar-location-name { position: absolute; top: 58%; left: 50%; transform: translate(-50%, -50%); color: var(--cyber-blue); font-family: sans-serif; font-size: 0.85rem; font-weight: 900; letter-spacing: 0.15em; text-shadow: 0 0 8px var(--cyber-blue); white-space: nowrap; z-index: 6; }
        .radar-sweep { position: absolute; inset: 0; background: conic-gradient(from 0deg, transparent 70%, rgba(0, 242, 255, 0.2) 100%); animation: rotate-radar 4s linear infinite; }
        .radar-target { position: absolute; top: 62%; left: 52%; width: 10px; height: 10px; background-color: var(--cyber-pink); border-radius: 50%; box-shadow: 0 0 15px var(--cyber-pink); animation: blink-target 1s infinite; z-index: 7; }
        @keyframes rotate-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink-target { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }

        #msg-window { height: 32%; width: 100%; background: var(--wa-indigo); border-top: 2px solid var(--cyber-blue); padding: 20px 25px; box-sizing: border-box; cursor: pointer; z-index: 5; position: relative; display: none; }
        #message-text { font-size: 1rem; line-height: 1.6; white-space: pre-wrap; }
        .full-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.98); z-index: 9500; display: none; flex-direction: column; padding: 60px 25px; }
        .btn-cyber { padding: 12px 35px; background: transparent; color: var(--cyber-blue); border: 1px solid var(--cyber-blue); cursor: pointer; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0% 100%); }
        .flash-red { animation: fr 0.3s ease; } @keyframes fr { 0% { background: rgba(255,0,0,0.5); } 100% { background: transparent; } }
        .flash-green { animation: fg 0.4s ease; } @keyframes fg { 0% { background: rgba(0,255,170,0.5); } 100% { background: transparent; } }
        .note-item { border-bottom: 1px solid #333; padding: 10px 0; }
        .note-title { color: var(--cyber-pink); font-weight: bold; font-size: 0.9rem; }
        .note-body { font-size: 0.8rem; color: #ccc; margin-top: 5px; }
    </style>
</head>
<body>

<audio id="bgm" src="music/intro.mp3" loop></audio>
<div id="fader"></div>

<div id="password-screen" style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; background: #000; padding: 20px;">
    <p style="color: var(--cyber-blue); margin-bottom:10px;">SYSTEM CHECK</p>
    <input type="password" id="pw-field" placeholder="PASSCODE" style="background: rgba(0, 242, 255, 0.1); border: 1px solid var(--cyber-blue); color: #fff; padding: 12px; text-align: center; margin-bottom: 20px; width: 80%;">
    <button class="btn-cyber" onclick="checkPassword()">認証</button>
</div>

<div id="game-container">
    <div id="menu-bar">
        <button class="menu-btn btn-note" onclick="openNote()">📓 NOTE</button>
        <button class="menu-btn" onclick="openLog()">LOG</button>
        <button class="menu-btn" onclick="resetGame()">RESET</button>
    </div>
    <div id="note-screen" class="full-overlay"><h2>DEVELOPER NOTE</h2><div id="note-content" style="flex:1; overflow-y:auto;"></div><button class="btn-cyber" onclick="closeNote()">CLOSE</button></div>
    <div id="log-screen" class="full-overlay"><h2>BACK LOG</h2><div id="log-content" style="flex:1; overflow-y:auto;"></div><button class="btn-cyber" onclick="closeLog()">CLOSE</button></div>
    <div id="title-screen" style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 100; background: #000;"><h1>音の足跡、<br>記憶の鼓動</h1><button class="btn-cyber" onclick="startGame()">START</button></div>
    <div id="bg-area">
        <div id="effect-layer" style="position:absolute; inset:0; pointer-events:none; z-index:3;"></div>
        <div id="gps-layer"><div class="radar"><div class="radar-map-grid"></div><div class="map-road road-main"></div><div class="map-road road-sub"></div><div class="map-building b-1"></div><div class="map-building b-2"></div><div class="map-building b-3"></div><div class="map-building b-4"></div><div class="radar-location-name" id="loc-text"></div><div class="radar-sweep"></div><div class="radar-target"></div></div></div>
        <img id="haruto-stand" class="chara-stand human-stand" src="img/haruto01.png">
        <img id="kage-stand" class="chara-stand human-stand" src="img/kage01.png">
        <img id="kodou-stand" class="chara-stand mascot-stand" src="img/kodou01.png">
    </div>
    <div id="msg-window" onclick="nextScene()">
        <div id="speaker-name" style="font-weight:bold; color:var(--cyber-blue); margin-bottom:8px; height:1.2em;"></div>
        <div id="message-text"></div>
    </div>
</div>

<script src="scenario.js"></script>
<script>
    const SECRET_KEY = "2026";
    const bgm = document.getElementById('bgm');
    const fader = document.getElementById('fader');
    let currentStep = 0, isTyping = false, typingTimer, chatHistory = [], unlockedNotes = [];

    function checkPassword() {
        if (document.getElementById('pw-field').value === SECRET_KEY) {
            document.getElementById('password-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'flex';
            loadGame();
        } else { alert("認証エラー"); }
    }

    function startGame() {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('msg-window').style.display = 'block';
        bgm.play().catch(()=>{});
        showText();
    }

    function playOpeningVideo() {
        saveGame();
        fader.classList.add('active');
        setTimeout(() => { window.location.href = "video.html"; }, 1000);
    }

    function showText() {
        if (currentStep >= scenario.length) return;
        const data = scenario[currentStep];
        if (data.note && !unlockedNotes.some(n => n.id === data.note.id)) unlockedNotes.push(data.note);
        
        const nameEl = document.getElementById('speaker-name'), textEl = document.getElementById('message-text');
        chatHistory.push({ name: data.name, text: data.text });
        nameEl.innerText = (data.name === "システム" || data.name === "駅アナウンス" || data.name === "システム音声") ? "" : data.name;
        textEl.innerText = ""; isTyping = true;
        updateVisuals(data); saveGame();

        let i = 0; clearInterval(typingTimer);
        typingTimer = setInterval(() => {
            if (i < data.text.length) { textEl.innerText += data.text.charAt(i++); }
            else { clearInterval(typingTimer); isTyping = false; if (data.videoTrigger) setTimeout(playOpeningVideo, 1200); }
        }, 40);
    }

    function updateVisuals(data) {
        if (data.bg) document.getElementById('bg-area').style.backgroundImage = `url('img/${data.bg}.png')`;
        document.getElementById('haruto-stand').style.display = "none";
        document.getElementById('kage-stand').style.display = "none";
        document.getElementById('kodou-stand').style.display = "none";
        document.getElementById('gps-layer').style.display = (data.effect === "gps") ? "flex" : "none";
        if (data.loc) document.getElementById('loc-text').innerText = data.loc;
        if (data.chara === "haruto") document.getElementById('haruto-stand').style.display = "block";
        if (data.chara === "kage") document.getElementById('kage-stand').style.display = "block";
        if (data.chara === "kodou") document.getElementById('kodou-stand').style.display = "block";
        if (data.chara === "haruto_kodou") { document.getElementById('haruto-stand').style.display = "block"; document.getElementById('kodou-stand').style.display = "block"; }
        const layer = document.getElementById('effect-layer');
        if (data.effect === "error") { layer.classList.add('flash-red'); setTimeout(()=>layer.classList.remove('flash-red'), 300); }
        if (data.effect === "success") { layer.classList.add('flash-green'); setTimeout(()=>layer.classList.remove('flash-green'), 400); }
    }

    function nextScene() {
        if (isTyping) { clearInterval(typingTimer); document.getElementById('message-text').innerText = scenario[currentStep].text; isTyping = false; return; }
        if (scenario[currentStep].videoTrigger) { playOpeningVideo(); return; }
        currentStep++; showText();
    }

    function openNote() {
        document.getElementById('note-content').innerHTML = unlockedNotes.map(n => `<div class="note-item"><div class="note-title">■ ${n.title}</div><div class="note-body">${n.body}</div></div>`).reverse().join('');
        document.getElementById('note-screen').style.display = 'flex';
    }
    function closeNote() { document.getElementById('note-screen').style.display = 'none'; }
    function openLog() { document.getElementById('log-content').innerHTML = chatHistory.map(h => `<div><b>${h.name}</b>: ${h.text}</div>`).join(''); document.getElementById('log-screen').style.display = 'flex'; }
    function closeLog() { document.getElementById('log-screen').style.display = 'none'; }
    function resetGame() { if(confirm("RESET?")) { localStorage.removeItem('cyber_puzzle_save'); location.reload(); } }
    function saveGame() { localStorage.setItem('cyber_puzzle_save', JSON.stringify({ step: currentStep, history: chatHistory, notes: unlockedNotes })); }
    function loadGame() {
        const saved = localStorage.getItem('cyber_puzzle_save');
        if (saved) {
            const data = JSON.parse(saved); currentStep = data.step; chatHistory = data.history; unlockedNotes = data.notes;
            if (currentStep > 0) document.getElementById('start-btn').innerText = "CONTINUE";
        }
    }

    window.onload = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'after_video') {
            loadGame();
            document.getElementById('password-screen').style.display = 'none';
            document.getElementById('title-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'flex';
            document.getElementById('msg-window').style.display = 'block';
            currentStep++; showText();
        }
    };
</script>
</body>
</html>