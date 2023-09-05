'use strict';


js13k.Level.Start = class extends js13k.Level {


	/**
     *
     * @constructor
     */
	constructor() {
		super();

		// 0: New Game
		// 1: Continue
		this.selectedButton = 0;
		this.numButtons = 2;

		this.textTreasureOldGerman = 'Ez enwas niht anders / wan gestéinẹ unde golt. / unt ob man al die werlde / het dâ von versolt, / sîn wǽré niht mínner / einer marke wert.';
		this.textSunkenOldGerman = 'Ê daz der künee rîche / wider wære komen, / die wîle hete Hagene / den schaz vil gar genomen. / er sanctẹ in dâ ze Lôche / allen in den Rîn. / er wandẹ er soldẹ in niezen: / des enkunde niht gesîn.';
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

		ctx.font = 'bold 64px ' + js13k.FONT;
		ctx.textAlign = 'left';
		ctx.fillStyle = '#fa0';
		ctx.fillText( 'TREASURE OF THE NIBELUNGS', x, y + 3 );
		ctx.fillStyle = '#777';
		ctx.fillText( 'TREASURE OF THE NIBELUNGS', x, y );

		ctx.font = '42px ' + js13k.FONT;
		x += js13k.TILE_SIZE_HALF / 2 + 114;
		y += 96;
		this._drawButton( ctx, 'New Game', x, y, this.selectedButton === 0 );
		y += 72;
		this._drawButton( ctx, 'Continue', x, y, this.selectedButton === 1 );
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

			if( this.selectedButton === 0 ) {
				js13k.Renderer.level = new js13k.Level.Ship();
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
