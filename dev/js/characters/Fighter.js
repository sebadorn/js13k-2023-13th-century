'use strict';


js13k.Fighter = class extends js13k.Character {


	constructor( data ) {
		super( data );
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		let x = Math.round( this.pos.x );
		let y = Math.round( this.pos.y );

		let sx = 0;

		if( this.facing.y < 0 ) {
			sx = 16;
		}
		else if( this.facing.y > 0 ) {
			sx = 32;
		}
		else if( this.facing.x < 0 ) {
			sx = 48;
		}

		// Shadow
		// ctx.fillStyle = '#0000007f';
		// ctx.fillRect( x + 8, y + this.h - 8, js13k.TILE_SIZE - 16, 16 );

		ctx.drawImage(
			js13k.Renderer.images,
			sx, 16, 16, 16,
			x, y, js13k.TILE_SIZE, js13k.TILE_SIZE
		);
	}


};
