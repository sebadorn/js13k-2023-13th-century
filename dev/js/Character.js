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
		const oc = this.getOffsetCenter();
		ctx.translate( oc.x, oc.y );
		ctx.scale( scaleX, 1 );
		ctx.translate( -oc.x, -oc.y );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_applyWalking( ctx ) {
		const oc = this.getOffsetCenter();
		ctx.translate( oc.x, oc.y );
		ctx.rotate( 0.1 * Math.sin( this._animTimerState / js13k.TARGET_FPS * 48 ) );
		ctx.translate( -oc.x, -oc.y );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawHealth( ctx ) {
		if( this.health == this.healthTotal ) {
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
	 * Start an attack with the current weapon.
	 */
	attack() {
		if( this.isAttacking || !this.item ) {
			return;
		}

		this.attackTimer = this.attackTimer || new js13k.Timer( this.level );
		this.attackTimer.set( this.item.animDuration );

		this.isAttacking = true;
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		let sx = this.imgSX + ( this.facing.x < 0 ? 16 : 0 );

		if( this.state === js13k.STATE_WALKING ) {
			this._applyWalking( ctx );
		}

		if( this.item ) {
			this._drawItem( ctx );
		}

		this._drawHealth( ctx );

		ctx.drawImage(
			js13k.Renderer.images,
			sx, this.imgSY, this.imgSW, this.imgSH,
			this.pos.x, this.pos.y, js13k.TILE_SIZE, js13k.TILE_SIZE
		);

		js13k.Renderer.resetTransform();
	}


	/**
	 * 
	 * @override
	 * @param {number}         dt 
	 * @param {js13k.Vector2D} dir 
	 */
	update( dt, dir ) {
		super.update( dt, dir );

		if( this.isAttacking && this.attackTimer.elapsed() ) {
			this.isAttacking = false;
		}

		if( this.level ) {
			this.pos.x = Math.min(
				this.level.limits.x + this.level.limits.w - this.w,
				Math.max( this.level.limits.x, this.pos.x )
			);
			this.pos.y = Math.min(
				this.level.limits.y + this.level.limits.h - this.h,
				Math.max( this.level.limits.y, this.pos.y )
			);
		}
	}


};
