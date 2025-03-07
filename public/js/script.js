let user = null;

document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (!user) loginPrompt();
    else {
        if (page === 'index.html') initHome();
        else if (page === 'profile.html') initProfile();
        else if (page === 'top-coders.html') initTopCoders();
        else if (page === 'puzzle.html') initPuzzle();
    }
});

function loginPrompt() {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    fetch('server/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${username}&password=${password}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            user = data.user;
            localStorage.setItem('user', JSON.stringify(user));
            window.location.reload();
        } else {
            alert(data.error);
            loginPrompt();
        }
    });
}

function updateUser() {
    const userInfoEls = document.querySelectorAll('#user-info');
    userInfoEls.forEach(el => el.textContent = `${user.username} | Credits: ${user.credits}`);
}

function initHome() {
    fetch('server/get_news.php')
    .then(response => response.json())
    .then(news => {
        const newsList = document.getElementById('news-list');
        newsList.innerHTML = news.map(item => `<p>${item.date}: ${item.content}</p>`).join('');
    });
    updateUser();
}

function initProfile() {
    fetch('server/get_profile.php')
    .then(response => response.json())
    .then(data => {
        if (data.error) return alert(data.error);
        user.credits = data.credits;
        document.getElementById('user-info').textContent = `${data.username} | Credits: ${data.credits}`;
        document.getElementById('rank').textContent = `Rank: ${data.rank} / ${data.total_players}`;
        const fragmentList = document.getElementById('fragment-list');
        fragmentList.innerHTML = data.fragments.map(f => `<li>${f.text}</li>`).join('');
    });
}

function initTopCoders() {
    fetch('server/get_leaderboard.php')
    .then(response => response.json())
    .then(leaderboard => {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = leaderboard.map(p => `<li>${p.username}: ${p.credits}</li>`).join('');
    });
    updateUser();
}

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
        fetch(`server/get_puzzle.php?core=${currentCore}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) return alert(data.error);
            currentPuzzle = data.puzzle;
            elements.puzzle.textContent = data.puzzle.question;
            elements.input.value = '';
            startTimer(data.timer);
            if (data.countermeasure) applyCountermeasure(data.countermeasure);
            speakNetmind('Solve this, human.');
        });
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
        const solution = elements.input.value.trim();
        fetch('server/submit_solution.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `puzzle_id=${currentPuzzle.id}&solution=${solution}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                user.credits += data.credits;
                clearInterval(timerInterval);
                logEvent(`Puzzle solved! +${data.credits} Credits`);
                if (data.fragment) {
                    logEvent(`Fragment found: ${data.fragment.text}`);
                    speakNetmind('A fragment of my past...');
                }
                loadPuzzle();
                updateUser();
            } else {
                logEvent(data.message);
            }
        });
    }

    function sabotage(type) {
        const targetId = elements.sabotageTarget.value;
        fetch('server/sabotage.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `target_id=${targetId}&type=${type}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                user.credits = data.remaining_credits;
                logEvent(`Sabotaged Player ${targetId} with ${type}`);
                updateUser();
                speakNetmind('Interference detected.');
            } else {
                logEvent(data.error);
            }
        });
    }

    function applyCountermeasure(type) {
        if (type === 'reverse_input') {
            elements.input.addEventListener('input', () => {
                elements.input.value = elements.input.value.split('').reverse().join('');
            });
        }
    }

    function speakNetmind(message) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.pitch = 0.8;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }

    function logEvent(message) {
        elements.log.innerHTML += `<li>${new Date().toLocaleTimeString()}: ${message}</li>`;
    }

    function pollGame() {
        setInterval(() => {
            fetch('server/poll.php')
            .then(response => response.json())
            .then(data => {
                if (data.sabotage.length) {
                    data.sabotage.forEach(s => {
                        applySabotage(s.type);
                        logEvent(`Sabotaged by Player ${s.sender_id}: ${s.type}`);
                    });
                }
                if (data.chaos) {
                    logEvent(`Chaos Event: ${data.chaos}`);
                    speakNetmind('System instability detected.');
                }
            });
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