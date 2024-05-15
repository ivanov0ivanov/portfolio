const startGameButton = document.getElementById("start-game-button");
const endGameButton = document.getElementById("end-game-button");
const gameArea = document.querySelector(".game-area");
const gameCanvas = document.getElementById("game-canvas");
const ctx = gameCanvas.getContext("2d");
let playerX = 200, playerY = 200;
const playerSize = 20;
let playerColor = "#0f0";
const keys = {};
const items = [];
const monsters = [];
let gameActive = false;
let playerMoved = false;
let victory = false;

// Створення модального вікна
const modal = document.createElement("div");
modal.style.position = "fixed";
modal.style.top = "50%";
modal.style.left = "50%";
modal.style.transform = "translate(-50%, -50%)";
modal.style.backgroundColor = "#333";
modal.style.padding = "20px";
modal.style.border = "4px solid #fff";
modal.style.display = "none";
modal.style.zIndex = "1000";
modal.style.textAlign = "center";
modal.innerHTML = `
	<h2 id="modal-message" style="color: #0f0;"></h2>
	<button id="modal-restart-button" style="padding: 10px 20px; margin: 10px; background-color: #0f0; border: none; cursor: pointer;">Почати знову</button>
	<button id="modal-exit-button" style="padding: 10px 20px; margin: 10px; background-color: #f00; border: none; cursor: pointer;">Вийти</button>
	`;
document.body.appendChild(modal);

const modalMessage = document.getElementById("modal-message");
const modalRestartButton = document.getElementById("modal-restart-button");
const modalExitButton = document.getElementById("modal-exit-button");

startGameButton.addEventListener("click", () => {
	gameArea.style.display = "block";
	startGameButton.style.display = "none";
	endGameButton.style.display = "inline-block";
	startGame();
	gameLoop();
	disableScroll();
});

endGameButton.addEventListener("click", () => {
	gameArea.style.display = "none";
	startGameButton.style.display = "inline-block";
	endGameButton.style.display = "none";
	enableScroll();
	clearKeys();  // Очищаємо стан клавіш при завершенні гри
	gameActive = false;  // Завершення гри
});

modalRestartButton.addEventListener("click", restartGame);
modalExitButton.addEventListener("click", exitGame);

document.addEventListener("keydown", (e) => {
	keys[e.key] = true;
	playerMoved = true;
});

document.addEventListener("keyup", (e) => {
	keys[e.key] = false;
});

function startGame () {
	clearKeys();  // Очищаємо стан клавіш при перезапуску гри

	// Очищаємо масиви предметів і монстрів
	items.length = 0;
	monsters.length = 0;

	gameActive = true;
	playerMoved = false;
	victory = false;

	// Генеруємо предмети для збирання
	for (let i = 0; i < 5; i++) {
		items.push({
			x: Math.random() * (gameCanvas.width - playerSize),
			y: Math.random() * (gameCanvas.height - playerSize),
			color: getRandomColor()
		});
	}

	// Генеруємо монстрів
	for (let i = 0; i < 3; i++) {
		monsters.push({
			x: Math.random() * (gameCanvas.width - playerSize),
			y: Math.random() * (gameCanvas.height - playerSize),
			width: playerSize * 2,
			height: playerSize * 2,
			destroyed: false,
			speedX: 0,
			speedY: 0
		});
	}
}

function gameLoop () {
	if (!gameActive) return;

	ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	movePlayer();
	if (playerMoved && !victory) {
		moveMonsters();
	} else if (victory) {
		moveMonstersRandomly();
	}
	drawPlayer();
	drawItems();
	drawMonsters();
	checkCollisions();
	requestAnimationFrame(gameLoop);
}

function movePlayer () {
	if (keys["ArrowUp"] && playerY > 0) playerY -= 2;
	if (keys["ArrowDown"] && playerY < gameCanvas.height - playerSize) playerY += 2;
	if (keys["ArrowLeft"] && playerX > 0) playerX -= 2;
	if (keys["ArrowRight"] && playerX < gameCanvas.width - playerSize) playerX += 2;
}

function moveMonsters () {
	monsters.forEach(monster => {
		const dx = playerX - monster.x;
		const dy = playerY - monster.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const moveX = (dx / distance) * 1; // Швидкість монстрів по X
		const moveY = (dy / distance) * 1; // Швидкість монстрів по Y
		monster.x += moveX;
		monster.y += moveY;
	});
}

