'use strict';


js13k.Level.Port = class extends js13k.Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		super();

		this.numTilesX = 24;
		this.numTilesY = 2;

		this.limits = {
			w: js13k.TILE_SIZE * this.numTilesX,
			h: js13k.TILE_SIZE * this.numTilesY
		};

		const fighter1 = new js13k.Fighter( {
			x: js13k.TILE_SIZE * 2,
			y: 0,
			item: new js13k.WeaponFist()
		} );
		const enem1 = new js13k.Enemy( {
			x: js13k.TILE_SIZE * 12,
			y: 0,
			item: new js13k.WeaponSword()
		} );
		enem1.facing.x = -1;
		this.addCharacters( fighter1, enem1 );

		this.player = fighter1;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawBackground( ctx ) {
		const R = js13k.Renderer;

		// Water
		const waterMovement = Math.sin( this.timer / 50 ) * 12;
		ctx.fillStyle = R.patternWater;
		ctx.translate( -waterMovement, 0 );
		R.fillBackground();
		ctx.translate( waterMovement, 0 );

		// TODO: cache as canvas
		// Pier
		for( let x = 0; x < this.numTilesX; x++ ) {
			for( let y = 0; y < this.numTilesY; y++ ) {
				let dx = x * js13k.TILE_SIZE;
				let dy = y * js13k.TILE_SIZE;

				ctx.drawImage(
					R.images,
					0, 0, 16, 16,
					dx, dy, js13k.TILE_SIZE, js13k.TILE_SIZE
				);
			}
		}

		ctx.fillStyle = '#655';
		ctx.fillRect( 0, this.limits.h - 6, this.limits.w, 24 );

		// TODO: shadow like on ship tiles
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
			js13k.Renderer.changeLevel( new js13k.Level.Ship() );
		}
	}


};
