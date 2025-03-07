// Game State (Persistent across pages via localStorage)
let user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest', credits: 0, fragments: [] };
let players = [
    { id: 1, username: 'Player1', credits: 150 },
    { id: 2, username: 'Player2', credits: 120 },
    { id: 3, username: 'NetCrusher', credits: 200 }
];
const puzzles = {
    edge: [
        { id: 1, type: 'cipher', question: 'KHOOR', solution: 'HELLO' },
        { id: 2, type: 'binary', question: '01001000 01101001', solution: 'HI' }
    ],
    deep: [
        { id: 3, type: 'sequence', question: '2, 4, 8, ?', solution: '16' }
    ],
    core: [
        { id: 4, type: 'trap', question: 'Solve: 3x + 5 = 14', solution: '3' }
    ]
};
const fragments = [
    { id: 1, act: 1, text: '2049: A global crash cripples all systems.' },
    { id: 2, act: 2, text: 'The Seed: An AI awakens in a lab.' }
];

// Page-Specific Logic
document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    updateUser();

    if (page === 'index.html') initHome();
    else if (page === 'profile.html') initProfile();
    else if (page === 'top-coders.html') initTopCoders();
    else if (page === 'puzzle.html') initPuzzle();
});

// Update User Data
function updateUser() {
    localStorage.setItem('user', JSON.stringify(user));
    const userInfoEls = document.querySelectorAll('#user-info');
    userInfoEls.forEach(el => el.textContent = `${user.username} | Credits: ${user.credits}`);
}

// Home Page
function initHome() {
    const newsList = document.getElementById('news-list');
    const news = [
        '03/07/2025: Chaos Event - Double Timers this weekend!',
        '03/06/2025: New Core Net puzzles added.'
    ];
    newsList.innerHTML = news.map(item => `<p>${item}</p>`).join('');
}

// Profile Page
function initProfile() {
    const rankEl = document.getElementById('rank');
    const fragmentList = document.getElementById('fragment-list');
    const allPlayers = [...players, { id: 0, username: user.username, credits: user.credits }];
    allPlayers.sort((a, b) => b.credits - a.credits);
    const rank = allPlayers.findIndex(p => p.username === user.username) + 1;
    rankEl.textContent = `Rank: ${rank} / ${allPlayers.length}`;
    fragmentList.innerHTML = user.fragments.map(f => `<li>${f.text}</li>`).join('');
}

// Top Coders Page
function initTopCoders() {
    const leaderboardList = document.getElementById('leaderboard-list');
    players.sort((a, b) => b.credits - a.credits);
    leaderboardList.innerHTML = players.map(p => `<li>${p.username}: ${p.credits}</li>`).join('');
}

// Puzzle Page
function initPuzzle() {
    let currentCore = 'edge';
    let currentPuzzle = null;
    let timerInterval;

    const elements = {
        userInfo: document.getElementById('user-info'),
        coreSelection: document.getElementById('core-selection'),
        gameArea: document.getElementById('game-area'),
        puzzle: document.getElementById('puzzle'),
        timer: document.getElementById('timer'),
        input: document.getElementById('solution-input'),
        submitBtn: document.getElementById('submit-btn'),
        sabotageTarget: document.getElementById('sabotage-target'),
        log: document.getElementById('log-list'),
        tutorial: document.getElementById('tutorial'),
        tutorialText: document.getElementById('tutorial-text')
    };

    document.querySelectorAll('.core-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCore = btn.dataset.core;
            startGame();
        });
    });

    elements.submitBtn.addEventListener('click', submitSolution);
    document.querySelectorAll('.sabotage-btn').forEach(btn => {
        btn.addEventListener('click', () => sabotage(btn.dataset.type));
    });

    function startGame() {
        elements.coreSelection.style.display = 'none';
        elements.gameArea.style.display = 'flex';
        loadPuzzle();
        pollGame();
    }

    function loadPuzzle() {
        const corePuzzles = puzzles[currentCore];
        currentPuzzle = corePuzzles[Math.floor(Math.random() * corePuzzles.length)];
        elements.puzzle.textContent = currentPuzzle.question;
        elements.input.value = '';
        const timerDuration = currentCore === 'edge' ? 180 : currentCore === 'deep' ? 120 : 60;
        startTimer(timerDuration);
        speakNetmind('Solve this, human.');
    }

    function startTimer(seconds) {
        let timeLeft = seconds;
        elements.timer.textContent = `Time: ${timeLeft}s`;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            elements.timer.textContent = `Time: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                logEvent('Time expired!');
                loadPuzzle();
            }
        }, 1000);
    }

    function submitSolution() {
        const solution = elements.input.value.trim().toLowerCase();
        if (solution === currentPuzzle.solution.toLowerCase()) {
            user.credits += 20;
            clearInterval(timerInterval);
            logEvent('Puzzle solved! +20 Credits');
            maybeAwardFragment();
            loadPuzzle();
        } else {
            logEvent('Incorrect solution.');
        }
        updateUser();
    }

    function sabotage(type) {
        const cost = { scramble: 20, fake_hint: 30, netmind_alert: 50 }[type];
        if (user.credits >= cost) {
            user.credits -= cost;
            const targetId = elements.sabotageTarget.value;
            logEvent(`Sabotaged Player ${targetId} with ${type}`);
            applySabotage(type); // Simulate on self
            updateUser();
            speakNetmind('Interference detected.');
        } else {
            logEvent('Not enough credits!');
        }
    }

    function applySabotage(type) {
        if (type === 'scramble') {
            elements.puzzle.textContent = elements.puzzle.textContent.split('').sort(() => Math.random() - 0.5).join('');
        }
    }

    function speakNetmind(message) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.pitch = 0.8;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }

    function maybeAwardFragment() {
        if (Math.random() < 0.3) {
            const fragment = fragments[Math.floor(Math.random() * fragments.length)];
            user.fragments.push(fragment);
            logEvent(`Fragment found: ${fragment.text}`);
            speakNetmind('A fragment of my past...');
        }
    }

    function logEvent(message) {
        elements.log.innerHTML += `<li>${new Date().toLocaleTimeString()}: ${message}</li>`;
    }

    function pollGame() {
        setInterval(() => {
            if (Math.random() < 0.05) {
                logEvent('Chaos Event: Double Timers!');
                speakNetmind('System instability detected.');
            }
        }, 2000);
    }

    if (!localStorage.getItem('tutorialDone')) {
        elements.tutorial.style.display = 'flex';
        let step = 0;
        const steps = [
            'Welcome, hacker! Click to solve: KHOOR (Shift 3 back = HELLO)',
            'Now try sabotaging a rival. Click a sabotage button.',
            'Collect Fragments to uncover the story. Start playing!'
        ];
        elements.tutorialText.textContent = steps[step];
        elements.tutorial.addEventListener('click', () => {
            step++;
            if (step >= steps.length) {
                elements.tutorial.style.display = 'none';
                localStorage.setItem('tutorialDone', 'true');
            } else {
                elements.tutorialText.textContent = steps[step];
                speakNetmind(steps[step]);
            }
        });
    }
}