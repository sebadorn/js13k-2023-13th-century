'use strict';


js13k.WeaponSword = class extends js13k.Weapon {


	/**
	 *
	 * @constructor
	 * @param {object} data
	 */
	constructor( data ) {
		super( data );

		this.animDuration = 0.25;
		this.damage = 10;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		let dx = this.pos.x;
		let dy = this.pos.y;

		if( this.owner ) {
			dx = this.owner.pos.x + js13k.TILE_SIZE / 2;
			dy = this.owner.pos.y - js13k.TILE_SIZE - 16;
		}

		let rotate = 0;
		let oc = {
			x: dx + js13k.TILE_SIZE / 4,
			y: dy + js13k.TILE_SIZE * 2,
		};

		if( this.owner?.isAttacking ) {
			let progress = this.owner.attackTimer.progress();
			const hitAngle = Math.PI;

			// Swing down
			if( progress <= 0.4 ) {
				progress = progress / 0.4;
				rotate = progress * hitAngle;
			}
			// Impact, hold position
			else if( progress <= 0.8 ) {
				rotate = hitAngle;
			}
			// Back to origin
			else {
				rotate = 0;
			}

			ctx.translate( oc.x, oc.y );
			ctx.rotate( rotate );
			ctx.translate( -oc.x, -oc.y );
		}

		ctx.drawImage(
			js13k.Renderer.images,
			32, 16, 8, 32,
			dx, dy, js13k.TILE_SIZE / 2, js13k.TILE_SIZE * 2
		);

		if( this.owner?.isAttacking ) {
			ctx.translate( oc.x, oc.y );
			ctx.rotate( -rotate );
			ctx.translate( -oc.x, -oc.y );
		}
	}


	/**
	 * Check if an attack with this weapon would hit the given LevelObject right now.
	 * @param {js13k.LevelObject} o
	 */
	checkHit( o ) {
		// TODO:
	}


};
