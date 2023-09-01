'use strict';


js13k.WeaponSword = class extends js13k.Weapon {


	/**
	 *
	 * @constructor
	 * @param {object} data
	 */
	constructor( data = {} ) {
		data.w = js13k.TILE_SIZE_HALF;
		data.h = js13k.TILE_SIZE * 2;
		super( data );

		this.animDuration = 0.25;
		this.canInteract = true;
		this.damage = 25;
	}


	/**
	 * Set the position where to drop the item.
	 * @private
	 * @override
	 */
	_setDropPos() {
		this.pos.set(
			this.owner.pos.x + this.owner.w / 2,
			this.owner.pos.y - this.owner.h + this.h / 2
		);
	}


	/**
	 * Check if an attack with this weapon would hit the given LevelObject right now.
	 * @param  {js13k.LevelObject} o
	 * @return {boolean} True if hit, false otherwise
	 */
	checkHit( o ) {
		const wpAABB = [
			// more width than height
			{
				x: this.owner.pos.x + this.owner.w,
				y: this.owner.pos.y,
				w: js13k.TILE_SIZE * 1.7,
				h: js13k.TILE_SIZE,
			},
			// more height than width
			{
				x: this.owner.pos.x + this.owner.w,
				y: this.owner.pos.y - js13k.TILE_SIZE * 0.7,
				w: js13k.TILE_SIZE,
				h: js13k.TILE_SIZE * 2.4,
			}
		];

		// Adjust for facing the other direction
		if( this.owner.facing.x < 0 ) {
			wpAABB[0].x -= this.owner.w + wpAABB[0].w;
			wpAABB[1].x -= this.owner.w + wpAABB[1].w;
		}

		const aabb = {
			x: o.pos.x,
			y: o.pos.y,
			w: o.w,
			h: o.h,
		};

		for( let i = 0; i < wpAABB.length; i++ ) {
			if( js13k.overlap( aabb, wpAABB[i] ) ) {
				return true;
			}
		}

		return false;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		let dx = this.pos.x;
		let dy = this.pos.y;

		if( this.owner ) {
			dx = this.owner.pos.x + js13k.TILE_SIZE_HALF;
			dy = this.owner.pos.y - js13k.TILE_SIZE - 16;
		}

		let rotate = 0;
		let oc = {
			x: dx + this.w / 2,
			y: dy + this.h / 2,
		};

		if( !this.owner ) {
			rotate = 80 * Math.PI / 180;
		}
		else if( this.owner?.isAttacking ) {
			oc.x = dx + js13k.TILE_SIZE / 4;
			oc.y = dy + js13k.TILE_SIZE * 2;

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
		}

		if( rotate ) {
			ctx.translate( oc.x, oc.y );
			ctx.rotate( rotate );
			ctx.translate( -oc.x, -oc.y );
		}

		ctx.drawImage(
			js13k.Renderer.images,
			32, 16, 8, 32,
			dx, dy, js13k.TILE_SIZE_HALF, js13k.TILE_SIZE * 2
		);

		if( rotate && this.owner?.isAttacking ) {
			ctx.translate( oc.x, oc.y );
			ctx.rotate( -rotate );
			ctx.translate( -oc.x, -oc.y );
		}

		if( !this.owner ) {
			js13k.Renderer.resetTransform();

			if( this.highlight ) {
				this._drawHighlight( ctx );
			}
		}
	}


	/**
	 *
	 * @override
	 * @return {object}
	 */
	getInteractHitbox() {
		return {
			x: this.pos.x - this.w * 1.5,
			y: this.pos.y + this.w * 1.5,
			w: this.h,
			h: this.w
		};
	}


};
