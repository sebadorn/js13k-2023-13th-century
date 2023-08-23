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
		this.speed = new js13k.Vector2D();
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
	 * @param {number}         dt 
	 * @param {js13k.Vector2D} dir 
	 */
	update( dt, dir ) {
		if( dir ) {
			this.pos.x += Math.round( dt * dir.x * this.speed.x );
			this.pos.y += Math.round( dt * dir.y * this.speed.y );
		}
	}


};
