'use strict';


js13k.Gold = class extends js13k.LevelObject {


	/**
	 *
	 * @override
	 * @constructor
	 * @param {object?} data
	 */
	constructor( data ) {
		data.w = js13k.TILE_SIZE - 6;
		data.h = js13k.TILE_SIZE - 12;
		super( data );

		this.isSolid = true;
		this.noFixPos = true;
		this.weight = js13k.TILE_SIZE * 2;
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.drawImage(
			js13k.Renderer.images,
			16, 50, 15, 14,
			this.pos.x, this.pos.y, this.w, this.h
		);
	}


};
