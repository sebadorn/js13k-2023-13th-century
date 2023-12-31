'use strict';


js13k.Level.Start = class extends js13k.Level {


	/**
     *
	 * @override
     * @constructor
     */
	constructor() {
		super();

		// 0: New Game
		// 1: Continue
		this.selectedButton = 0;
		this.numButtons = 1;

		this._hasGameData = !!js13k.loadGame();

		if( this._hasGameData ) {
			this.selectedButton = 1;
			this.numButtons = 2;
		}
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {string}                   text
	 * @param {number}                   x
	 * @param {number}                   y
	 * @param {boolean}                  isSelected
	 */
	_drawButton( ctx, text, x, y, isSelected ) {
		if( isSelected ) {
			let dw = js13k.TILE_SIZE_HALF / 2;
			let dh = js13k.TILE_SIZE;
			let dx = x - 96;
			let dy = y - dh / 2;
			let c = {
				x: dx + dw / 2,
				y: dy + dh / 2
			};

			js13k.Renderer.rotateCenter( ctx, Math.PI / 2, c );
			js13k.Renderer.scaleCenter( ctx, Math.sin( this.timer * 0.08 ), 1, c );

			ctx.drawImage(
				js13k.Renderer.images,
				32, 16, 8, 32,
				dx, dy, dw, dh
			);

			js13k.Renderer.resetTransform();
		}

		ctx.fillStyle = isSelected ? '#fa0' : '#777';
		ctx.textBaseline = 'middle';
		ctx.fillText( text, x, y );
	}


	/**
	 *
	 * @override
	 */
	draw() {
		/** @type {CanvasRenderingContext2D} */
		const ctx = js13k.Renderer.ctx;

		let x = Math.max( js13k.TILE_SIZE * 2, js13k.Renderer.center.x - 500 );
		let y = Math.max( js13k.TILE_SIZE * 2, js13k.Renderer.center.y - 128 );

		ctx.fillStyle = '#0d161e';
		js13k.Renderer.fillBackground();

		ctx.font = '600 64px ' + js13k.FONT_MONO;
		ctx.textAlign = 'left';
		ctx.fillStyle = '#fa0';
		ctx.fillText( 'THE TREASURE OF THE NIBELUNGS', x, y + 3 );
		ctx.fillStyle = '#777';
		ctx.fillText( 'THE TREASURE OF THE NIBELUNGS', x, y );

		ctx.font = '600 42px ' + js13k.FONT_MONO;
		x += 138;
		y += 96;
		this._drawButton( ctx, 'New Game', x, y, this.selectedButton == 0 );

		if( !this._hasGameData ) {
			ctx.globalAlpha = 0.5;
		}

		y += 72;
		this._drawButton( ctx, 'Continue', x, y, this.selectedButton == 1 );
		ctx.globalAlpha = 1;
	}


	/**
	 *
	 */
	loadGame() {
		const data = js13k.loadGame();

		if( !data ) {
			return;
		}

		js13k.Renderer.changeLevel( data.level );
	}


	/**
	 *
	 * @override
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		if( js13k.Input.isPressed( js13k.Input.ACTION.UP, true ) ) {
			this.selectedButton--;
		}
		else if( js13k.Input.isPressed( js13k.Input.ACTION.DOWN, true ) ) {
			this.selectedButton++;
		}
		else if( js13k.Input.isPressed( js13k.Input.ACTION.DO, true ) ) {
			js13k.Audio.play( js13k.Audio.SELECT );

			// New Game
			if( this.selectedButton == 0 ) {
				js13k.Renderer.changeLevel( js13k.Level.Intro.id );
			}
			// Continue
			else if( this.selectedButton == 1 ) {
				this.loadGame();
			}
		}

		// Loop around in button selection
		if( this.selectedButton < 0 ) {
			this.selectedButton = this.numButtons - 1;
		}
		else if( this.selectedButton >= this.numButtons ) {
			this.selectedButton = 0;
		}
	}


};
