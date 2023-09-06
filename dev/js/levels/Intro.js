'use strict';


js13k.Level.Intro = class extends js13k.Level {


	/**
     *
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
			'Betting on its the existance,',
			'many set off to look for the treasure.',
		];

		this.longestLine = 0;
		this.timerFadeIn1 = new js13k.Timer( this, 2 );

		const allText = this.textTreasureOldGerman.concat( this.textSunkenOldGerman );

		allText.forEach( text => {
			const metric = js13k.Renderer.ctx.measureText( text );
			this.longestLine = Math.max( this.longestLine, metric.width );
		} );
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
		let width = this.longestLine + js13k.TILE_SIZE;
		let height = ( this.textTreasureOldGerman.length + this.textSunkenOldGerman.length ) * 49 + js13k.TILE_SIZE * 1.5 + 16;

		ctx.fillStyle = '#e5c382';
		ctx.fillRect(
			x - js13k.TILE_SIZE_HALF, y - js13k.TILE_SIZE,
			width, height
		);

		ctx.font = 'italic 40px "Times New Roman", serif';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#000';

		x += this.longestLine / 2;

		// First part
		if( !this.timerFadeIn1.elapsed() ) {
			const progress = this.timerFadeIn1.progress();
			y += ( 1 - progress ) * js13k.TILE_SIZE_HALF;

			ctx.fillStyle = '#000000' + Math.round( progress * 255 ).toString( 16 ).padStart( 2, '0' );
		}

		this.textTreasureOldGerman.forEach( text => {
			ctx.fillText( text, x, y );
			y += 49;
		} );

		// Second part
		if( this.timerFadeIn1.elapsed() ) {
			y += 49;

			if( !this.timerFadeIn2.elapsed() ) {
				const progress = this.timerFadeIn2.progress();
				y += ( 1 - progress ) * js13k.TILE_SIZE_HALF;

				ctx.fillStyle = '#000000' + Math.round( progress * 255 ).toString( 16 ).padStart( 2, '0' );
			}

			this.textSunkenOldGerman.forEach( text => {
				ctx.fillText( text, x, y );
				y += 49;
			} );
		}

		// English summary
		if( this.timerFadeIn2?.elapsed() ) {
			const progress = this.timerFadeIn3.progress();
			x = width + js13k.TILE_SIZE * 2.5;
			y = js13k.TILE_SIZE * 2 + ( 1 - progress ) * js13k.TILE_SIZE_HALF;

			ctx.font = '32px ' + js13k.FONT;
			ctx.textAlign = 'left';
			ctx.fillStyle = '#ffffff' + Math.round( progress * 255 ).toString( 16 ).padStart( 2, '0' );

			this.textSummaryEngl.forEach( text => {
				ctx.fillText( text, x, y );
				y += 49;
			} );

			// Continue button
			if( this.timerFadeIn3.elapsed() ) {
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
		
				ctx.font = '32px ' + js13k.FONT;
				ctx.fillStyle = '#fa0';
				ctx.textBaseline = 'middle';
				ctx.fillText( 'Continue', x + dh + 32, y );
			}
		}
	}


	/**
	 *
	 * @override
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		if( this.timerFadeIn1.elapsed() && !this.timerFadeIn2 ) {
			this.timerFadeIn2 = new js13k.Timer( this, 2 );
		}
		else if ( this.timerFadeIn2 && this.timerFadeIn2.elapsed() && !this.timerFadeIn3 ) {
			this.timerFadeIn3 = new js13k.Timer( this, 2 );
		}

		if( js13k.Input.isPressed( js13k.Input.ACTION.DO, true ) ) {
			if( !this.timerFadeIn1.elapsed() ) {
				this.timerFadeIn1.set( 0 );
			}
			else if( this.timerFadeIn2 && !this.timerFadeIn2.elapsed() ) {
				this.timerFadeIn2.set( 0 );
			}
			else if( this.timerFadeIn3 && !this.timerFadeIn3.elapsed() ) {
				this.timerFadeIn3.set( 0 );
			}
			else {
				js13k.Audio.play( js13k.Audio.SELECT );
				js13k.Renderer.level = new js13k.Level.Ship();
			}
		}
	}


};
