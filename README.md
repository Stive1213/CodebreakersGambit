

Codebreaker's Gambit

A dynamic, level-based puzzle game built with PHP, MySQL, JavaScript, and HTML/CSS.

Overview
Codebreaker’s Gambit is an interactive web-based game where players assume the role of hackers infiltrating the "Netmind," a fictional AI-controlled network. 
Players solve puzzles, earn credits, level up, and uncover story fragments. 
The game leverages a RESTful API to connect the front-end and back-end, showcasing skills in full-stack development, database management, and real-time gameplay mechanics. 
Features include sabotage options, daily challenges, and a leaderboard.

This project highlights expertise in:

Back-End: PHP, MySQL, API development
Front-End: JavaScript, HTML5, CSS3
Game Logic: Level progression, randomization, unsolved puzzle filtering
DevOps: Local deployment with XAMPP

Features

Puzzle Variety: Over 50 puzzles across five types:

Ciphers (e.g., "KHOOR" → "HELLO")

Binary (e.g., "01001000" → "H")

Sequences (e.g., "1, 3, 5, ?" → "7")

Traps (e.g., "2x + 3 = 7" → "2")

Coding challenges (Python, Java, JavaScript, C++)

Level Progression: Puzzles scale with player level (difficulty ≤ level + 1).

Unsolved Puzzle Filter: Ensures only new challenges are presented.

Sabotage System: Disrupt opponents with actions like "Scramble" or "Code Freeze."

Daily Challenges: Time-limited puzzles for bonus credits.

Leaderboard: Real-time ranking by credits.

Fragments: Collectible story pieces revealing the Netmind’s narrative.

API-Driven: Front-end communicates with back-end via RESTful API endpoints.

Tech Stack
Front-End:

HTML5, CSS3 (custom style.css)

JavaScript (ES6, script.js)

Back-End:

PHP 8.x (API endpoints in server/ folder)

MySQL (MariaDB) for data persistence

Connectivity: RESTful API for seamless front-end/back-end interaction

Tools:
XAMPP for local development

Git for version control

Installation

Prerequisites

XAMPP (Apache, MySQL, PHP)

Git

Web browser (e.g., Chrome, Firefox)

Setup Instructions

Clone the Repository:

git clone https://github.com/stive1213/CodebreakersGambit.git

cd CodebreakersGambit

Deploy to XAMPP:

Copy the CodebreakersGambit folder to C:\xampp\htdocs\.

Configure the Database:

Start XAMPP, launch Apache and MySQL.

Open http://localhost/phpmyadmin.

Create a new database named codebreaker_db.

Import the provided database.sql file (or run the SQL from the Database Setup section).

Update Database Connection:

Edit server/db_connect.php if your MySQL credentials differ:

$pdo = new PDO("mysql:host=localhost;dbname=codebreaker_db", "root", "");

Run the Application:

Open http://localhost/CodebreakersGambit/public/login.html in your browser.

Register a new user .


Usage

Login/Register: Start at login.html to create an account or sign in.

Play: Go to puzzle.html, select a core (Edge, Deep, Core), and solve puzzles.

Progress: Earn credits, level up, and unlock harder puzzles via the API.

Sabotage: Spend credits to disrupt other players from the leaderboard.

Profile: View solved puzzles, fragments, and achievements at profile.html.

Future Enhancements
Real-Time Updates: Use WebSockets for live sabotage notifications.

Puzzle Editor: Admin API endpoint to add custom puzzles.

Mobile Support: Optimize CSS for smaller screens.

Analytics: Track player stats via a new API endpoint.

Contributing

Fork this repository, submit pull requests, or open issues for bugs and feature suggestions. Contributions to enhance gameplay or API functionality are appreciated.


Contact
Built by Estifanos.A
Email: estifanosamsalu833@.com
Portfolio: stive.netlify.app
