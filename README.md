# Front-End Portfolio

This is a Front-End portfolio website showcasing my projects and skills. The website includes sections about me, my
portfolio, and contact information, along with an interactive mini-game.

## Table of Contents

- [About the Project](#about-the-project)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Contact](#contact)

## About the Project

This portfolio website is designed to present my front-end development projects and skills. It includes a mini-game
feature, a detailed about me section, and contact information.

## Project Structure

```
portfolio/
├── public/
│ ├── index.html
│ ├── css/
│ │ └── normalize.css
│ │ └── main.css
│ ├── js/
│ │ └── main.js
│ │ └── typewriter.js
│ └── └── game.js
├── .firebaserc
├── firebase.json
├── .github/
│ └── workflows/
│ └── firebase-hosting-live-deploy.yml
│ └── firebase-hosting-merge.yml
│ └── firebase-hosting-pull-request.yml
└── README.md
```
## Technologies Used

- HTML5
- CSS3
- JavaScript
- Firebase Hosting

## Setup Instructions

1. **Clone the repository:**

    ```bash
    git clone https://github.com/ivanov0ivanov/portfolio.git
    cd portfolio
    ```

2. **Install dependencies:**

   Ensure you have [Node.js](https://nodejs.org/) and [Firebase CLI](https://firebase.google.com/docs/cli) installed.

    ```bash
    npm install -g firebase-tools
    ```

3. **Deploy to Firebase:**

    ```bash
    firebase login
    firebase init
    firebase deploy
    ```

## Usage

- Open the deployed URL in your browser.
- Navigate through the sections using the navigation links in the header.
- Interact with the mini-game by clicking the "Start Game" and "End Game" buttons.

## Contact

Feel free to reach out via the contact form on the website or through my social media links:

- Twitter: [https://twitter.com/your-profile](https://twitter.com/your-profile)
- LinkedIn: [https://linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)
- GitHub: [https://github.com/your-profile](https://github.com/your-profile)

---

© 2024 Front-End Portfolio. All rights reserved.
