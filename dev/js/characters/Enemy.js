'use strict';


js13k.Enemy = class extends js13k.Character {


	/**
	 *
	 * @constructor
	 * @override
	 * @param {object?} data
	 */
	constructor( data ) {
		super( data );
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		let x = this.pos.x;
		let y = this.pos.y;

		let sx = this.facing.x < 0 ? 16 : 0;

		if( this.state === js13k.STATE_WALKING ) {
			this._applyWalking( ctx );
		}

		this._drawItem( ctx );

		ctx.drawImage(
			js13k.Renderer.images,
			sx, 32, 16, 16,
			x, y, js13k.TILE_SIZE, js13k.TILE_SIZE
		);

		js13k.Renderer.resetTransform();
	}


};
