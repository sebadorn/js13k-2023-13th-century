'use strict';


js13k.WeaponFist = class extends js13k.Weapon {


	/**
	 * 
	 * @constructor
	 * @param {object} data 
	 */
	constructor( data = {} ) {
		super( data );

		this.animDuration = 0.15;
		this.damage = 10;
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
		if( this.owner.facing.x < 0 ) {
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
	 * @param {CanvasRenderingContext2D}              ctx
	 * @param {(HTMLImageElement|HTMLCanvasElement)?} image
	 */
	draw( ctx, image ) {
		let dx = this.pos.x;
		let dy = this.pos.y;

		if( this.owner ) {
			dx = this.owner.pos.x + this.owner.w - 32;
			dy = this.owner.pos.y + this.owner.h / 2 - 16;
		}

		if( this.owner.isAttacking ) {
			const offsetX = Math.sin( this.owner.attackTimer.progress() * Math.PI * 2 ) * js13k.TILE_SIZE_HALF;
			dx += Math.max( 0, offsetX );
		}

		ctx.drawImage(
			image || js13k.Renderer.images,
			40, 16, 8, 8,
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

		return function() {
			target.dropItem();

			return true;
		};
	}


};
