'use strict';


js13k.LevelObject = class {


	/**
     * 
     * @constructor
     * @param {object} data
     * @param {number} data.x - X coordinate
     * @param {number} data.y - Y coordinate
     * @param {number} data.w - Width
     * @param {number} data.h - Height
     */
	constructor( data ) {
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.w = data.w || 0;
		this.h = data.h || 0;

		this.speed = {
			x: 0,
			y: 0,
		};

		this.health = Infinity;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} _ctx
	 */
	draw( _ctx ) {}


	/**
	 *
	 * @param {number} dt 
	 * @param {object} dir 
	 * @param {number} dir.x
	 * @param {number} dir.y
	 */
	update( dt, dir ) {
		if( dir ) {
			this.x += Math.round( dt * dir.x * this.speed.x );
			this.y += Math.round( dt * dir.y * this.speed.y );
		}
	}


};
