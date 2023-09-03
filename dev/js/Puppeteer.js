'use strict';


js13k.Puppeteer = {


	/**
	 * Decide the next action for the given character.
	 * Assumes the character does not already have an action.
	 * @param {js13k.Character} char - Non-player character to decide on action for.
	 * @param {js13k.Character} p1   - Player character
	 */
	decideAction( char, p1 ) {
		if( !p1 || char.afflicted.stun ) {
			return;
		}

		const timer = new js13k.Timer( char.level, 1 );

		const c1 = char.getOffsetCenter();
		const c2 = p1.getOffsetCenter();
		const dir = new js13k.Vector2D(
			c2.x - c1.x,
			c2.y - c1.y
		);
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
	},


};
