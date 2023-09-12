'use strict';


js13k.Knight = class extends js13k.Enemy {


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	static drawFace( ctx ) {
		let y = 8;

		// Looking right
		let x = 7;
		ctx.fillRect( x, y, 6, 1 );
		ctx.fillRect( x + 2, y, 3, 2 );

		// Looking left
		x = 22;
		ctx.fillRect( x, y, 6, 1 );
		ctx.fillRect( x + 1, y, 3, 2 );
	}


};