function moveMonstersRandomly () {
	monsters.forEach(monster => {
		monster.x += monster.speedX;
		monster.y += monster.speedY;
		// Перевірка виходу за межі canvas
		if (monster.x < 0 || monster.x > gameCanvas.width - monster.width ||
			monster.y < 0 || monster.y > gameCanvas.height - monster.height) {
			monster.speedX *= -1;
			monster.speedY *= -1;
		}
	});
}

function drawPlayer () {
	ctx.fillStyle = playerColor;
	ctx.fillRect(playerX, playerY, playerSize, playerSize);
}

function drawItems () {
	items.forEach(item => {
		ctx.fillStyle = item.color;
		ctx.fillRect(item.x, item.y, playerSize, playerSize);
	});
}

function drawMonsters () {
	ctx.fillStyle = "#f00";
	monsters.forEach(monster => {
		if (!monster.destroyed) {
			ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
		}
	});
}

function checkCollisions () {
	items.forEach((item, index) => {
		if (playerX < item.x + playerSize && playerX + playerSize > item.x &&
			playerY < item.y + playerSize && playerY + playerSize > item.y) {
			playerColor = item.color;
			items.splice(index, 1);
			if (items.length === 0) {
				victory = true;
				monsters.forEach(monster => {
					const dx = monster.x - playerX;
					const dy = monster.y - playerY;
					const distance = Math.sqrt(dx * dx + dy * dy);
					monster.speedX = (dx / distance) * 3;
					monster.speedY = (dy / distance) * 3;
				});
				destroyMonstersWithEffect().then(() => showModal(true));
			}
		}
	});
	monsters.forEach(monster => {
		if (!victory && playerX < monster.x + monster.width && playerX + playerSize > monster.x &&
			playerY < monster.y + monster.height && playerY + playerSize > monster.y) {
			showModal(false);
		}
	});
}

function showModal (isVictory) {
	gameActive = false;
	if (isVictory) {
		modalMessage.textContent = "Ви виграли!";
		modalMessage.style.color = "#0f0";
	} else {
		modalMessage.textContent = "Гра завершена! Вас з'їли монстри!";
		modalMessage.style.color = "#f00";
	}
	modal.style.display = "block";
	disableScroll();
}

function hideModal () {
	modal.style.display = "none";
	enableScroll();
}

function restartGame () {
	hideModal();
	startGame();
	playerX = 200;
	playerY = 200;
	gameActive = true;
	gameLoop();
}

function exitGame () {
	hideModal();
	gameArea.style.display = "none";
	startGameButton.style.display = "inline-block";
	endGameButton.style.display = "none";
	enableScroll();
}

async function destroyMonstersWithEffect () {
	for (let i = 0; i < monsters.length; i++) {
		const monster = monsters[i];
		monster.destroyed = true;
		await animateMonsterDestruction(monster);
	}
}

function animateMonsterDestruction (monster) {
	return new Promise((resolve) => {
		const explosionDuration = 500; // Тривалість вибуху в мілісекундах
		const explosionFrames = 10; // Кількість кадрів вибуху
		const explosionInterval = explosionDuration / explosionFrames;
		let currentFrame = 0;

		const fragments = 5;
		const fragmentSize = monster.width / fragments;
		const fragmentSpeed = 3;

		const explosionAnimation = setInterval(() => {
			ctx.clearRect(monster.x, monster.y, monster.width, monster.height);
			for (let i = 0; i < fragments; i++) {
				const angle = (Math.PI * 2 / fragments) * i;
				const fragmentX = monster.x + fragmentSpeed * currentFrame * Math.cos(angle);
				const fragmentY = monster.y + fragmentSpeed * currentFrame * Math.sin(angle);
				ctx.fillStyle = `rgba(255, 0, 0, ${1 - currentFrame / explosionFrames})`;
				ctx.fillRect(fragmentX, fragmentY, fragmentSize, fragmentSize);
			}
			currentFrame++;
			if (currentFrame > explosionFrames) {
				clearInterval(explosionAnimation);
				resolve();
			}
		}, explosionInterval);
	});
}

function getRandomColor () {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function disableScroll () {
	window.addEventListener("scroll", preventDefault, { passive: false });
	document.body.style.overflow = "hidden";
}

function enableScroll () {
	window.removeEventListener("scroll", preventDefault, { passive: false });
	document.body.style.overflow = "auto";
}

function preventDefault (e) {
	e.preventDefault();
}

function clearKeys () {
	for (let key in keys) {
		keys[key] = false;
	}
}

gameCanvas.addEventListener("mouseenter", disableScroll);
gameCanvas.addEventListener("mouseleave", enableScroll);
