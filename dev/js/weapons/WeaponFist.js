'use strict';


js13k.WeaponFist = class extends js13k.Weapon {


	/**
	 * 
	 * @constructor
	 * @param {object} data 
	 */
	constructor( data = {} ) {
		super( data );

		this.animDuration = 0.2;
		this.damage = 15;
	}


	/**
	 * Check if an attack with this weapon would hit the given LevelObject right now.
	 * @param  {js13k.LevelObject} o
	 * @return {boolean} True if hit, false otherwise
	 */
	checkHit( o ) {
		if( !this.owner ) {
			return false;
		}

		const wpAABB = {
			x: this.owner.pos.x + this.owner.w,
			y: this.owner.pos.y + js13k.TILE_SIZE_HALF / 2,
			w: js13k.TILE_SIZE_HALF,
			h: js13k.TILE_SIZE_HALF,
		};

		// Adjust for facing the other direction
		if( this.owner.facingX < 0 ) {
			wpAABB.x -= this.owner.w + wpAABB.w;
		}

		const aabb = {
			x: o.pos.x,
			y: o.pos.y,
			w: o.w,
			h: o.h,
		};

		return js13k.overlap( aabb, wpAABB );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( !this.owner?.isAttacking ) {
			return;
		}

		let dx = this.owner.pos.x + this.owner.w - 32;
		let dy = this.owner.pos.y + this.owner.h / 2 - 16;

		let progress = this.owner.attackTimer.progress();
		dx += Math.sin( progress * Math.PI ) * js13k.TILE_SIZE_HALF * 1.5;

		ctx.drawImage(
			js13k.Renderer.imageWeaponFist,
			1, 1, 7, 6,
			dx, dy, js13k.TILE_SIZE_HALF, js13k.TILE_SIZE_HALF
		);
	}


	/**
	 *
	 * @override
	 * @param  {js13k.LevelObject} target
	 * @return {function}
	 */
	getHitEffect( target ) {
		if( !( target instanceof js13k.Character ) ) {
			return;
		}

		const timer = new js13k.Timer( this.owner.level, 0.4 );
		target.afflicted.stun = true;
		target.dropItem();

		return function() {
			if( timer.elapsed() ) {
				target.afflicted.stun = false;
				return true;
			}

			return false;
		};
	}


};
