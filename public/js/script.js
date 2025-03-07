let user = JSON.parse(localStorage.getItem('user')) || null;

document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (!user && page !== 'login.html') {
        window.location.href = 'login.html';
    } else {
        if (page === 'login.html') initLogin();
        else if (page === 'index.html') initHome();
        else if (page === 'profile.html') initProfile();
        else if (page === 'leaderboard.html') initLeaderboard();
        else if (page === 'puzzle.html') initPuzzle();
    }
    document.querySelectorAll('.logout').forEach(link => {
        link.addEventListener('click', () => {
            localStorage.removeItem('user');
            user = null;
        });
    });
});

function updateUser() {
    localStorage.setItem('user', JSON.stringify(user));
    const userInfoEls = document.querySelectorAll('#user-info');
    userInfoEls.forEach(el => el.textContent = `${user.username} | Credits: ${user.credits}`);
}

function initLogin() {
    const authForm = document.getElementById('auth-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const messageEl = document.getElementById('auth-message');

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        fetch('../server/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                user = data.user;
                updateUser();
                window.location.href = 'index.html';
            } else {
                messageEl.textContent = data.error;
            }
        });
    });

    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        fetch('../server/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                user = data.user;
                updateUser();
                window.location.href = 'index.html';
            } else {
                messageEl.textContent = data.error;
            }
        });
    });
}

function initHome() {
    fetch('../server/get_news.php')
    .then(response => response.json())
    .then(news => {
        const newsList = document.getElementById('news-list');
        newsList.innerHTML = news.map(item => `<p>${item.date}: ${item.content}</p>`).join('');
    });
    fetch('../server/get_daily_challenge.php')
    .then(response => response.json())
    .then(challenge => {
        const dailyText = document.getElementById('daily-text');
        const dailyBtn = document.getElementById('daily-btn');
        if (challenge.message) {
            dailyText.textContent = challenge.message;
            dailyBtn.style.display = 'none';
        } else {
            dailyText.textContent = `${challenge.question} (Reward: ${challenge.reward} Credits)`;
            dailyBtn.addEventListener('click', () => startDailyChallenge(challenge));
        }
    });
    updateUser();
}

function initProfile() {
    fetch('../server/get_profile.php')
    .then(response => response.json())
    .then(data => {
        if (data.error) return alert(data.error);
        user.credits = data.credits;
        document.getElementById('user-info').textContent = `${data.username} | Credits: ${data.credits}`;
        document.getElementById('rank').textContent = `Rank: ${data.rank} / ${data.total_players}`;
        document.getElementById('badge').textContent = data.badge;
        const fragmentList = document.getElementById('fragment-list');
        fragmentList.innerHTML = data.fragments.map(f => `<li>${f.text}</li>`).join('');
    });
    fetch('../server/get_achievements.php')
    .then(response => response.json())
    .then(achievements => {
        const achievementList = document.getElementById('achievement-list');
        achievementList.innerHTML = achievements.map(a => `<li>${a.name}: ${a.description} (${a.credits} Credits)</li>`).join('');
    });
}

function initLeaderboard() {
    fetch('../server/get_leaderboard.php')
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
        log: document.getElementById('log-list')
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
        elements.gameArea.style.display = 'block';
        loadPuzzle();
        pollGame();
        populateSabotageTargets();
    }

    function loadPuzzle() {
        fetch(`../server/get_puzzle.php?core=${currentCore}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) return alert(data.error);
            currentPuzzle = data.puzzle;
            elements.puzzle.textContent = data.puzzle.question;
            elements.input.value = '';
            startTimer(data.timer);
            if (data.countermeasure) applyCountermeasure(data.countermeasure);
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
        fetch('../server/submit_solution.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `puzzle_id=${currentPuzzle.id}&solution=${encodeURIComponent(solution)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                user.credits += data.credits;
                clearInterval(timerInterval);
                logEvent(`Puzzle solved! +${data.credits} Credits`);
                if (data.fragment) logEvent(`Fragment found: ${data.fragment.text}`);
                loadPuzzle();
                updateUser();
            } else {
                logEvent(data.message);
            }
        });
    }

    function sabotage(type) {
        const targetId = elements.sabotageTarget.value;
        fetch('../server/sabotage.php', {
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

    function applySabotage(type) {
        if (type === 'scramble') {
            elements.puzzle.textContent = elements.puzzle.textContent.split('').sort(() => Math.random() - 0.5).join('');
        } else if (type === 'code_freeze') {
            elements.input.disabled = true;
            setTimeout(() => elements.input.disabled = false, 5000);
        }
    }

    function logEvent(message) {
        elements.log.innerHTML += `<li>${new Date().toLocaleTimeString()}: ${message}</li>`;
    }

    function pollGame() {
        setInterval(() => {
            fetch('../server/poll.php')
            .then(response => response.json())
            .then(data => {
                if (data.error) return;
                if (data.sabotage.length) {
                    data.sabotage.forEach(s => {
                        applySabotage(s.type);
                        logEvent(`Sabotaged by Player ${s.sender_id}: ${s.type}`);
                    });
                }
                if (data.chaos) logEvent(`Chaos Event: ${data.chaos}`);
            });
        }, 2000);
    }

    function populateSabotageTargets() {
        fetch('../server/get_leaderboard.php')
        .then(response => response.json())
        .then(players => {
            elements.sabotageTarget.innerHTML = players
                .filter(p => p.username !== user.username)
                .map(p => `<option value="${p.id}">${p.username}</option>`).join('');
        });
    }

    updateUser();
}

function startDailyChallenge(challenge) {
    const solution = prompt(`Solve: ${challenge.question}`);
    if (solution && solution.toLowerCase() === challenge.solution.toLowerCase()) {
        user.credits += challenge.reward;
        updateUser();
        alert(`Challenge completed! +${challenge.reward} Credits`);
    } else {
        alert('Incorrect solution.');
    }
}