'use strict';


js13k.Character = class extends js13k.LevelObject {


	/**
	 *
	 * @constructor
	 * @param {object?} data
	 */
	constructor( data = {} ) {
		data.w = js13k.TILE_SIZE;
		data.h = js13k.TILE_SIZE;
		super( data );

		this.level = null;
		this.speed.set( 6, 6 );
	}


	/**
	 * 
	 * @override
	 * @param {number}         dt 
	 * @param {js13k.Vector2D} dir 
	 */
	update( dt, dir ) {
		super.update( dt, dir );

		if( this.level ) {
			this.pos.x = Math.min(
				this.level.limits.x + this.level.limits.w - this.w,
				Math.max( this.level.limits.x, this.pos.x )
			);
			this.pos.y = Math.min(
				this.level.limits.y + this.level.limits.h - this.h,
				Math.max( this.level.limits.y, this.pos.y )
			);
		}
	}


};
