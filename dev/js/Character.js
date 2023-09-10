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
		// this.action = null;

		// this.attackTimer = null;
		// this.isAttacking = false;

		this.images = js13k.Renderer.imagesPlayer;

		this.healthTotal = this.health = 100;
		this.isSolid = true;

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
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawItem( ctx ) {
		const mirror = this.facing.x < 0;

		if( mirror ) {
			this._applyMirroring( ctx, -1 );
		}

		this.item?.draw( ctx );

		if( mirror ) {
			this._applyMirroring( ctx, -1 );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawShadow( ctx ) {
		ctx.drawImage(
			js13k.Renderer.imageShadow,
			this.pos.x, this.pos.y + this.h - 12,
			this.w, 24
		);
	}


	/**
	 * Start an attack with the current weapon.
	 * @return {boolean}
	 */
	attack() {
		if( this.isAttacking || this.isDodging || !this.item || this.afflicted?.stun ) {
			return false;
		}

		js13k.Audio.play( js13k.Audio.ATTACK );

		this.attackTimer = this.attackTimer || new js13k.Timer( this.level );
		this.attackTimer.set( this.item.animDuration );

		this.isAttacking = true;

		return true;
	}


	/**
	 *
	 */
	dodge() {
		if( this.isDodging || this.afflicted?.stun ) {
			return false;
		}

		js13k.Audio.play( js13k.Audio.DODGE );

		this.dodgeTimer = this.dodgeTimer || new js13k.Timer( this.level );
		this.dodgeTimer.set( 0.5 );
		this.posBeforeDodge = this.pos.clone();

		this.isDodging = true;

		return true;
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

		let sx = this.facing.x < 0 ? 16 : 0;
		let sy = 0;
		let image = this.images;

		this._drawShadow( ctx );

		if( this.isDodging ) {
			let rotate = this.dodgeTimer.progress() * 360 * 3 * Math.PI / 180;

			if( this.facing.x < 0 ) {
				rotate = -rotate;
			}

			js13k.Renderer.rotateCenter( ctx, rotate, this.getOffsetCenter() );
		}
		else {
			if( this.shouldBlinkFromDamage() ) {
				sy = 16;
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
			sx, sy, 16, 16,
			this.pos.x, this.pos.y, js13k.TILE_SIZE, js13k.TILE_SIZE
		);

		js13k.Renderer.resetTransform();
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	static drawFace( ctx ) {
		ctx.fillStyle = '#000';

		let y = 6;

		// Looking right
		let x = 11;
		ctx.fillRect( x, y, 1, 4 );
		ctx.fillRect( x - 2, y, 1, 4 );
		ctx.fillRect( x - 4, y, 1, 4 );

		// Looking left
		x = 21;
		ctx.fillRect( x, y, 1, 4 );
		ctx.fillRect( x + 2, y, 1, 4 );
		ctx.fillRect( x + 4, y, 1, 4 );
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
		else {
			this.item = null;
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
		// Item already has an owner
		if( item.owner ) {
			return;
		}

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

		if( this.isDodging ) {
			if( this.dodgeTimer.elapsed() ) {
				this.isDodging = false;
				this.fixPosition( this.posBeforeDodge, true );
			}
			else {
				dir = new js13k.Vector2D( this.facing.x < 0 ? -1 : 1, 0 );
				this.moveInDir( dir, dt, newState );
			}
		}
		else if( dir ) {
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

		this.state = newState;
	}


};
