'use strict';


js13k.Level = class {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.isGameOver = false;
		this.timer = 0;

		/** @type {js13k.LevelObject[]} */
		this.objects = [];
		/** @type {js13k.Character[]} */
		this.characters = [];
		/** @type {js13k.PlayerShip?} */
		this.ship = null;

		this.selectedCharacter = {
			p1: null,
			p2: null,
		};
	}


	/**
	 *
	 * @param {js13k.Character[]} characters
	 */
	addCharacters( ...characters ) {
		this.characters.push( ...characters );
		this.objects.push( ...characters );
	}


	/**
	 *
	 * @param {object} mouse
	 * @param {number} mouse.x
	 * @param {number} mouse.y
	 */
	clickAt( mouse ) {
		if( this.isGameOver ) {
			return;
		}

		for( const character of this.characters ) {
			if(
				character.isPointInHitbox( mouse ) &&
				// The chosen character also has to be free right now
				this.selectedCharacter.p2 !== character
			) {
				this.selectedCharacter.p1 = character;
				break;
			}
		}
	}


	/**
	 *
	 */
	draw() {
		if( this.isGameOver ) {
			this.drawGameOver( js13k.Renderer.ctx );
			return;
		}

		this.objects.forEach( o => o.draw( js13k.Renderer.ctx ) );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawGameOver( ctx ) {
		const center = js13k.Renderer.center;

		ctx.font = 'bold 36px ' + js13k.FONT;
		ctx.textAlign = 'center';
		ctx.fillStyle = '#DDD';
		ctx.fillText( 'GAME OVER', center.x, center.y );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		if( this.isGameOver ) {
			if( js13k.Input.isPressed( js13k.Input.ACTION.DO, true ) ) {
				js13k.Renderer.reloadLevel();
			}
		}
		else {
			if( this.ship ) {
				const R = js13k.Renderer;
				R.translateX = R.center.x + this.ship.pos.x - this.ship.w / 2;
				R.translateY = R.center.y + this.ship.pos.y - this.ship.h / 2 - 64;
			}

			const dir = js13k.Input.getDirections();

			this.objects.sort( ( a, b ) => a.prio() - b.prio() );
			this.objects.forEach( o => {
				if( o === this.selectedCharacter.p1 ) {
					o.update( dt, dir );
				}
				else {
					o.update( dt );
				}
			} );
		}
	}


};
