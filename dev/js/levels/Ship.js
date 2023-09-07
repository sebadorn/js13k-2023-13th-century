'use strict';


js13k.Level.Ship = class extends js13k.Level {


	/**
     *
     * @constructor
     */
	constructor() {
		super();

		this.numTilesX = 24;
		this.limits = {
			w: js13k.TILE_SIZE * this.numTilesX,
			h: js13k.TILE_SIZE * 8,
		};

		const fighter1 = new js13k.Fighter( { x: 300, y: 400, item: new js13k.WeaponFist() } );
		const enem1 = new js13k.Enemy( { x: 800, y: 400, item: new js13k.WeaponSword() } );
		enem1.facing.x = -1;
		this.addCharacters( fighter1, enem1 );

		const sword1 = new js13k.WeaponSword( { x: 400, y: 540 } );
		this.addItems( sword1 );

		this.selectedCharacter.p1 = fighter1;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawBackground( ctx ) {
		const R = js13k.Renderer;

		// Water
		ctx.fillStyle = R.patternWater;
		ctx.translate( -this.waterMovement, 0 );
		R.fillBackground();
		ctx.translate( this.waterMovement, 0 );

		if( this._cnvRailing ) {
			ctx.drawImage( this._cnvRailing, -js13k.TILE_SIZE / 16, -js13k.TILE_SIZE );
		}

		// Ship outline
		ctx.fillStyle = '#5a3c2e';
		ctx.strokeStyle = '#8f563b';
		ctx.lineWidth = js13k.TILE_SIZE / 16;
		let offset = ctx.lineWidth / 2;

		ctx.strokeRect(
			-offset, -offset,
			this.limits.w + ctx.lineWidth, this.limits.h
		);

		ctx.fillRect(
			-ctx.lineWidth, this.limits.h,
			this.limits.w + ctx.lineWidth * 2, js13k.TILE_SIZE
		);

		// Ship tiles
		for( let x = 0; x < this.numTilesX; x++ ) {
			for( let y = 0; y < 8; y++ ) {
				let dx = x * js13k.TILE_SIZE;
				let dy = y * js13k.TILE_SIZE;

				ctx.drawImage(
					R.images,
					0, 0, 16, 16,
					dx, dy, js13k.TILE_SIZE, js13k.TILE_SIZE
				);
			}
		}

		// TODO: create gradient in constructor
		const gradient = js13k.Renderer.ctx.createLinearGradient(
			0, 0,
			0, this.limits.h,
		);
		gradient.addColorStop( 0, '#0002' );
		gradient.addColorStop( 1, '#fff1' );
		ctx.fillStyle = gradient;
		ctx.fillRect( 0, 0, this.limits.w, this.limits.h );
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawForeground( ctx ) {
		const lineWidth = js13k.TILE_SIZE / 16;

		// Waves against the ship
		for( let i = 0; i <= this.numTilesX; i++ ) {
			ctx.drawImage(
				js13k.Renderer.images,
				32, 0, 16, 16,
				i * js13k.TILE_SIZE - this.waterMovement, this.limits.h, js13k.TILE_SIZE, js13k.TILE_SIZE
			);
		}

		if( this._cnvRailing ) {
			ctx.drawImage(
				this._cnvRailing,
				-lineWidth, this.limits.h - js13k.TILE_SIZE_HALF * 1.5
			);
		}
		else {
			const width = 3 * lineWidth + this.limits.w;
			const height = js13k.TILE_SIZE;

			const [canvasFg, ctxFg] = js13k.Renderer.getOffscreenCanvas( width, height );
			ctxFg.fillStyle = '#5a3c2e';
			ctxFg.lineWidth = lineWidth;

			// Railing top
			ctxFg.fillRect(
				0, 0,
				this.limits.w + ctxFg.lineWidth * 2, 10
			);

			// Railing bars
			const num = ( this.limits.w + ctxFg.lineWidth * 2 ) / js13k.TILE_SIZE;

			for( let i = 0; i <= num; i++ ) {
				ctxFg.fillRect(
					i * js13k.TILE_SIZE, 0,
					12, js13k.TILE_SIZE
				);
			}

			this._cnvRailing = canvasFg;
		}
	}


	/**
	 *
	 * @override
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );
		this.waterMovement = ( this.timer % 25 ) / 25 * js13k.TILE_SIZE;
	}


};
