/**
 * Класс игрока
 */
function Player() {
	this.score = 0;
	this.color = null;

	this.updateFromJson = function (json) {
		this.score = json.score;
		this.color = json.color;
	};
}
