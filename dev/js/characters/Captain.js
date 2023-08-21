'use strict';


js13k.Captain = class extends js13k.Character {


	/**
	 *
	 * @override
	 * @constructor
	 */
	constructor( data ) {
		data.w ??= 32;
		data.h ??= 48;

		super( data );
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx 
	 */
	draw( ctx ) {
		ctx.fillStyle = '#ff0000';
		ctx.fillRect( Math.round( this.pos.x ), Math.round( this.pos.y ), this.w, this.h );
	}


};
