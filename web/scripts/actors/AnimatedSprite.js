/**
 * Класс Анимированный спрайт.
 * Класс релизует спрайт (наследуется от класса Sprite) и дополняет его свойствами для отрисовки анимации.
 * Объекту необходимо передать индекс анимации из хранилища анимации графического контроллера.
 */
define(['controllers/GraphicsController',
		'actors/Sprite'],
	(GraphicsController, Sprite) => class AnimatedSprite extends Sprite {
		constructor(animationKey, x = 0, y = 0, z = 0, width = 100, height = 100, scaleX = 1, scaleY = 1, rotate = 0) {
			// у этого объекта x и y являются точкой центра анимации
			// от этой точки выполняется масштабирование и поворот рисуемой картинки
			super(x, y, z, width, height, scaleX, scaleY, rotate);

			if (!GraphicsController.animatedSprites[animationKey])
				return console.error('AnimatedSprite not found');

			this.frameIndex = 0;    // текущий кадр

			this.frameTime = null;  // время на один кадр

			this.delta = 0;         // прошло времени для текущего кадра

			this.animationSpeed = 1.0;       // скорость анимации

			this.paused = false;    // флаг паузы анимации, анимация может быть приостановлена

			// какой tileImage использовать
			this.tileImage = GraphicsController.animatedSprites[animationKey].tileImage;

			// ссылка на сценарии анимации, берем от контроллера
			this.animations = GraphicsController.animatedSprites[animationKey].animations;

			// установка на первую анимацию
			// выполнять нужно обязательно, потому что будут запонены расчетные параметры
			const firstAnimationName = Object.keys(this.animations)[0];
			this.setAnimationKey(firstAnimationName);
		}

		update(delta) {
			if (this.paused) return;

			this.delta += delta * this.animationSpeed;

			// когда время отрисовки фрейма вышло, нужно поменять фрейм на следующий
			if (this.delta > this.frameTime) {
				this.delta -= this.frameTime;
				this.frameIndex++;
				const frames = this.animations[this.animationKey].frames;
				if (this.frameIndex >= frames.length)
					this.frameIndex -= frames.length;
				this.animationFrameIndex = this.animations[this.animationKey].frames[this.frameIndex];
			}

		}

		draw(x, y) {
			// отрисовка выполняется по слоям
			// графическому контроллеру передается номер слоя и метод, который нужно выполнить при отрисовке
			GraphicsController.addToLayer(this.z, (ctx) => {
				ctx.save();
				{
					// сначала выполняется смещение в точку отрисовки
					ctx.translate(x, y);

					let tileImage = GraphicsController.tileImages[this.tileImage];
					let frame = tileImage.frames[this.animationFrameIndex];
					let width = tileImage.frameWidth;
					let height = tileImage.frameHeight;

					// картинка будет выводиться только для нужного режима рендера
					if (frame && GraphicsController.renderStyle & GraphicsController.DRAW_IMAGE_STYLE) {
						ctx.save();
						// применяется масштабирование
						ctx.scale(this.scaleX, this.scaleY);
						// ...и поворот
						ctx.rotate(this.rotate);
						// далее отрисовывается нужный фрейм из нужного тайла
						ctx.drawImage(GraphicsController.images[this.tileImage].image,
							frame.x, frame.y, width, height,
							-this.x, -this.y, width, height);
						ctx.restore();
					}

					// рисуем фрейм картинки если нужно
					// фрейм отражает сколько площади занимает объект
					if (GraphicsController.renderStyle & GraphicsController.DRAW_FRAME_STYLE) {
						ctx.beginPath();
						ctx.strokeStyle = 'lime';
						ctx.rect(this.bounds.left, this.bounds.top, this.bounds.width, this.bounds.height);
						ctx.stroke();
					}

					// если графический режим установлен для отрисовки крестика в точке спрайта
					// то сделаем это - нарисуем красный крест прямо в точке отсчета спрайта
					if (GraphicsController.renderStyle & GraphicsController.SPRITE_POSITION_STYLE) {
						ctx.beginPath();
						ctx.strokeStyle = 'red';
						ctx.moveTo(0, -20);
						ctx.lineTo(0, 20);
						ctx.moveTo(20, 0);
						ctx.lineTo(-20, 0);
						ctx.stroke();
					}
				}
				ctx.restore();
			});
		}

		/**
		 * Изменение ключа анимации
		 * @param animationKey
		 */
		setAnimationKey(animationKey) {
			this.animationKey = animationKey;
			this.frameTime = 1 / this.animations[animationKey].fps;
			this.setFrameIndex(0);
		}

		/**
		 * Изменение фрейма анимации
		 * @param frameIndex
		 */
		setFrameIndex(frameIndex) {
			this.frameIndex = frameIndex;
			this.animationFrameIndex = this.animations[this.animationKey].frames[this.frameIndex];
			this.delta = 0;
		}

		/**
		 * Изменение скорости анимации
		 * @param animationSpeed
		 */
		setAnimationSpeed(animationSpeed) {
			this.animationSpeed = animationSpeed;
		}

		/**
		 * Остановка анимации
		 */
		stop() {
			this.paused = true;
		}

		/**
		 * Воспроизведение анимации
		 */
		play() {
			this.paused = false;
		}
	});
