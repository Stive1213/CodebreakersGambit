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
    userInfoEls.forEach(el => el.textContent = `${user.username} | Credits: ${user.credits} | Level: ${user.level || 1}`);
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
        user.level = data.level;
        document.getElementById('user-info').textContent = `${data.username} | Credits: ${data.credits} | Level: ${data.level}`;
        document.getElementById('rank').textContent = `Rank: ${data.rank} / ${data.total_players}`;
        document.getElementById('level').textContent = data.level;
        document.getElementById('badge').textContent = data.badge;
        document.getElementById('streak').textContent = data.streak;
        const fragmentList = document.getElementById('fragment-list');
        fragmentList.innerHTML = data.fragments.map(f => `<li>${f.text}</li>`).join('');
        const solvedList = document.getElementById('solved-list');
        solvedList.innerHTML = data.solved_puzzles.length ? 
            data.solved_puzzles.map(p => `<li>${p.question} (${p.type}, ${p.core}${p.language ? `, ${p.language}` : ''})</li>`).join('') : 
            '<li>No puzzles solved yet.</li>';
    })
    .catch(error => console.error('Profile fetch error:', error));
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
    let currentLanguage = 'all';
    let currentPuzzle = null;
    let timerInterval;

    const elements = {
        userInfo: document.getElementById('user-info'),
        coreSelection: document.getElementById('core-selection'),
        languageSelect: document.getElementById('language-select'),
        gameArea: document.getElementById('game-area'),
        puzzle: document.getElementById('puzzle'),
        timer: document.getElementById('timer'),
        input: document.getElementById('solution-input'),
        submitBtn: document.getElementById('submit-btn'),
        hintBtn: document.getElementById('hint-btn'),
        sabotageTarget: document.getElementById('sabotage-target'),
        log: document.getElementById('log-list'),
        puzzleBox: document.querySelector('.puzzle-box')
    };

    document.querySelectorAll('.core-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCore = btn.dataset.core;
            startGame();
        });
    });

    elements.languageSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        if (elements.gameArea.style.display === 'block') loadPuzzle();
    });

    elements.submitBtn.addEventListener('click', submitSolution);
    elements.hintBtn.addEventListener('click', getHint);
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
        fetch(`../server/get_puzzle.php?core=${currentCore}&language=${currentLanguage}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) return alert(data.error);
            if (data.message) {
                elements.puzzle.textContent = data.message;
                elements.input.style.display = 'none';
                elements.submitBtn.style.display = 'none';
                elements.hintBtn.style.display = 'none';
            } else {
                currentPuzzle = data.puzzle;
                elements.puzzle.textContent = data.puzzle.question;
                elements.input.value = '';
                elements.input.style.display = 'inline';
                elements.submitBtn.style.display = 'inline';
                elements.hintBtn.style.display = 'inline';
                startTimer(data.timer);
                if (data.countermeasure) applyCountermeasure(data.countermeasure);
            }
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
                user.level = Math.floor(user.credits / 100) + 1;
                clearInterval(timerInterval);
                logEvent(`Puzzle solved! +${data.credits} Credits`);
                if (data.fragment) logEvent(`Fragment found: ${data.fragment.text}`);
                elements.submitBtn.classList.add('success');
                elements.puzzleBox.classList.add('success');
                setTimeout(() => {
                    elements.submitBtn.classList.remove('success');
                    elements.puzzleBox.classList.remove('success');
                    loadPuzzle();
                }, 1000);
                updateUser();
            } else {
                logEvent(data.message);
            }
        });
    }

    function getHint() {
        fetch('../server/get_hint.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `puzzle_id=${currentPuzzle.id}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                logEvent(`Hint: ${data.hint}`);
                user.credits = data.remaining_credits;
                updateUser();
            } else {
                logEvent(data.error);
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
        user.level = Math.floor(user.credits / 100) + 1;
        updateUser();
        alert(`Challenge completed! +${challenge.reward} Credits`);
    } else {
        alert('Incorrect solution.');
    }
}