'use strict';


js13k.Character = class extends js13k.LevelObject {


	/**
	 *
	 * @constructor
	 * @param {object?} data
	 */
	constructor( data = {} ) {
		data.w = 64;
		data.h = 64;
		super( data );

		this.speed.x = 8;
		this.speed.y = 8;
	}


	/**
	 * 
	 * @override
	 * @param {number}         dt 
	 * @param {js13k.Vector2D} dir 
	 */
	update( dt, dir ) {
		super.update( dt, dir );

		if( this.ship ) {
			this.pos.x = Math.min(
				this.ship.pos.x + this.ship.w - this.w,
				Math.max( this.ship.pos.x, this.pos.x )
			);
			this.pos.y = Math.min(
				this.ship.pos.y + this.ship.h - this.h,
				Math.max( this.ship.pos.y, this.pos.y )
			);
		}
	}


};
