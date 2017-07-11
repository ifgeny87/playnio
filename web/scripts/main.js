/**
 * Функция pad для строк позволяет добавлять содержимое к строке до нужной длины
 * https://stackoverflow.com/questions/2686855/is-there-a-javascript-function-that-can-pad-a-string-to-get-to-a-determined-leng
 */
if (!String.prototype.pad)
	String.prototype.pad = function (pad_char, pad_length, pad_right = false) {
		let result = this;
		if ((typeof pad_char === 'string') && (pad_char.length === 1) && (pad_length > this.length)) {
			let padding = new Array(pad_length - this.length + 1).join(pad_char);
			result = (pad_right ? result + padding : padding + result);
		}
		return result;
	};

requirejs.config({
	baseUrl: 'scripts',
	paths: {}
});

require(['controllers/GameController'], GameCtronerller => new GameCtronerller);
