class Game {
	constructor () {
		this.startGameButton = document.getElementById("start-game-button");
		this.endGameButton = document.getElementById("end-game-button");
		this.gameArea = document.querySelector(".game-area");
		this.gameCanvas = document.getElementById("game-canvas");
		this.ctx = this.gameCanvas.getContext("2d");

		this.playerX = 200;
		this.playerY = 200;
		this.playerSize = 20;
		this.playerColor = "#0f0";
		this.keys = {};
		this.items = [];
		this.monsters = [];
		this.gameActive = false;
		this.playerMoved = false;
		this.victory = false;

		this.initModal();
		this.initEventListeners();
	}

	initModal () {
		this.modal = document.createElement("div");
		this.modal.style.position = "fixed";
		this.modal.style.top = "50%";
		this.modal.style.left = "50%";
		this.modal.style.transform = "translate(-50%, -50%)";
		this.modal.style.backgroundColor = "#333";
		this.modal.style.padding = "20px";
		this.modal.style.border = "4px solid #fff";
		this.modal.style.display = "none";
		this.modal.style.zIndex = "1000";
		this.modal.style.textAlign = "center";
		this.modal.innerHTML = `
			<h2 id="modal-message" style="color: #0f0;"></h2>
			<button id="modal-restart-button" style="padding: 10px 20px; margin: 10px; background-color: #0f0; border: none; cursor: pointer;">Почати знову</button>
			<button id="modal-exit-button" style="padding: 10px 20px; margin: 10px; background-color: #f00; border: none; cursor: pointer;">Вийти</button>
		`;
		document.body.appendChild(this.modal);

		this.modalMessage = document.getElementById("modal-message");
		this.modalRestartButton = document.getElementById("modal-restart-button");
		this.modalExitButton = document.getElementById("modal-exit-button");
	}

	initEventListeners () {
		this.startGameButton.addEventListener("click", () => {
			this.gameArea.style.display = "block";
			this.startGameButton.style.display = "none";
			this.endGameButton.style.display = "inline-block";
			this.startGame();
			this.gameLoop();
			this.disableScroll();
		});

		this.endGameButton.addEventListener("click", () => {
			this.gameArea.style.display = "none";
			this.startGameButton.style.display = "inline-block";
			this.endGameButton.style.display = "none";
			this.enableScroll();
			this.clearKeys();  // Очищаємо стан клавіш при завершенні гри
			this.gameActive = false;  // Завершення гри
		});

		this.modalRestartButton.addEventListener("click", () => this.restartGame());
		this.modalExitButton.addEventListener("click", () => this.exitGame());

		document.addEventListener("keydown", (e) => {
			this.keys[e.key] = true;
			this.playerMoved = true;
		});

		document.addEventListener("keyup", (e) => {
			this.keys[e.key] = false;
		});
	}

	startGame () {
		this.clearKeys();  // Очищаємо стан клавіш при перезапуску гри

		// Очищаємо масиви предметів і монстрів
		this.items.length = 0;
		this.monsters.length = 0;

		this.gameActive = true;
		this.playerMoved = false;
		this.victory = false;

		// Генеруємо предмети для збирання
		for (let i = 0; i < 5; i++) {
			this.items.push({
				x: Math.random() * (this.gameCanvas.width - this.playerSize),
				y: Math.random() * (this.gameCanvas.height - this.playerSize),
				color: this.getRandomColor()
			});
		}

		// Генеруємо монстрів
		for (let i = 0; i < 3; i++) {
			this.monsters.push({
				x: Math.random() * (this.gameCanvas.width - this.playerSize),
				y: Math.random() * (this.gameCanvas.height - this.playerSize),
				width: this.playerSize * 2,
				height: this.playerSize * 2,
				destroyed: false,
				speedX: 0,
				speedY: 0
			});
		}
	}

	gameLoop () {
		if (!this.gameActive) return;

		this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		this.movePlayer();
		if (this.playerMoved && !this.victory) {
			this.moveMonsters();
		} else if (this.victory) {
			this.moveMonstersRandomly();
		}
		this.drawPlayer();
		this.drawItems();
		this.drawMonsters();
		this.checkCollisions();
		requestAnimationFrame(() => this.gameLoop());
	}

	movePlayer () {
		if (this.keys["ArrowUp"] && this.playerY > 0) this.playerY -= 2;
		if (this.keys["ArrowDown"] && this.playerY < this.gameCanvas.height - this.playerSize) this.playerY += 2;
		if (this.keys["ArrowLeft"] && this.playerX > 0) this.playerX -= 2;
		if (this.keys["ArrowRight"] && this.playerX < this.gameCanvas.width - this.playerSize) this.playerX += 2;
	}

	moveMonsters () {
		this.monsters.forEach(monster => {
			const dx = this.playerX - monster.x;
			const dy = this.playerY - monster.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			const moveX = (dx / distance) * 1; // Швидкість монстрів по X
			const moveY = (dy / distance) * 1; // Швидкість монстрів по Y
			monster.x += moveX;
			monster.y += moveY;
		});
	}

