'use strict';


js13k.Level.Ship = class extends js13k.Level {


	/**
     *
     * @constructor
     */
	constructor() {
		super();

		this.numTilesX = 24;
		this.numTilesY = 6;

		this.limits = {
			w: js13k.TILE_SIZE * this.numTilesX,
			h: js13k.TILE_SIZE * this.numTilesY,
		};

		const fighter1 = new js13k.Fighter( { x: js13k.TILE_SIZE * 2, y: js13k.TILE_SIZE * 2, item: new js13k.WeaponFist() } );
		const enem1 = new js13k.Enemy( { x: js13k.TILE_SIZE * 12, y: js13k.TILE_SIZE * 2, item: new js13k.WeaponSword() } );
		enem1.facing.x = -1;
		this.addCharacters( fighter1, enem1 );

		const sword1 = new js13k.WeaponSword( { x: js13k.TILE_SIZE * 4, y: js13k.TILE_SIZE * 4.5 } );
		this.addItems( sword1 );

		this.player = fighter1;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawBackground( ctx ) {
		const R = js13k.Renderer;

		this.drawWater( ctx, this.waterMovement );

		// Railing in top area
		if( this._cnvRailing ) {
			ctx.drawImage( this._cnvRailing, -6, -js13k.TILE_SIZE );
		}

		if( this._cnvShip ) {
			ctx.drawImage( this._cnvShip, 0, 0 );
		}
		else {
			const lineWidth = 6;
			const [cnvShip, ctxShip] = js13k.Renderer.getOffscreenCanvas(
				this.limits.w + lineWidth * 1.5,
				this.limits.h + lineWidth * 0.5 + js13k.TILE_SIZE
			);

			// Ship outline
			ctxShip.lineWidth = lineWidth;
			let offset = lineWidth / 2;

			ctxShip.strokeStyle = '#8f563b';
			ctxShip.strokeRect(
				0, offset,
				this.limits.w + ctxShip.lineWidth + offset, this.limits.h + offset
			);

			// Ship tiles
			for( let x = 0; x < this.numTilesX; x++ ) {
				for( let y = 0; y < this.numTilesY; y++ ) {
					let dx = x * js13k.TILE_SIZE;
					let dy = lineWidth + y * js13k.TILE_SIZE;

					ctxShip.drawImage(
						R.images,
						0, 0, 16, 16,
						dx, dy, js13k.TILE_SIZE, js13k.TILE_SIZE
					);
				}
			}

			// Ship bottom area
			ctxShip.fillStyle = '#5a3c2e';
			ctxShip.fillRect(
				offset - ctxShip.lineWidth, this.limits.h,
				this.limits.w + ctxShip.lineWidth * 2, js13k.TILE_SIZE
			);

			ctxShip.fillStyle = js13k.Renderer.createLinearGradient(
				0, this.limits.h, 0, this.limits.h + js13k.TILE_SIZE,
				'#0003', '#4b73ac30'
			);
			ctxShip.fillRect(
				offset - ctxShip.lineWidth, this.limits.h,
				this.limits.w + ctxShip.lineWidth * 2, js13k.TILE_SIZE
			);

			// Dark to light gradient on tiles for depth
			ctxShip.fillStyle = js13k.Renderer.createLinearGradient( 0, 0, 0, this.limits.h );
			ctxShip.fillRect( 0, 0, this.limits.w + offset, this.limits.h );

			this._cnvShip = cnvShip;
		}
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawForeground( ctx ) {
		const lineWidth = 6;

		// Waves against the ship
		if( this._cnvWaves ) {
			ctx.drawImage(
				this._cnvWaves,
				-this.waterMovement, this.limits.h + 0.5,
				js13k.TILE_SIZE * ( this.numTilesX + 1 ), js13k.TILE_SIZE
			);
		}
		else {
			const [cnvWaves, ctxWaves] = js13k.Renderer.getOffscreenCanvas(
				js13k.TILE_SIZE *  ( this.numTilesX + 1 ), js13k.TILE_SIZE
			);

			for( let i = 0; i <= this.numTilesX; i++ ) {
				ctxWaves.drawImage(
					js13k.Renderer.images,
					32, 0, 16, 16,
					i * js13k.TILE_SIZE, 0,
					js13k.TILE_SIZE, js13k.TILE_SIZE
				);
			}

			this._cnvWaves = cnvWaves;
		}

		// Railing in lower area
		if( this._cnvRailing ) {
			ctx.drawImage(
				this._cnvRailing,
				-lineWidth, this.limits.h - js13k.TILE_SIZE
			);
		}
		else {
			const width = 2 * lineWidth + this.limits.w;
			const height = js13k.TILE_SIZE;

			const [canvasFg, ctxFg] = js13k.Renderer.getOffscreenCanvas( width, height );
			ctxFg.lineWidth = lineWidth;

			// Railing top
			ctxFg.fillStyle = '#5a3c2e';
			ctxFg.fillRect(
				0, 0,
				this.limits.w + ctxFg.lineWidth * 2, lineWidth * 3
			);

			ctxFg.fillStyle = '#0002';
			ctxFg.fillRect(
				0, 12,
				this.limits.w + ctxFg.lineWidth * 2, lineWidth
			);

			ctxFg.fillStyle = '#fff1';
			ctxFg.fillRect(
				0, 0,
				this.limits.w + ctxFg.lineWidth * 2, lineWidth
			);

			// Railing bars
			const num = this.limits.w / js13k.TILE_SIZE + 1;

			for( let i = 0; i <= num; i++ ) {
				let x = i * js13k.TILE_SIZE;
				let y = lineWidth * 3;
				let h = js13k.TILE_SIZE + 1;

				ctxFg.fillStyle = '#5a3c2e';
				ctxFg.fillRect(
					x, y,
					lineWidth * 3, h
				);

				ctxFg.fillStyle = '#0002';
				ctxFg.fillRect(
					x, y,
					lineWidth, h
				);

				ctxFg.fillStyle = '#fff1';
				ctxFg.fillRect(
					x + 12, y,
					6, h
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
