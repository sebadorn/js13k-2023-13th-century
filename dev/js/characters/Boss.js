'use strict';


js13k.Boss = class extends js13k.Knight {


	/**
	 *
	 * @override
	 * @constructor
	 * @param {object} data
	 */
	constructor( data ) {
		super( data );

		this.health = this.healthTotal = 300;
		this.images = js13k.Renderer.imagesBoss;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	static drawFace( ctx ) {
		ctx.fillStyle = '#000';

		let y = 6;

		// Looking right
		let x = 7;
		ctx.fillRect( x, y, 3, 1 );
		ctx.fillRect( x + 1, y, 2, 2 );
		ctx.fillRect( x + 2, y, 1, 3 );
		ctx.fillRect( x + 4, y, 1, 3 );
		ctx.fillRect( x + 4, y, 2, 2 );

		// Looking left
		x = 20;
		ctx.fillRect( x, y, 2, 2 );
		ctx.fillRect( x + 1, y, 1, 3 );
		ctx.fillRect( x + 3, y, 1, 3 );
		ctx.fillRect( x + 3, y, 2, 2 );
		ctx.fillRect( x + 3, y, 3, 1 );
	}


	/**
	 *
	 * @override
	 * @private
	 */
	_drawHealth() {}


};
