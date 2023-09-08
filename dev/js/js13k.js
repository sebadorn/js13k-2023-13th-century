'use strict';


/**
 * @namespace js13k
 */
// eslint-disable-next-line no-redeclare
const js13k = {


	// Config
	DEBUG: true,
	FONT: 'Arial, sans-serif',
	TARGET_FPS: 60,
	TILE_SIZE: 96,
	TILE_SIZE_HALF: 48,

	STATE_IDLE: 1,
	STATE_WALKING: 2,


	/**
	 *
	 */
	init() {
		js13k.Input.init();

		js13k.Renderer.init( () => {
			// js13k.Renderer.level = new js13k.Level.Start();
			js13k.Renderer.level = new js13k.Level.Tutorial();
			js13k.Renderer.mainLoop();
		} );
	},


	/**
	 * Check if two axis-aligned bounding boxes overlap.
	 * @param  {object} a   - An axis-aligned bounding box.
	 * @param  {number} a.h - Height.
	 * @param  {number} a.w - Width.
	 * @param  {number} a.x - Position on X axis.
	 * @param  {number} a.y - Position on Y axis.
	 * @param  {object} b   - An axis-aligned bounding box.
	 * @param  {number} b.h - Height.
	 * @param  {number} b.w - Width.
	 * @param  {number} b.x - Position on X axis.
	 * @param  {number} b.y - Position on Y axis.
	 * @return {boolean}
	 */
	overlap( a, b ) {
		let overlapX = Math.min( a.x + a.w, b.x + b.w ) - Math.max( a.x, b.x );
		overlapX = ( overlapX < 0 ) ? 0 : overlapX;

		let overlapY = Math.min( a.y + a.h, b.y + b.h ) - Math.max( a.y, b.y );
		overlapY = ( overlapY < 0 ) ? 0 : overlapY;

		return ( overlapX * overlapY > Number.EPSILON );
	},


};


window.addEventListener( 'load', () => js13k.init() );
