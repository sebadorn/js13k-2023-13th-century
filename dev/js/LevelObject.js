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

		this.afflicted = {};
		this.canInteract = false;
		this.effects = [];
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
	 * @private
	 * @param {number} dt
	 */
	_updateEffects( dt ) {
		for( let i = this.effects.length - 1; i >= 0; i-- ) {
			const effectFn = this.effects[i];
			const isDone = effectFn( dt );

			if( isDone ) {
				this.effects.splice( i, 1 );
			}
		}
	}


	/**
	 *
	 * @return {boolean}
	 */
	canTakeDamage() {
		return (
			// Is the target currently invincible, e.g. due to a prio hit?
			( !this.noDamageTimer || this.noDamageTimer.elapsed() ) &&
			// Is the target currently dodging?
			!this.isDodging
		);
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
	 *
	 * @private
	 * @param  {js13k.Vector2D} dir 
	 * @param  {number}         dt 
	 * @param  {number}         newState 
	 * @return {number}
	 */
	moveInDir( dir, dt, newState ) {
		// Cannot move at the moment
		if( this.afflicted.stun ) {
			return newState;
		}

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

		return newState;
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
		if( !this.canTakeDamage() ) {
			return;
		}

		if( this === this.level.player ) {
			js13k.Audio.play( js13k.Audio.DAMAGE_TAKEN );
		}

		this.noDamageTimer = this.noDamageTimer || new js13k.Timer( this.level );
		this.noDamageTimer.set( 0.5 );

		this.health = Math.max( 0, this.health - fromItem.damage );

		const effect = fromItem.getHitEffect( this );

		if( effect ) {
			this.effects.push( effect );
		}

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
		this._updateEffects( dt );

		if( dir ) {
			newState = this.moveInDir( dir, dt, newState );
		}

		if( this.state != newState ) {
			this._animTimerState = 0;
		}

		this.state = newState;
	}


};
