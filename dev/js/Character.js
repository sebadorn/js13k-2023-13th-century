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

		this._animTimerAttack = 0;

		this.isAttacking = false;
		this.health = 100;
		this.item = data.item || js13k.ITEM_NONE;
		this.level = null;
		this.speed.set( 12, 12 );
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
	_drawItem( ctx ) {
		if( !this.hasWeapon() ) {
			return;
		}

		const mirror = this.facing.x < 0;

		if( mirror ) {
			this._applyMirroring( ctx, -1 );
		}

		if( this.item === js13k.ITEM_FIST ) {
			this._drawItemFist( ctx );
		}
		else if( this.item === js13k.ITEM_SWORD ) {
			this._drawItemSword( ctx );
		}

		if( mirror ) {
			this._applyMirroring( ctx, -1 );
		}
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawItemFist( ctx ) {
		let dx = this.pos.x + this.w - 20;
		let dy = this.pos.y + this.h / 2 - 6;

		if( this.isAttacking ) {
			dx += Math.max( 0, Math.sin( this._animTimerAttack / js13k.TARGET_FPS * 24 ) * 32 );
		}

		ctx.drawImage(
			js13k.Renderer.images,
			0, 48, 8, 8,
			dx, dy, js13k.TILE_SIZE / 2, js13k.TILE_SIZE / 2
		);
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawItemSword( ctx ) {
		let dx = this.pos.x - this.w + 8;
		let dy = this.pos.y;

		ctx.drawImage(
			js13k.Renderer.images,
			0, 56, 32, 8,
			dx, dy, js13k.TILE_SIZE * 2, js13k.TILE_SIZE / 2
		);

		if( this.isAttacking ) {
			// TODO: animation
		}
	}


	/**
	 * Start an attack with the current weapon.
	 */
	attack() {
		if( this.isAttacking || !this.hasWeapon() ) {
			return;
		}

		if( this.item === js13k.ITEM_NONE ) {
			return;
		}

		this.isAttacking = true;
		this._animTimerAttack = 0;
	}


	/**
	 * Check if character has a weapon they can attack with.
	 * @return {boolean}
	 */
	hasWeapon() {
		return this.item && this.item !== js13k.ITEM_NONE;
	}


	/**
	 * 
	 * @override
	 * @param {number}         dt 
	 * @param {js13k.Vector2D} dir 
	 */
	update( dt, dir ) {
		super.update( dt, dir );

		if( this.isAttacking ) {
			this._animTimerAttack += dt;

			if( this._animTimerAttack / js13k.TARGET_FPS > 0.24 ) {
				this.isAttacking = false;
				this._animTimerAttack = 0;
			}
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
