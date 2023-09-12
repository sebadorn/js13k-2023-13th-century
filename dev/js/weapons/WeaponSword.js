'use strict';


js13k.WeaponSword = class extends js13k.Weapon {


	/**
	 *
	 * @constructor
	 * @param {object} data
	 */
	constructor( data = {} ) {
		data.w = data.w || js13k.TILE_SIZE_HALF;
		data.h = data.h || ( js13k.TILE_SIZE * 2 );
		super( data );

		this.animDuration = 0.25;
		this.canInteract = true;
		this.damage = 30;
		this.hitMoveDistance = js13k.TILE_SIZE * 1.35;
	}


	/**
	 * Set the position where to drop the item.
	 * @private
	 * @override
	 */
	_setDropPos() {
		if( !this.owner ) {
			return;
		}

		this.pos.x = this.owner.pos.x - js13k.TILE_SIZE_HALF;
		this.pos.y = this.owner.pos.y - this.owner.h + this.h / 2;

		if( this.owner.facingX > 0 ) {
			this.pos.x += js13k.TILE_SIZE_HALF * 1.5 + this.owner.w;
		}
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
		if( this.owner.facingX < 0 ) {
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
			oc.x = dx + this.w / 2;
			oc.y = dy + this.h;

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
			js13k.Renderer.rotateCenter( ctx, rotate, oc );
		}

		ctx.drawImage(
			js13k.Renderer.imageWeaponSword,
			1, 1, 8, 32,
			dx, dy, this.w, this.h
		);

		if( rotate && this.owner?.isAttacking ) {
			js13k.Renderer.rotateCenter( ctx, -rotate, oc );
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
	 * @param  {js13k.LevelObject} target
	 * @return {function}
	 */
	getHitEffect( target ) {
		if( !target.isSolid ) {
			return;
		}

		const startPos = target.pos.clone();
		const c1 = this.owner.getOffsetCenter();
		const c2 = target.getOffsetCenter();

		const dir = new js13k.Vector2D(
			c2.x - c1.x,
			c2.y - c1.y
		);
		dir.normalize();

		const timer = new js13k.Timer( this.owner.level, 0.5 );
		const distance = Math.max( 0, this.hitMoveDistance - target.weight );

		target.afflicted.stun = true;

		return function() {
			if( timer.elapsed() ) {
				target.afflicted.stun = false;
				return true;
			}

			const progress = timer.progress();
			const oldPos = target.pos.clone();

			target.pos.set(
				startPos.x + dir.x * distance * progress,
				startPos.y + dir.y * distance * progress
			);
			target.fixPosition( oldPos );

			return false;
		};
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
