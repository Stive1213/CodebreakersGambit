

# Codebreaker's Gambit

**A dynamic, level-based puzzle game built with PHP, MySQL, JavaScript, and HTML/CSS**

---

## Overview

**Codebreaker's Gambit** is an engaging web-based game where players take on the role of hackers infiltrating "Netmind," a fictional AI-controlled network. Through solving diverse puzzles, players earn credits, level up, and uncover story fragments. The game uses a RESTful API to connect its front-end and back-end, demonstrating expertise in full-stack development, database management, and real-time gameplay mechanics.

### Key Highlights
- **Back-End**: PHP, MySQL, API development
- **Front-End**: JavaScript, HTML5, CSS3
- **Game Logic**: Level progression, randomization, unsolved puzzle filtering
- **DevOps**: Local deployment with XAMPP

---

## Features

- **Puzzle Variety**: Over 50 puzzles across five categories:
  - *Ciphers*: e.g., "KHOOR" → "HELLO"
  - *Binary*: e.g., "01001000" → "H"
  - *Sequences*: e.g., "1, 3, 5, ?" → "7"
  - *Traps*: e.g., "2x + 3 = 7" → "2"
  - *Coding Challenges*: Python, Java, JavaScript, C++
- **Level Progression**: Puzzles scale with player level (difficulty ≤ level + 1)
- **Unsolved Puzzle Filter**: Ensures only new challenges appear
- **Sabotage System**: Disrupt opponents with "Scramble," "Code Freeze," and more
- **Daily Challenges**: Time-limited puzzles for bonus credits
- **Leaderboard**: Real-time ranking based on credits
- **Fragments**: Collectible narrative pieces revealing Netmind’s story
- **API-Driven**: RESTful API connects front-end and back-end seamlessly

---

## Tech Stack

### Front-End
- HTML5, CSS3 (`style.css`)
- JavaScript (ES6, `script.js`)

### Back-End
- PHP 8.x (API endpoints in `server/` folder)
- MySQL (MariaDB) for persistent storage

### Connectivity
- RESTful API for front-end/back-end interaction

### Tools
- XAMPP for local development
- Git for version control

---

## Installation

### Prerequisites
- [XAMPP](https://www.apachefriends.org/index.html) (Apache, MySQL, PHP)
- [Git](https://git-scm.com/)
- Web browser (e.g., Chrome, Firefox)

### Setup Instructions
1. **Clone the Repository**  
   ```bash
   git clone https://github.com/stive1213/CodebreakersGambit.git
   cd CodebreakersGambit
   ```

2. **Deploy to XAMPP**  
   - Copy the `CodebreakersGambit` folder to `C:\xampp\htdocs\`.

3. **Configure the Database**  
   - Start XAMPP and enable Apache and MySQL.
   - Open `http://localhost/phpmyadmin`.
   - Create a database named `codebreaker_db`.
   - Import `database.sql` (or use the SQL from [Database Setup](#database-setup)).

4. **Update Database Connection**  
   - Edit `server/db_connect.php` if credentials differ:  
     ```php
     $pdo = new PDO("mysql:host=localhost;dbname=codebreaker_db", "root", "");
     ```

5. **Run the Application**  
   - Open `http://localhost/CodebreakersGambit/public/login.html`.
   - Register a new user to begin.

---

## Database Setup

Run this SQL in phpMyAdmin to set up the database:

```sql
CREATE DATABASE codebreaker_db;
USE codebreaker_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    credits INT DEFAULT 0,
    level INT DEFAULT 1,
    fragments_collected TEXT DEFAULT '',
    achievements TEXT DEFAULT '',
    solved_puzzles TEXT DEFAULT '',
    badge VARCHAR(50) DEFAULT 'Rookie',
    last_login DATE DEFAULT NULL,
    streak INT DEFAULT 0,
    act_progress INT DEFAULT 0
);

CREATE TABLE puzzles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    question TEXT NOT NULL,
    solution TEXT NOT NULL,
    core VARCHAR(10) NOT NULL,
    difficulty INT DEFAULT 1,
    language VARCHAR(20) DEFAULT NULL
);
```

### Sample Puzzle Data
```sql
INSERT INTO puzzles (type, question, solution, core, difficulty, language) VALUES
('cipher', 'KHOOR', 'HELLO', 'edge', 1, NULL),
('binary', '01001000 01101001', 'HI', 'edge', 1, NULL),
('sequence', '2, 4, 8, ?', '16', 'core', 2, NULL),
('coding', 'Python: sum([1, 2, 3])', '6', 'core', 2, 'Python'),
('coding', 'Java: Math.max(5, 10)', '10', 'core', 2, 'Java');
```

*Note*: For the full 50+ puzzle dataset, refer to the project’s `database.sql` or earlier documentation.

---

## Usage

1. **Login/Register**  
   - Visit `login.html` to sign up or log in.
2. **Play**  
   - Navigate to `puzzle.html`, choose a core (Edge, Deep, Core), and solve puzzles.
3. **Progress**  
   - Earn credits, level up, and unlock harder puzzles via API calls.
4. **Sabotage**  
   - Spend credits to disrupt leaderboard opponents.
5. **Profile**  
   - Check `profile.html` for solved puzzles, fragments, and achievements.

---

## Future Enhancements

- **Real-Time Updates**: Implement WebSockets for live sabotage notifications.
- **Puzzle Editor**: Add an admin API endpoint for custom puzzles.
- **Mobile Support**: Optimize CSS for smaller screens.
- **Analytics**: Track player stats with a dedicated API endpoint.

---

## Contributing

Contributions are welcome! To get involved:
- Fork the repository.
- Submit pull requests with enhancements or fixes.
- Open issues for bugs or feature suggestions.

---

## Contact

**Built by Estifanos A.**  
- **Email**: [estifanosamsalu833@gmail.com](mailto:estifanosamsalu833@gmail.com)  
- **Portfolio**: [stive.netlify.app](https://stive.netlify.app)  
- **GitHub**: [stive1213](https://github.com/stive1213)

---
