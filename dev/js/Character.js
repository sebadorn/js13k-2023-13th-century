'use strict';


js13k.Character = class extends js13k.LevelObject {


	/**
	 *
	 * @constructor
	 * @param {object?} data
	 */
	constructor( data = {} ) {
		data.w = js13k.TILE_SIZE;
		data.h = js13k.TILE_SIZE;
		super( data );

		this._walkAnimSpeed = 42 / js13k.TARGET_FPS;

		// Action to perform, NPCs only
		this.action = null;

		this.attackTimer = null;
		this.isAttacking = false;

		this.healthTotal = 100;
		this.health = 100;

		this.item = data.item;
		this.speed.set( 12, 12 );

		if( this.item ) {
			this.item.owner = this;
		}
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number}                   scaleX
	 */
	_applyMirroring( ctx, scaleX ) {
		js13k.Renderer.scaleCenter( ctx, scaleX, 1, this.getOffsetCenter() );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_applyWalking( ctx ) {
		js13k.Renderer.rotateCenter(
			ctx,
			0.1 * Math.sin( this._animTimerState * this._walkAnimSpeed ),
			this.getOffsetCenter()
		);
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawHealth( ctx ) {
		if( this.health == this.healthTotal || this.isDodging ) {
			return;
		}

		let percent = this.health / this.healthTotal;
		let x = this.pos.x + 16;
		let y = this.pos.y - 24;
		let w = this.w - 32;

		// Bar background
		ctx.fillStyle = '#000';
		ctx.fillRect( x, y, w, 8 );

		// Fill level
		ctx.fillStyle = '#f00';
		ctx.fillRect( x, y, w * percent, 8 );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D}              ctx
	 * @param {(HTMLImageElement|HTMLCanvasElement)?} image
	 */
	_drawItem( ctx, image ) {
		const mirror = this.facing.x < 0;

		if( mirror ) {
			this._applyMirroring( ctx, -1 );
		}

		this.item?.draw( ctx, image );

		if( mirror ) {
			this._applyMirroring( ctx, -1 );
		}
	}


	/**
	 * Start an attack with the current weapon.
	 */
	attack() {
		if( this.isAttacking || !this.item ) {
			return;
		}

		js13k.Audio.play( js13k.Audio.ATTACK );

		this.attackTimer = this.attackTimer || new js13k.Timer( this.level );
		this.attackTimer.set( this.item.animDuration );

		this.isAttacking = true;
	}


	/**
	 *
	 */
	dodge() {
		if( this.isDodging ) {
			return;
		}

		js13k.Audio.play( js13k.Audio.DODGE );

		this.dodgeTimer = this.dodgeTimer || new js13k.Timer( this.level );
		this.dodgeTimer.set( 0.5 );

		this.isDodging = true;
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( this.health <= 0 ) {
			return;
		}

		let sx = this.imgSX + ( this.facing.x < 0 ? 16 : 0 );
		let image = js13k.Renderer.images;

		if( this.isDodging ) {
			let rotate = this.dodgeTimer.progress() * 360 * 3 * Math.PI / 180;

			if( this.facing.x < 0 ) {
				rotate = -rotate;
			}

			js13k.Renderer.rotateCenter( ctx, rotate, this.getOffsetCenter() );
		}
		else {
			if( this.noDamageTimer && !this.noDamageTimer.elapsed() ) {
				const progress = this.noDamageTimer.progress();

				if(
					( progress >= 0 && progress <= 0.2 ) ||
					( progress >= 0.4 && progress <= 0.6 ) ||
					( progress >= 0.8 && progress <= 1 )
				) {
					image = js13k.Renderer.imagesWhite;
				}
			}

			if( this.state === js13k.STATE_WALKING ) {
				this._applyWalking( ctx );
			}
		}

		if( this.item ) {
			this._drawItem( ctx, image );
		}

		this._drawHealth( ctx );

		ctx.drawImage(
			image,
			sx, this.imgSY, this.imgSW, this.imgSH,
			this.pos.x, this.pos.y, js13k.TILE_SIZE, js13k.TILE_SIZE
		);

		js13k.Renderer.resetTransform();
	}


	/**
	 * Drop the currently hold item (if it can be dropped).
	 */
	dropItem() {
		this.item?.drop();

		// Default to fists if character is still alive.
		if( this.health > 0 ) {
			this.item = new js13k.WeaponFist();
			this.item.owner = this;
		}
	}


	/**
	 *
	 * @override
	 * @return {object}
	 */
	getInteractHitbox() {
		const hb = {
			x: this.pos.x,
			y: this.pos.y + this.h,
			w: this.w,
			h: js13k.TILE_SIZE_HALF / 2
		};

		hb.y -= hb.h;

		return hb;
	}


	/**
	 *
	 * @param {js13k.LevelObject} item
	 */
	takeItem( item ) {
		// Drop the currently hold item
		this.item?.drop();

		this.item = item;
		item.highlight = false;
		item.owner = this;
		this.level.removeItem( item );
	}


	/**
	 * 
	 * @override
	 * @param {number}         dt 
	 * @param {js13k.Vector2D} dir 
	 */
	update( dt, dir ) {
		if( this.health <= 0 ) {
			return;
		}

		let newState = js13k.STATE_IDLE;

		this._animTimerState += dt;
		this._updateEffects( dt );

		if( dir ) {
			newState = this.moveInDir( dir, dt, newState );
		}

		if( this.action ) {
			newState = this.action( dt ) || newState;
		}

		if( this.state != newState ) {
			this._animTimerState = 0;
		}

		if( this.isAttacking && this.attackTimer.elapsed() ) {
			this.isAttacking = false;
		}

		if( this.isDodging ) {
			if( this.dodgeTimer.elapsed() ) {
				this.isDodging = false;
			}
			else {
				dir = new js13k.Vector2D( this.facing.x < 0 ? -1 : 1, 0 );
				this.moveInDir( dir, dt, newState );
			}
		}

		if( this.level ) {
			this.pos.x = Math.min(
				this.level.limits.x + this.level.limits.w - this.w,
				Math.max( this.level.limits.x, this.pos.x )
			);
			this.pos.y = Math.min(
				this.level.limits.y + this.level.limits.h - this.h - 8,
				Math.max( this.level.limits.y - js13k.TILE_SIZE_HALF, this.pos.y )
			);
		}

		this.state = newState;
	}


};
