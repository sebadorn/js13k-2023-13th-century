'use strict';


js13k.Level.Intro = class extends js13k.Level {


	/**
     *
	 * @override
     * @constructor
     */
	constructor() {
		super();

		this.textTreasureOldGerman = [
			'Ez enwas niht anders',
			'wan gestéinẹ unde golt.',
			'unt ob man al die werlde',
			'het dâ von versolt,',
			'sîn wǽré niht mínner',
			'einer marke wert.',
		];
		this.textSunkenOldGerman = [
			'Ê daz der künee rîche',
			'wider wære komen,',
			'die wîle hete Hagene',
			'den schaz vil gar genomen.',
			'',
			'er sanctẹ in dâ ze Lôche',
			'allen in den Rîn.',
			'er wandẹ er soldẹ in niezen:',
			'des enkunde niht gesîn.',
		];

		this.textSummaryEngl = [
			'The legendary treasure of the Nibelungs:',
			'Gems and gold more than one could ever hope to spent.',
			'',
			'While the king and his men where away, Hagen stole it',
			'all and sunk the treasure in the Rhine at Lochheim.',
			'But he was killed before being able to retrieve the riches.',
			'',
			'Betting on its existance, many',
			'set off to look for the treasure.',
		];

		this.timerFadeIn = new js13k.Timer( this, 2 );
	}


	/**
	 *
	 * @override
	 */
	draw() {
		/** @type {CanvasRenderingContext2D} */
		const ctx = js13k.Renderer.ctx;

		ctx.fillStyle = '#0d161e';
		js13k.Renderer.fillBackground();

		// Background scroll
		let x = js13k.TILE_SIZE * 2;
		let y = x;
		let width = 500 + js13k.TILE_SIZE;
		let height = ( this.textTreasureOldGerman.length + this.textSunkenOldGerman.length ) * 49 + js13k.TILE_SIZE * 2 + 16;

		let bgX = x - js13k.TILE_SIZE_HALF;
		let bgY = y - js13k.TILE_SIZE;

		ctx.fillStyle = '#e5c382';
		ctx.fillRect( bgX, bgY, width, height );

		ctx.fillStyle = js13k.Renderer.createLinearGradient(
			bgX, bgY,
			bgX, bgY + height / 2,
			'#0002', '#0000'
		);
		ctx.fillRect( bgX, bgY, width, height / 2 );

		ctx.fillStyle = js13k.Renderer.createLinearGradient(
			bgX, bgY + height / 2,
			bgX, bgY + height,
			'#0000', '#0002'
		);
		ctx.fillRect( bgX, bgY + height / 2, width, height / 2 );

		ctx.fillStyle = '#e5c382';
		ctx.fillRect( bgX - 36, bgY - 72, width + 72, js13k.TILE_SIZE * 1.5 );
		ctx.fillRect( bgX - 36, bgY + height - 72, width + 72, js13k.TILE_SIZE * 1.5 );

		let gradient = ctx.createLinearGradient(
			bgX - 36, bgY - 72,
			bgX - 36, bgY - 72 + js13k.TILE_SIZE * 1.5
		);
		gradient.addColorStop( 0, '#0000' );
		gradient.addColorStop( 1, '#0003' );
		ctx.fillStyle = gradient;
		ctx.fillRect( bgX - 36, bgY - 72, width + 72, js13k.TILE_SIZE * 1.5 );

		gradient = ctx.createLinearGradient(
			bgX - 36, bgY + height - 72,
			bgX - 36, bgY + height - 72 + js13k.TILE_SIZE * 1.5
		);
		gradient.addColorStop( 0, '#0003' );
		gradient.addColorStop( 1, '#0000' );
		ctx.fillStyle = gradient;
		ctx.fillRect( bgX - 36, bgY + height - 72, width + 72, js13k.TILE_SIZE * 1.5 );

		ctx.font = 'italic 38px ' + js13k.FONT_SERIF;
		ctx.textAlign = 'center';
		ctx.fillStyle = '#000';
		const lh = 47;

		x += 500 / 2;
		y += 36;

		// First part
		this.textTreasureOldGerman.forEach( text => {
			ctx.fillText( text, x, y );
			y += lh;
		} );

		// Second part
		y += lh;

		this.textSunkenOldGerman.forEach( text => {
			ctx.fillText( text, x, y );
			y += lh;
		} );

		// English summary
		const progress = this.timerFadeIn.progress();
		x = width + 264;
		y = 312 + ( 1 - progress ) * js13k.TILE_SIZE;

		ctx.font = '32px ' + js13k.FONT_SANS;
		ctx.textAlign = 'left';
		ctx.fillStyle = '#ffffff' + Math.round( progress * 255 ).toString( 16 ).padStart( 2, '0' );

		this.textSummaryEngl.forEach( text => {
			ctx.fillText( text, x, y );
			y += 49;
		} );

		// Continue button
		if( this.timerFadeIn.elapsed() ) {
			y += 49;
			let dw = js13k.TILE_SIZE_HALF / 2;
			let dh = js13k.TILE_SIZE;
			let dx = x + dh / 2;
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
	
			ctx.font = '32px ' + js13k.FONT_SANS;
			ctx.fillStyle = '#fa0';
			ctx.textBaseline = 'middle';
			ctx.fillText( 'Continue', x + dh + 32, y );
		}
	}


	/**
	 *
	 * @override
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		if( js13k.Input.isPressed( js13k.Input.ACTION.DO, true ) ) {
			if( !this.timerFadeIn.elapsed() ) {
				this.timerFadeIn.set( 0 );
			}
			else {
				js13k.Audio.play( js13k.Audio.SELECT );
				js13k.Renderer.changeLevel( js13k.Level.Tutorial.id );
			}
		}
	}


};

js13k.Level.Intro.id = 1;
