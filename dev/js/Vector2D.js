'use strict';


js13k.Vector2D = class {


	/**
	 *
	 * @constructor
	 * @param {number} [x = 0]
	 * @param {number} [y = 0]
	 */
	constructor( x = 0, y = 0 ) {
		this.x = x;
		this.y = y;
	}


	/**
	 *
	 * @return {js13k.Vector2D}
	 */
	clone() {
		return new js13k.Vector2D( this.x, this.y );
	}


	/**
	 * Get the length of the vector.
	 * @return {number} Length of the vector.
	 */
	length() {
		return Math.sqrt( this.x * this.x + this.y * this.y );
	}


	/**
	 * Normalize the vector.
	 */
	normalize() {
		const length = this.length();
		this.x /= length;
		this.y /= length;
	}


	/**
	 *
	 * @param {number} x
	 * @param {number} y
	 */
	set( x, y ) {
		this.x = x;
		this.y = y;
	}


};
