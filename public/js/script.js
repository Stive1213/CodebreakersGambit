// Game State
let user = { username: 'Guest', credits: 0, fragments: [] };
let currentCore = 'edge';
let currentPuzzle = null;
let timerInterval;
let players = [
    { id: 1, username: 'Player 1', credits: 50 },
    { id: 2, username: 'Player 2', credits: 30 }
];

// Puzzle Generator
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

// Fragments (Sample Story)
const fragments = [
    { id: 1, act: 1, text: '2049: A global crash cripples all systems.' },
    { id: 2, act: 2, text: 'The Seed: An AI awakens in a lab.' }
];

// DOM Elements
const elements = {
    userInfo: document.getElementById('user-info'),
    coreSelection: document.getElementById('core-selection'),
    gameArea: document.getElementById('game-area'),
    puzzle: document.getElementById('puzzle'),
    timer: document.getElementById('timer'),
    input: document.getElementById('solution-input'),
    submitBtn: document.getElementById('submit-btn'),
    sabotageTarget: document.getElementById('sabotage-target'),
    leaderboard: document.getElementById('leaderboard-list'),
    log: document.getElementById('log-list'),
    fragmentList: document.getElementById('fragment-list'),
    tutorial: document.getElementById('tutorial'),
    tutorialText: document.getElementById('tutorial-text')
};

// Start Core
document.querySelectorAll('.core-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentCore = btn.dataset.core;
        startGame();
    });
});

// Start Game
function startGame() {
    elements.coreSelection.style.display = 'none';
    elements.gameArea.style.display = 'flex';
    loadPuzzle();
    updateUI();
    pollGame(); // Simulate real-time
}

// Load Puzzle
function loadPuzzle() {
    const corePuzzles = puzzles[currentCore];
    currentPuzzle = corePuzzles[Math.floor(Math.random() * corePuzzles.length)];
    elements.puzzle.textContent = currentPuzzle.question;
    elements.input.value = '';
    const timerDuration = currentCore === 'edge' ? 180 : currentCore === 'deep' ? 120 : 60;
    startTimer(timerDuration);
    speakNetmind('Solve this, human.');
}

// Timer
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

// Submit Solution
elements.submitBtn.addEventListener('click', () => {
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
    updateUI();
});

// Sabotage
document.querySelectorAll('.sabotage-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const cost = { scramble: 20, fake_hint: 30, netmind_alert: 50 }[type];
        if (user.credits >= cost) {
            user.credits -= cost;
            const targetId = elements.sabotageTarget.value;
            logEvent(`Sabotaged Player ${targetId} with ${type}`);
            applySabotage(type); // Simulate on self for demo
            updateUI();
            speakNetmind('Interference detected.');
        } else {
            logEvent('Not enough credits!');
        }
    });
});

// Apply Sabotage (Demo)
function applySabotage(type) {
    if (type === 'scramble') {
        elements.puzzle.textContent = elements.puzzle.textContent.split('').sort(() => Math.random() - 0.5).join('');
    }
}

// Netmind Voice
function speakNetmind(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.pitch = 0.8;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

// Fragments
function maybeAwardFragment() {
    if (Math.random() < 0.3) { // 30% chance
        const fragment = fragments[Math.floor(Math.random() * fragments.length)];
        user.fragments.push(fragment);
        elements.fragmentList.innerHTML += `<li>${fragment.text}</li>`;
        speakNetmind('A fragment of my past...');
    }
}

// Update UI
function updateUI() {
    elements.userInfo.textContent = `${user.username} | Credits: ${user.credits}`;
    elements.leaderboard.innerHTML = players.map(p => `<li>${p.username}: ${p.credits}</li>`).join('');
}

// Log Events
function logEvent(message) {
    elements.log.innerHTML += `<li>${new Date().toLocaleTimeString()}: ${message}</li>`;
}

// Simulate Real-Time (Chaos Events)
function pollGame() {
    setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance per 2s
            const chaos = 'double_timers';
            logEvent('Chaos Event: Double Timers!');
            speakNetmind('System instability detected.');
        }
    }, 2000);
}

// Tutorial
if (!localStorage.getItem('tutorialDone')) {
    elements.tutorial.style.display = 'flex';
    let step = 0;
    const steps = [
        'Welcome, hacker! Click to solve: KHOOR (Shift 3 back = HELLO)',
        'Now try sabotaging a rival. Click a sabotage button.',
        'Collect Fragments to uncover the Netmind’s story. Start playing!'
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