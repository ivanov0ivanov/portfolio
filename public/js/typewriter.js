class Typewriter {
	constructor (element, speed = 50) {
		this.element = element;
		this.text = element.innerText;
		this.speed = speed;
		this.index = 0;
		this.element.innerText = "";
		this.element.classList.add("typing");
	}

	type () {
		if (this.index < this.text.length) {
			this.element.innerHTML += this.text.charAt(this.index);
			this.index++;
			setTimeout(() => this.type(), this.speed);
		} else {
			setTimeout(() => this.element.classList.remove("typing"), 3000);
		}
	}

	start () {
		this.type();
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const typingTextElement = document.getElementById("typing-text").querySelector("p");
	const typewriter = new Typewriter(typingTextElement);
	typewriter.start();
});
