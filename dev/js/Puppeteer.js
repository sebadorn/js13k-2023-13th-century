'use strict';


js13k.Puppeteer = {


	/**
	 *
	 * @private
	 * @param  {js13k.Character} char
	 * @param  {js13k.Character} p1
	 * @return {boolean}
	 */
	_checkForAttackAction( char, p1 ) {
		if( char.isAttacking || !char.item ) {
			return false;
		}

		if( char.item.checkHit( p1 ) ) {
			const timer = new js13k.Timer( char.level, 0.3 );

			char.action = function() {
				if( !timer.elapsed() ) {
					return;
				}

				if( char.isAttacking && char.attackTimer && char.attackTimer.elapsed() ) {
					char.action = null;
					return;
				}

				if( !char.isAttacking ) {
					char.attack();
					p1.takeDamage( char.item );
				}
			};

			return true;
		}

		return false;
	},


	/**
	 *
	 * @private
	 * @param  {js13k.Character} char
	 * @return {boolean}
	 */
	_checkForPickUpAction( char ) {
		if( char.item && !( char.item instanceof js13k.WeaponFist ) ) {
			return false;
		}

		let closestDist = Infinity;
		let closestDistVec = null;
		let closestItem = null;

		const c = char.getOffsetCenter();
		const charBox = char.getInteractHitbox();
		const distVec = new js13k.Vector2D();

		for( let i = 0; i < char.level.items.length; i++ ) {
			const item = char.level.items[i];

			if( item instanceof js13k.Weapon ) {
				const box = item.getInteractHitbox();

				// If can be picked up, do that directly
				if( js13k.overlap( box, charBox ) ) {
					const timer = new js13k.Timer( char.level, 0.5 );

					char.action = function() {
						if( timer.elapsed() ) {
							char.takeItem( item );
							char.action = null;
						}
					};

					return true;
				}

				distVec.set(
					box.x + box.w / 2 - c.x,
					box.y + box.h / 2 - c.y
				);
				const dist = distVec.length();

				if( dist < js13k.TILE_SIZE * 3 && closestDist > dist ) {
					closestDist = dist;
					closestDistVec = distVec.clone();
					closestItem = item;
				}
			}
		}

		if( !closestItem ) {
			return false;
		}

		const timer = new js13k.Timer( char.level, 1 );
		closestDistVec.normalize();

		// Walk in direction of weapon
		char.action = function( dt ) {
			if( timer.elapsed() ) {
				char.action = null;
				return;
			}

			// Can currently not move
			if( char.afflicted.stun ) {
				return;
			}

			// Walk towards weapon to pick-up
			return char.moveInDir( closestDistVec, dt, 0 );
		};

		return true;
	},


	/**
	 *
	 * @private
	 * @param  {js13k.Character} char
	 * @param  {js13k.Character} p1
	 * @return {boolean}
	 */
	_checkForWalkAction( char, p1 ) {
		const c1 = char.getOffsetCenter();
		const c2 = p1.getOffsetCenter();
		const dir = new js13k.Vector2D(
			c2.x - c1.x,
			c2.y - c1.y
		);

		if( dir.length() > js13k.TILE_SIZE * 4 ) {
			return false;
		}

		const timer = new js13k.Timer( char.level, 1 );
		dir.normalize();

		char.action = function( dt ) {
			if( timer.elapsed() ) {
				char.action = null;
				return;
			}

			// Can currently not move
			if( char.afflicted.stun ) {
				return;
			}

			// Walk towards player
			return char.moveInDir( dir, dt, 0 );
		};

		return true;
	},


	/**
	 * Decide the next action for the given character.
	 * Assumes the character does not already have an action.
	 * @param {js13k.Character} char - Non-player character to decide on action for.
	 * @param {js13k.Character} p1   - Player character
	 */
	decideAction( char, p1 ) {
		if( !p1 || char.afflicted.stun || p1.health <= 0 ) {
			return;
		}

		if( this._checkForPickUpAction( char ) ) {
			return;
		}

		if( this._checkForAttackAction( char, p1 ) ) {
			return;
		}

		// Default action: Walk towards player
		this._checkForWalkAction( char, p1 );
	},


};
