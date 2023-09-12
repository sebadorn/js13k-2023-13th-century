'use strict';


js13k.Level.Port = class extends js13k.Level {


	/**
	 *
	 * @override
	 * @constructor
	 */
	constructor() {
		super();

		this.numTilesX = 36;
		this.numTilesY = 2;

		this.limits = {
			w: js13k.TILE_SIZE * this.numTilesX,
			h: js13k.TILE_SIZE * this.numTilesY
		};

		const fighter1 = new js13k.Player( {
			x: js13k.TILE_SIZE
		} );

		this.addCharacters(
			fighter1,
			new js13k.Pirate( {
				x: js13k.TILE_SIZE * 11,
				y: js13k.TILE_SIZE - 8,
				facingX: -1,
				item: new js13k.WeaponSaber()
			} ),
			new js13k.Pirate( {
				x: js13k.TILE_SIZE * 20,
				y: js13k.TILE_SIZE - 8,
				facingX: -1
			} ),
			new js13k.Pirate( {
				x: js13k.TILE_SIZE * 31,
				facingX: -1,
				item: new js13k.WeaponSword()
			} ),
			new js13k.Pirate( {
				x: js13k.TILE_SIZE * 31,
				y: js13k.TILE_SIZE - 8,
				facingX: -1
			} ),
		);

		this.addItems(
			new js13k.Crate( { x: js13k.TILE_SIZE * 11 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 22, y: js13k.TILE_SIZE + 8 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 32 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 32, y: js13k.TILE_SIZE + 8 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 33, y: js13k.TILE_SIZE / 2 } ),
		);

		this.player = fighter1;
		this.introTimer = new js13k.Timer( this, 14 );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number}                   x
	 * @param {number}                   y
	 * @param {number}                   w
	 * @param {number}                   h
	 */
	_drawPillar( ctx, x, y, w, h ) {
		const color = ctx.fillStyle;
		ctx.fillRect( x, y, w, h );
		ctx.fillStyle = '#0001';
		ctx.fillRect( x, y, 12, h );
		ctx.fillStyle = '#fff1';
		ctx.fillRect( x + w - 12, y, 12, h );
		ctx.fillStyle = color;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawBackground( ctx ) {
		/** @type {js13k.Renderer} */
		const R = js13k.Renderer;

		const waterMovement = Math.sin( this.timer / 50 ) * 12;
		this.drawWater( ctx, waterMovement );

		if( this._cnvPier ) {
			ctx.drawImage( this._cnvPier, 0, -js13k.TILE_SIZE_HALF / 2 );
		}
		else {
			const [cnvPier, ctxPier] = R.getOffscreenCanvas( this.limits.w, this.limits.h + js13k.TILE_SIZE * 4 );
			const offsetY = js13k.TILE_SIZE_HALF;

			ctxPier.fillStyle = '#0003';
			ctxPier.fillRect( 0, offsetY + js13k.TILE_SIZE * 1.25, this.limits.w, this.limits.h );

			ctxPier.fillStyle = '#544';

			for( let x = 0; x < this.numTilesX; x += 4 ) {
				this._drawPillar(
					ctxPier,
					x * js13k.TILE_SIZE, 4,
					js13k.TILE_SIZE_HALF, js13k.TILE_SIZE * 2
				);
			}

			for( let x = 0; x < this.numTilesX; x++ ) {
				for( let y = 0; y < this.numTilesY; y++ ) {
					let dx = x * js13k.TILE_SIZE;
					let dy = y * js13k.TILE_SIZE + offsetY;

					ctxPier.drawImage(
						R.images,
						0, 0, 16, 16,
						dx, dy, js13k.TILE_SIZE, js13k.TILE_SIZE
					);
				}
			}

			ctxPier.fillStyle = R.createLinearGradient( 0, offsetY, 0, this.limits.h, '#0001' );
			ctxPier.fillRect( 0, offsetY, this.limits.w, this.limits.h );

			ctxPier.fillStyle = '#544';
			ctxPier.fillRect( 0, this.limits.h - 6 + offsetY, this.limits.w, 24 );

			this._cnvPier = cnvPier;
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawForeground( ctx ) {
		if( !this.introTimer.elapsed() ) {
			js13k.Renderer.drawMonologueBox(
				this.player,
				[
					'My crew is already waiting. I just',
					'have to make it to the ship. But',
					'there are pirates in the harbor.'
				]
			);
		}

		ctx.fillStyle = '#544';

		let y = this.numTilesY * js13k.TILE_SIZE - js13k.TILE_SIZE_HALF / 2;
		let h = js13k.TILE_SIZE * 2;

		for( let x = 0; x < this.numTilesX; x += 4 ) {
			this._drawPillar(
				ctx,
				x * js13k.TILE_SIZE, y,
				js13k.TILE_SIZE_HALF, h
			);
		}
	}


	/**
	 *
	 * @override
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );

		const oc = this.player.getOffsetCenter();

		if( oc.x >= this.limits.w - js13k.TILE_SIZE_HALF ) {
			js13k.Renderer.changeLevel( js13k.Level.Ship.id );
		}
	}


};

js13k.Level.Port.id = 3;
