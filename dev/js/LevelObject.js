'use strict';


js13k.LevelObject = class {


	/**
     * 
     * @constructor
     * @param {object?} data
     * @param {number}  data.x - X coordinate
     * @param {number}  data.y - Y coordinate
     * @param {number}  data.w - Width
     * @param {number}  data.h - Height
     */
	constructor( data = {} ) {
		this.pos = new js13k.Vector2D( data.x, data.y );
		this.w = data.w || 0;
		this.h = data.h || 0;

		this.health = Infinity;
		this.facing = new js13k.Vector2D( 1, 0 );
		this.speed = new js13k.Vector2D();
		this.state = js13k.STATE_IDLE;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} _ctx
	 */
	draw( _ctx ) {}


	/**
	 *
	 * @param  {js13k.Vector2D} point
	 * @return {boolean}
	 */
	isPointInHitbox( point ) {
		return (
			this.pos.x <= point.x && point.x <= this.pos.x + this.w &&
			this.pos.y <= point.y && point.y <= this.pos.y + this.h
		);
	}


	/**
	 * Get the render sorting priority.
	 * @return {number}
	 */
	prio() {
		return this.pos.y + this.h;
	}


	/**
	 *
	 * @param {number}          dt 
	 * @param {js13k.Vector2D?} dir 
	 */
	update( dt, dir ) {
		this.state = js13k.STATE_IDLE;

		if( dir ) {
			this.pos.x += Math.round( dt * dir.x * this.speed.x );
			this.pos.y += Math.round( dt * dir.y * this.speed.y );

			// Only update facing direction if object moved
			if( dir.x || dir.y ) {
				this.state = js13k.STATE_WALKING;

				this.facing.set(
					dir.x == 0 ? 0 : ( dir.x > 0 ? 1 : -1 ), // 1: facing right, -1: facing left
					dir.y == 0 ? 0 : ( dir.y > 0 ? 1 : -1 )  // 1: facing down,  -1: facing up
				);
			}
		}
	}


};
