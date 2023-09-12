'use strict';


/**
 * @namespace js13k
 */
// eslint-disable-next-line no-redeclare
const js13k = {


	// Config
	FONT_SANS: 'Arial, sans-serif',
	FONT_SERIF: '"Times New Roman", serif',
	FONT_MONO: '"Courier New", monospace',
	TARGET_FPS: 60,
	TILE_SIZE: 96,
	TILE_SIZE_HALF: 48,

	STATE_IDLE: 1,
	STATE_WALKING: 2,
	STATE_DEAD: 3,


	/**
	 * Calculate the overlapping area of two axis-aligned bounding boxes.
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
	 * @return {number}
	 */
	calcOverlap( a, b ) {
		let overlapX = Math.min( a.x + a.w, b.x + b.w ) - Math.max( a.x, b.x );
		overlapX = ( overlapX < 0 ) ? 0 : overlapX;

		let overlapY = Math.min( a.y + a.h, b.y + b.h ) - Math.max( a.y, b.y );
		overlapY = ( overlapY < 0 ) ? 0 : overlapY;

		return overlapX * overlapY;
	},


	/**
	 *
	 * @param  {number} id
	 * @return {js13k.Level?}
	 */
	getLevel( id ) {
		if( id == 1 ) {
			return new js13k.Level.Intro();
		}

		if( id == 2 ) {
			return new js13k.Level.Tutorial();
		}

		if( id == 3 ) {
			return new js13k.Level.Port();
		}

		if( id == 4 ) {
			return new js13k.Level.Ship();
		}

		if( id == 5 ) {
			return new js13k.Level.Finale();
		}

		if( id == 6 ) {
			return new js13k.Level.Ending();
		}
	},


	/**
	 *
	 */
	init() {
		js13k.Input.init();

		js13k.Renderer.init( () => {
			js13k.Renderer.level = new js13k.Level.Start();
			js13k.Renderer.mainLoop();
		} );
	},


	/**
	 *
	 * @return {object?}
	 */
	loadGame() {
		const json = localStorage.getItem( '2023_sd_nibelungs.save' );
		return json ? JSON.parse( json ) : null;
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
		return this.calcOverlap( a, b ) > Number.EPSILON;
	},


	/**
	 *
	 * @param {number} levelId
	 */
	saveGame( levelId ) {
		if( levelId < 2 || levelId > 5 ) {
			return;
		}

		localStorage.setItem(
			'2023_sd_nibelungs.save',
			JSON.stringify( { level: levelId } )
		);
	},


};


window.addEventListener( 'load', () => js13k.init() );
