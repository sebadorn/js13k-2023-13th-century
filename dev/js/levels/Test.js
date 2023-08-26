'use strict';


js13k.Level.Test = class extends js13k.Level {


	/**
     *
     * @constructor
     */
	constructor() {
		super();

		this.limits = {
			x: 0,
			y: 0,
			w: js13k.TILE_SIZE * 8,
			h: js13k.TILE_SIZE * 8,
		};

		const fighter1 = new js13k.Fighter( { x: 400, y: 400 } );
		this.addCharacters( fighter1 );

		this.selectedCharacter.p1 = this.characters[0];
	}


	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx 
	 */
	drawBackground( ctx ) {
		ctx.strokeStyle = '#8f563b';
		ctx.lineWidth = js13k.TILE_SIZE / 16;
		let offset = ctx.lineWidth / 2;

		ctx.strokeRect(
			-offset, -offset,
			this.limits.w + offset * 2, this.limits.h
		);

		for( let x = 0; x < 8; x++ ) {
			for( let y = 0; y < 8; y++ ) {
				let dx = x * js13k.TILE_SIZE;
				let dy = y * js13k.TILE_SIZE;

				ctx.drawImage(
					js13k.Renderer.images,
					0, 0, 16, 16,
					dx, dy, js13k.TILE_SIZE, js13k.TILE_SIZE
				);
			}
		}
	}


};
