'use strict';


js13k.WeaponFist = class extends js13k.Weapon {


	/**
	 * 
	 * @constructor
	 * @param {object} data 
	 */
	constructor( data ) {
		super( data );

		this.animDuration = 0.2;
		this.damage = 5;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		let dx = this.pos.x;
		let dy = this.pos.y;

		if( this.owner ) {
			dx = this.owner.pos.x + this.w - 20;
			dy = this.owner.pos.y + this.h / 2 - 6;
		}

		if( this.owner.isAttacking ) {
			dx += Math.max( 0, Math.sin( this.owner.attackTimer.progress() * Math.PI * 2 ) * js13k.TILE_SIZE / 2 );
		}

		ctx.drawImage(
			js13k.Renderer.images,
			40, 16, 8, 8,
			dx, dy, js13k.TILE_SIZE / 2, js13k.TILE_SIZE / 2
		);
	}


};