	moveMonstersRandomly () {
		this.monsters.forEach(monster => {
			monster.x += monster.speedX;
			monster.y += monster.speedY;
			// Перевірка виходу за межі canvas
			if (monster.x < 0 || monster.x > this.gameCanvas.width - monster.width || monster.y < 0 || monster.y > this.gameCanvas.height - monster.height) {
				monster.speedX *= -1;
				monster.speedY *= -1;
			}
		});
	}

	drawPlayer () {
		this.ctx.fillStyle = this.playerColor;
		this.ctx.fillRect(this.playerX, this.playerY, this.playerSize, this.playerSize);
	}

	drawItems () {
		this.items.forEach(item => {
			this.ctx.fillStyle = item.color;
			this.ctx.fillRect(item.x, item.y, this.playerSize, this.playerSize);
		});
	}

	drawMonsters () {
		this.ctx.fillStyle = "#f00";
		this.monsters.forEach(monster => {
			if (!monster.destroyed) {
				this.ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
			}
		});
	}

	checkCollisions () {
		this.items.forEach((item, index) => {
			if (this.playerX < item.x + this.playerSize && this.playerX + this.playerSize > item.x && this.playerY < item.y + this.playerSize && this.playerY + this.playerSize > item.y) {
				this.playerColor = item.color;
				this.items.splice(index, 1);
				if (this.items.length === 0) {
					this.victory = true;
					this.monsters.forEach(monster => {
						const dx = monster.x - this.playerX;
						const dy = monster.y - this.playerY;
						const distance = Math.sqrt(dx * dx + dy * dy);
						monster.speedX = (dx / distance) * 3;
						monster.speedY = (dy / distance) * 3;
					});
					this.destroyMonstersWithEffect().then(() => this.showModal(true));
				}
			}
		});
		this.monsters.forEach(monster => {
			if (!this.victory && this.playerX < monster.x + monster.width && this.playerX + this.playerSize > monster.x && this.playerY < monster.y + monster.height && this.playerY + this.playerSize > monster.y) {
				this.showModal(false);
			}
		});
	}

	showModal (isVictory) {
		this.gameActive = false;
		if (isVictory) {
			this.modalMessage.textContent = "Ви виграли!";
			this.modalMessage.style.color = "#0f0";
		} else {
			this.modalMessage.textContent = "Гра завершена! Вас з'їли монстри!";
			this.modalMessage.style.color = "#f00";
		}
		this.modal.style.display = "block";
		this.disableScroll();
	}

	hideModal () {
		this.modal.style.display = "none";
		this.enableScroll();
	}

	restartGame () {
		this.hideModal();
		this.startGame();
		this.playerX = 200;
		this.playerY = 200;
		this.gameActive = true;
		this.gameLoop();
	}

	exitGame () {
		this.hideModal();
		this.gameArea.style.display = "none";
		this.startGameButton.style.display = "inline-block";
		this.endGameButton.style.display = "none";
		this.enableScroll();
	}

	async destroyMonstersWithEffect () {
		for (let i = 0; i < this.monsters.length; i++) {
			const monster = this.monsters[i];
			monster.destroyed = true;
			await this.animateMonsterDestruction(monster);
		}
	}

	animateMonsterDestruction (monster) {
		return new Promise((resolve) => {
			const explosionDuration = 500; // Тривалість вибуху в мілісекундах
			const explosionFrames = 10; // Кількість кадрів вибуху
			const explosionInterval = explosionDuration / explosionFrames;
			let currentFrame = 0;

			const fragments = 5;
			const fragmentSize = monster.width / fragments;
			const fragmentSpeed = 3;

			const explosionAnimation = setInterval(() => {
				this.ctx.clearRect(monster.x, monster.y, monster.width, monster.height);
				for (let i = 0; i < fragments; i++) {
					const angle = (Math.PI * 2 / fragments) * i;
					const fragmentX = monster.x + fragmentSpeed * currentFrame * Math.cos(angle);
					const fragmentY = monster.y + fragmentSpeed * currentFrame * Math.sin(angle);
					this.ctx.fillStyle = `rgba(255, 0, 0, ${1 - currentFrame / explosionFrames})`;
					this.ctx.fillRect(fragmentX, fragmentY, fragmentSize, fragmentSize);
				}
				currentFrame++;
				if (currentFrame > explosionFrames) {
					clearInterval(explosionAnimation);
					resolve();
				}
			}, explosionInterval);
		});
	}

	getRandomColor () {
		const letters = "0123456789ABCDEF";
		let color = "#";
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	disableScroll () {
		window.addEventListener("scroll", this.preventDefault, { passive: false });
		document.body.style.overflow = "hidden";
	}

	enableScroll () {
		window.removeEventListener("scroll", this.preventDefault, { passive: false });
		document.body.style.overflow = "auto";
	}

	preventDefault (e) {
		e.preventDefault();
	}

	clearKeys () {
		for (let key in this.keys) {
			this.keys[key] = false;
		}
	}
}

const game = new Game();

game.gameCanvas.addEventListener("mouseenter", () => game.disableScroll());
game.gameCanvas.addEventListener("mouseleave", () => game.enableScroll());
