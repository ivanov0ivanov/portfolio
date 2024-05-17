class Game {
	constructor () {
		this.startGameButton = document.getElementById("start-game-button");
		this.endGameButton = document.getElementById("end-game-button");
		this.gameArea = document.querySelector(".game-area");
		this.gameCanvas = document.getElementById("game-canvas");
		this.ctx = this.gameCanvas.getContext("2d");
		this.gameModal = document.getElementById("game-modal");
		this.gameModalMessage = document.getElementById("modal-message");
		this.gameModalRestartButton = document.getElementById("modal-restart-button");
		this.gameModalExitButton = document.getElementById("modal-exit-button");

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

		this.initEventListeners();
	}

	initEventListeners () {
		this.startGameButton.addEventListener("click", () => {
			this.gameArea.style.display = "block";
			this.startGameButton.style.display = "none";
			this.endGameButton.style.display = "inline-block";
			this.scrollToGame();
			this.toggleScroll(true);
			this.toggleZoom(true);
			this.startGame();
			this.gameLoop();
		});

		this.endGameButton.addEventListener("click", () => {
			this.gameArea.style.display = "none";
			this.startGameButton.style.display = "inline-block";
			this.endGameButton.style.display = "none";
			this.toggleScroll();
			this.toggleZoom();
			this.clearKeys(); // Clear the key state when the game is over
			this.gameActive = false; // End of the game
		});

		this.gameModalRestartButton.addEventListener("click", () => this.restartGame());
		this.gameModalExitButton.addEventListener("click", () => this.exitGame());

		document.addEventListener("keydown", e => {
			this.keys[e.key] = true;
			this.playerMoved = true;
		});

		document.addEventListener("keyup", e => {
			this.keys[e.key] = false;
		});

		// Add event listeners for touch controls,
		// setting the corresponding key as active on "touch start" and inactive on "touch end".
		const addTouchListener = (buttonId, key) => {
			const button = document.getElementById(buttonId);
			button.addEventListener("touchstart", () => {
				this.keys[key] = true;
				this.playerMoved = true;
			});
			button.addEventListener("touchend", () => this.keys[key] = false);
		};

		// Add touch listeners for mobile controls
		addTouchListener("up-button", "ArrowUp");
		addTouchListener("down-button", "ArrowDown");
		addTouchListener("left-button", "ArrowLeft");
		addTouchListener("right-button", "ArrowRight");
	}

	startGame () {
		// Clear the key state when the game is restarted
		this.clearKeys();

		// Clear the arrays of items and monsters
		this.items.length = 0;
		this.monsters.length = 0;

		this.gameActive = true;
		this.playerMoved = false;
		this.victory = false;

		// Generate items to collect
		for (let i = 0; i < 5; i++) {
			this.items.push({
				x: Math.random() * (this.gameCanvas.width - this.playerSize),
				y: Math.random() * (this.gameCanvas.height - this.playerSize),
				color: this.getRandomColor()
			});
		}

		// Generate monsters
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
			const moveX = (dx / distance) * 1; // Speed of monsters on X
			const moveY = (dy / distance) * 1; // Speed of monsters on Y
			monster.x += moveX;
			monster.y += moveY;
		});
	}

	moveMonstersRandomly () {
		this.monsters.forEach(monster => {
			monster.x += monster.speedX;
			monster.y += monster.speedY;
			// Check for exit beyond the canvas
			if (monster.x < 0 || monster.x > this.gameCanvas.width - monster.width || monster.y < 0 || monster.y > this.gameCanvas.height - monster.height) {
				monster.speedX *= -1;
				monster.speedY *= -1;
			}
		});
	}

	drawPlayer () {
		this.ctx.fillStyle = this.playerColor;
		this.ctx.beginPath();
		this.ctx.arc(this.playerX + this.playerSize / 2, this.playerY + this.playerSize / 2, this.playerSize / 2, 0, Math.PI * 2);
		this.ctx.fill();
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
			this.gameModalMessage.textContent = "Ви виграли!";
			this.gameModalMessage.style.color = "#0f0";
		} else {
			this.gameModalMessage.textContent = "Гра завершена! Вас з'їли монстри!";
			this.gameModalMessage.style.color = "#f00";
		}
		this.gameModal.style.display = "block";
		this.toggleScroll(true);
	}

	hideModal () {
		this.gameModal.style.display = "none";
		this.toggleScroll();
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
		this.toggleScroll();
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
			const explosionDuration = 500; // Explosion duration in milliseconds
			const explosionFrames = 10; // Number of explosion frames
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

	preventDefault (e) {
		e.preventDefault();
	}

	toggleScroll (disable = false) {
		window[disable ? "addEventListener" : "removeEventListener"]("scroll", this.preventDefault, { passive: false });
		document.body.style.overflow = disable ? "hidden" : "auto";
	}

	toggleZoom (disable = false) {
		document[disable ? "addEventListener" : "removeEventListener"]("gesturestart", this.preventDefault, { passive: false });
	}

	scrollToGame () {
		if (window.innerWidth <= 768) {
			this.endGameButton.scrollIntoView({ behavior: "smooth" });
		}
	}

	clearKeys () {
		for (let key in this.keys) {
			this.keys[key] = false;
		}
	}
}

const game = new Game();

game.gameCanvas.addEventListener("mouseenter", () => game.toggleScroll(true));
game.gameCanvas.addEventListener("mouseleave", () => game.toggleScroll());
