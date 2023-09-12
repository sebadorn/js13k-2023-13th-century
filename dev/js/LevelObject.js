'use strict';


js13k.LevelObject = class {


	/**
     * 
     * @constructor
     * @param {object?} data
     * @param {number?} data.facingX
     * @param {number}  data.x       - X coordinate
     * @param {number}  data.y       - Y coordinate
     * @param {number}  data.w       - Width
     * @param {number}  data.h       - Height
     */
	constructor( data = {} ) {
		this.pos = new js13k.Vector2D( data.x, data.y );
		this.w = data.w || 0;
		this.h = data.h || 0;

		this._animTimerState = 0;

		// /** @type {js13k.Timer} */
		// this.noDamageTimer = null;

		this.afflicted = {};
		// this.canInteract = false;
		this.effects = [];
		this.facingX = data.facingX || 1;
		this.health = this.healthTotal = Infinity;
		// this.highlight = false;
		// this.level = null;
		this.speed = new js13k.Vector2D( 4, 4 );
		this.state = js13k.STATE_IDLE;
		this.weight = 0;
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
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw() {}


	/**
	 *
	 * @private
	 * @param {js13k.Vector2D} oldPos
	 * @param {boolean?}       isAfterDodge
	 */
	fixPosition( oldPos, isAfterDodge ) {
		if( !this.level || this.noFixPos ) {
			return;
		}

		this.pos.x = Math.min(
			this.level.limits.w - this.w,
			Math.max( 0, this.pos.x )
		);

		this.pos.y = Math.min(
			this.level.limits.h - this.h - 8,
			Math.max( -js13k.TILE_SIZE_HALF, this.pos.y )
		);

		const dir = this.pos.clone().sub( oldPos );
		dir.set(
			dir.x < 0 ? -dir.x : dir.x,
			dir.y < 0 ? -dir.y : dir.y
		);

		const aabb = this.getInteractHitbox();

		this.level.objects.forEach( lo => {
			if(
				lo == this || !lo.isSolid || lo.health <= 0 ||
				// Dodging through characters is possible
				( lo instanceof js13k.Character && this.isDodging )
			) {
				return;
			}

			const itemHb = lo.getInteractHitbox();
			const overlap = js13k.calcOverlap( aabb, itemHb );

			// Position overlap, needs correction
			if( overlap > Number.EPSILON ) {
				// Objects are stuck inside each other. Could happen
				// through a dodge roll that ends inside an enemy.
				if( isAfterDodge && overlap >= 8 ) {
					this.pos.set(
						dir.x > 0 ? itemHb.x + itemHb.w : itemHb.x - aabb.w,
						oldPos.y
					);
				}
				else {
					this.pos.set( oldPos.x, oldPos.y );
				}
			}
		} );
	}


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
		if( this.afflicted.stun && this !== this.level?.player ) {
			return newState;
		}

		const oldPos = this.pos.clone();
		this.pos.x += Math.round( dt * dir.x * this.speed.x );
		this.pos.y += Math.round( dt * dir.y * this.speed.y );

		// Only update facing direction if object moved
		if( dir.x || dir.y ) {
			newState = js13k.STATE_WALKING;

			// 1: facing right, -1: facing left
			this.facingX = dir.x == 0 ? this.facingX : ( dir.x > 0 ? 1 : -1 );
		}

		this.fixPosition( oldPos );

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
	 *
	 * @return {boolean}
	 */
	shouldBlinkFromDamage() {
		if( !this.noDamageTimer || this.noDamageTimer.elapsed() ) {
			return false;
		}

		const progress = this.noDamageTimer.progress();

		return (
			( progress >= 0 && progress <= 0.2 ) ||
			( progress >= 0.4 && progress <= 0.6 ) ||
			( progress >= 0.8 && progress <= 1 )
		);
	}


	/**
	 * Take damage from an item, e.g. a weapon.
	 * @param {js13k.Weapon} fromItem
	 */
	takeDamage( fromItem ) {
		if( !fromItem || !this.canTakeDamage() ) {
			return;
		}

		if( this == this.level.player ) {
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
			this.dropItem && this.dropItem();
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
