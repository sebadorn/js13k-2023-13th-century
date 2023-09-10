'use strict';


js13k.WeaponSaber = class extends js13k.WeaponSword {


	/**
	 *
	 * @constructor
	 * @param {object} data
	 */
	constructor( data = {} ) {
		data.w = 30;
		data.h = 70;
		super( data );

		this.animDuration = 0.2;
		this.damage = 20;
		this.hitMoveDistance = js13k.TILE_SIZE * 0.8;
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

		this.pos.x = this.owner.pos.x - this.w / 2;
		this.pos.y = this.owner.pos.y + this.owner.h - this.h / 2;

		if( this.owner.facingX > 0 ) {
			this.pos.x += this.owner.w + this.w / 2 - 16;
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

		const wpAABB = {
			x: this.owner.pos.x + this.owner.w - 24,
			y: this.owner.pos.y - 16,
			w: js13k.TILE_SIZE * 0.7 + 24,
			h: js13k.TILE_SIZE * 0.7 + 16
		};

		// Adjust for facing the other direction
		if( this.owner.facingX < 0 ) {
			wpAABB.x -= this.owner.w + wpAABB.w - 48;
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
		let dx = this.pos.x;
		let dy = this.pos.y;

		if( this.owner ) {
			dx = this.owner.pos.x + this.owner.w - 26;
			dy = this.owner.pos.y - 8;
		}

		let rotate = 0;
		let oc = {
			x: dx + this.w / 2,
			y: dy + this.h / 2,
		};

		if( !this.owner ) {
			rotate = 55 * Math.PI / 180;
		}
		else if( this.owner?.isAttacking ) {
			oc.x = dx + this.w / 2;
			oc.y = dy + this.h;

			let progress = this.owner.attackTimer.progress();
			const hitAngle = 75 * Math.PI / 180;

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
			js13k.Renderer.images,
			40, 32, 6, 14,
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
	 * @return {object}
	 */
	getInteractHitbox() {
		return {
			x: this.pos.x - 36,
			y: this.pos.y,
			w: this.w + 56,
			h: this.h
		};
	}


};
