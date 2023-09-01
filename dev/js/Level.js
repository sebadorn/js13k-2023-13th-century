'use strict';


js13k.Level = class {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.isGameOver = false;
		this.limits = {};
		this.timer = 0;

		/** @type {js13k.LevelObject[]} */
		this.objects = [];
		/** @type {js13k.Character[]} */
		this.characters = [];
		/** @type {js13k.LevelObject[]} */
		this.items = [];

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
		this.addObjects( ...characters );
	}


	/**
	 *
	 * @param  {js13k.LevelObject[]} items
	 */
	addItems( ...items ) {
		this.items.push( ...items );
		this.addObjects( ...items );
	}


	/**
	 *
	 * @param  {...js13k.LevelObject[]} objects
	 */
	addObjects( ...objects ) {
		objects.forEach( o => o.level = this );
		this.objects.push( ...objects );
	}


	/**
	 *
	 * @param {js13k.LevelObject} item
	 */
	removeItem( item ) {
		let index = this.items.indexOf( item );

		if( index >= 0 ) {
			this.items.splice( index, 1 );
		}

		index = this.objects.indexOf( item );

		if( index >= 0 ) {
			this.objects.splice( index, 1 );
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

		this.drawBackground( js13k.Renderer.ctx );
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
			const p1 = this.selectedCharacter.p1;

			if( p1 ) {
				js13k.Renderer.centerOn( p1 );

				if( js13k.Input.isPressed( js13k.Input.ACTION.ATTACK, true ) ) {
					p1.attack();
				}

				let dir = js13k.Input.getDirections();
				dir = new js13k.Vector2D( dir.x, dir.y );
				p1.update( dt, dir.normalize() );

				const p1HB = p1.getInteractHitbox();

				this.items.forEach( item => {
					item.highlight = false;

					if(
						item.canInteract &&
						js13k.overlap( item.getInteractHitbox(), p1HB )
					) {
						item.highlight = true;

						if( js13k.Input.isPressed( js13k.Input.ACTION.INTERACT, true ) ) {
							p1.takeItem( item );
						}
					}
				} );
			}

			this.objects.sort( ( a, b ) => a.prio() - b.prio() );
			this.objects.forEach( o => {
				if( o !== p1 ) {
					o.update( dt );

					if(
						// Is the player attacking?
						p1?.isAttacking &&
						// Is the target currently invincible, e.g. due to a prio hit?
						( !o.noDamageTimer || o.noDamageTimer.elapsed() ) &&
						o.health > 0 &&
						// Does the attack hit?
						p1.item.checkHit( o )
					) {
						o.takeDamage( p1.item );
					}
				}
			} );
		}
	}


};
