'use strict';


js13k.Knight = class extends js13k.Enemy {


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	static drawFace( ctx ) {
		ctx.fillStyle = '#000';

		let y = 7;

		// Looking right
		let x = 6;
		ctx.fillRect( x, y, 6, 1 );
		ctx.fillRect( x + 2, y, 3, 2 );

		// Looking left
		x = 20;
		ctx.fillRect( x, y, 6, 1 );
		ctx.fillRect( x + 1, y, 3, 2 );
	}


};
