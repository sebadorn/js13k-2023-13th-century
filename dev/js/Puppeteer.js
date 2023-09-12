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
		if( !char.item || !char.item.checkHit( p1 ) ) {
			return false;
		}

		// Cooldown after last attack. But also do not look for any other action.
		if( char.coolDownAttack && !char.coolDownAttack.elapsed() ) {
			return true;
		}

		const timer = new js13k.Timer( char.level, 0.3 );

		char.action = () => {
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

				char.coolDownAttack = char.coolDownAttack || new js13k.Timer( char.level );
				char.coolDownAttack.set( 0.8 );
			}
		};

		return true;
	},


	/**
	 *
	 * @override
	 * @param  {js13k.Character} char 
	 * @param  {js13k.Player}    p1 
	 * @return {boolean}
	 */
	_checkForDodgeAction( char, p1 ) {
		if(
			!( char instanceof js13k.Knight ) || Math.random() < 0.7 ||
			// Cooldown after last dodge
			( char.coolDownDodge && !char.coolDownDodge.elapsed() )
		) {
			return false;
		}

		const c1 = char.getOffsetCenter();
		const c2 = p1.getOffsetCenter();
		const dir = new js13k.Vector2D(
			c2.x - c1.x,
			c2.y - c1.y
		);

		if(
			Math.abs( dir.y ) > js13k.TILE_SIZE_HALF ||
			dir.length() > js13k.TILE_SIZE * 2
		) {
			return false;
		}

		char.facingX = dir.x < 0 ? -1 : 1;
		char.speed.set( 11, 11 );
		char.dodge();

		char.coolDownDodge = char.coolDownDodge || new js13k.Timer( char.level );
		char.coolDownDodge.set( 1.5 );

		char.action = () => {
			if( !char.isDodging ) {
				char.speed.set( 3, 3 );
				char.action = null;
			}
		};

		return true;
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
		const items = char.level.items;

		for( let i = 0; i < items.length; i++ ) {
			const item = items[i];

			if( item instanceof js13k.Weapon ) {
				const box = item.getInteractHitbox();

				// If can be picked up, do that directly
				if( js13k.overlap( box, charBox ) ) {
					const timer = new js13k.Timer( char.level, 0.5 );

					char.action = () => {
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

		const timer = new js13k.Timer( char.level, 0.5 );
		closestDistVec.normalize().mul( 0.5 );

		// Walk in direction of weapon
		char.action = dt => {
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

		if( dir.length() > char.perception ) {
			return false;
		}

		const timer = new js13k.Timer( char.level, 1 );
		dir.normalize();

		char.action = dt => {
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
		if(
			!p1 ||
			char instanceof js13k.Dummy ||
			!( char instanceof js13k.Character ) ||
			char.afflicted.stun ||
			char.isAttacking ||
			char.isDodging ||
			p1.health <= 0
		) {
			return;
		}

		if(
			this._checkForPickUpAction( char ) ||
			this._checkForDodgeAction( char, p1 ) ||
			this._checkForAttackAction( char, p1 )
		) {
			return;
		}

		// Default action: Walk towards player
		this._checkForWalkAction( char, p1 );
	},


};
