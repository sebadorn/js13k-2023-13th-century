'use strict';


js13k.LevelObject = class {


	/**
     * 
     * @constructor
     * @param {object?} data
     * @param {number}  data.x - X coordinate
     * @param {number}  data.y - Y coordinate
     * @param {number}  data.w - Width
     * @param {number}  data.h - Height
     */
	constructor( data = {} ) {
		this.pos = new js13k.Vector2D( data.x, data.y );
		this.w = data.w || 0;
		this.h = data.h || 0;

		this._animTimerState = 0;
		/** @type {js13k.Timer} */
		this.noDamageTimer = null;

		this.canInteract = false;
		this.facing = new js13k.Vector2D( 1, 0 );
		this.healthTotal = Infinity;
		this.health = Infinity;
		this.highlight = false;
		this.level = null;
		this.speed = new js13k.Vector2D();
		this.state = js13k.STATE_IDLE;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} _ctx
	 */
	draw( _ctx ) {}


	/**
	 *
	 * @return {object}
	 */
	getInteractHitbox() {
		return {
			x: this.pos.x,
			y: this.pos.y,
			w: this.w,
			h: this.h
		};
	}


	/**
	 *
	 * @return {object}
	 */
	getOffsetCenter() {
		return {
			x: this.pos.x + this.w / 2,
			y: this.pos.y + this.h / 2,
		};
	}


	/**
	 * Get the render sorting priority.
	 * @return {number}
	 */
	prio() {
		return this.pos.y + this.h;
	}


	/**
	 * Take damage from an item, e.g. a weapon.
	 * @param {js13k.Weapon} fromItem
	 */
	takeDamage( fromItem ) {
		this.noDamageTimer = this.noDamageTimer || new js13k.Timer( this.level );
		this.noDamageTimer.set( 0.5 );

		this.health = Math.max( 0, this.health - fromItem.damage );

		// TODO: trigger other effects like a knockback

		if( this.health <= 0 ) {
			this.dropItem();
		}
	}


	/**
	 *
	 * @param {number}          dt 
	 * @param {js13k.Vector2D?} dir 
	 */
	update( dt, dir ) {
		if( this.health <= 0 || this.owner ) {
			return;
		}

		let newState = js13k.STATE_IDLE;

		this._animTimerState += dt;

		if( dir ) {
			this.pos.x += Math.round( dt * dir.x * this.speed.x );
			this.pos.y += Math.round( dt * dir.y * this.speed.y );

			// Only update facing direction if object moved
			if( dir.x || dir.y ) {
				newState = js13k.STATE_WALKING;

				this.facing.set(
					dir.x == 0 ? this.facing.x : ( dir.x > 0 ? 1 : -1 ), // 1: facing right, -1: facing left
					dir.y == 0 ? this.facing.y : ( dir.y > 0 ? 1 : -1 )  // 1: facing down,  -1: facing up
				);
			}
		}

		if( this.state != newState ) {
			this._animTimerState = 0;
		}

		this.state = newState;
	}


};
