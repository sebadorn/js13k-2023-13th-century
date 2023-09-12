'use strict';


js13k.Crate = class extends js13k.LevelObject {


	/**
	 *
	 * @override
	 * @constructor
	 * @param {object?} data
	 */
	constructor( data = {} ) {
		data.w = js13k.TILE_SIZE;
		data.h = js13k.TILE_SIZE;
		super( data );

		this.images = js13k.Renderer.imagesCrate;
		this.health = this.healthTotal = 55;
		this.isSolid = true;
		this.weight = js13k.TILE_SIZE;
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( this.health > 0 ) {
			ctx.drawImage(
				this.images,
				1, this.shouldBlinkFromDamage() ? 18 : 1, 16, 16,
				this.pos.x, this.pos.y, this.w, this.h
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
		this.isSolid = this.health > 0;
	}


};
