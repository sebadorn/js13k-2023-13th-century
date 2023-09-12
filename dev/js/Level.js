'use strict';


js13k.Level = class {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		// this.isGameOver = false;
		// this.locked = false;

		this.limits = {};
		this.timer = 0;

		/** @type {js13k.LevelObject[]} */
		this.objects = [];
		/** @type {js13k.Character[]} */
		this.characters = [];
		/** @type {js13k.LevelObject[]} */
		this.items = [];
	}


	/**
	 *
	 * @private
	 * @param {js13k.Character} player
	 * @param {number}          dt
	 */
	_updatePlayer( player, dt ) {
		js13k.Renderer.centerOn( player );

		if( !player.isDodging && !player.isAttacking ) {
			if( js13k.Input.isPressed( js13k.Input.ACTION.DODGE, true ) ) {
				player.dodge();
			}
			else if( js13k.Input.isPressed( js13k.Input.ACTION.ATTACK, true ) ) {
				player.attack();
			}

			let dir = js13k.Input.getDirections();
			dir = new js13k.Vector2D( dir.x, dir.y );
			player.update( dt, dir.normalize() );

			const p1HB = player.getInteractHitbox();

			this.items.forEach( item => {
				item.highlight = false;

				if(
					item.canInteract &&
					js13k.overlap( item.getInteractHitbox(), p1HB )
				) {
					item.highlight = true;

					if( js13k.Input.isPressed( js13k.Input.ACTION.INTERACT, true ) ) {
						player.takeItem( item );
					}
				}
			} );
		}
		else {
			player.update( dt );
		}
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
	 */
	draw() {
		this.drawBackground && this.drawBackground( js13k.Renderer.ctx );
		this.objects.forEach( o => o.draw( js13k.Renderer.ctx ) );
		this.drawForeground && this.drawForeground( js13k.Renderer.ctx );

		if( this.isGameOver ) {
			js13k.Renderer.drawGameOver();
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number}                   offsetX
	 */
	drawWater( ctx, offsetX ) {
		/** @type {js13k.Renderer} */
		const R = js13k.Renderer;

		if( !this._cnvWater ) {
			const [cnvWater, ctxWater] = R.getOffscreenCanvas(
				R.center.x * 2 + js13k.TILE_SIZE * 3,
				R.center.y * 2 + js13k.TILE_SIZE * 2
			);
			ctxWater.fillStyle = R.patternWater;
			ctxWater.fillRect( 0, 0, cnvWater.width, cnvWater.height );
			this._cnvWater = cnvWater;
		}

		let x = Math.ceil( -R.translateX / R.scale / js13k.TILE_SIZE ) * js13k.TILE_SIZE;
		let y = Math.ceil( -R.translateY / R.scale / js13k.TILE_SIZE ) * js13k.TILE_SIZE;

		ctx.drawImage(
			this._cnvWater,
			x - js13k.TILE_SIZE * 1.5 - offsetX,
			y - js13k.TILE_SIZE
		);
	}


	/**
	 *
	 * @return {number}
	 */
	numEnemiesAlive() {
		let alive = 0;

		this.objects.forEach( o => {
			if( o instanceof js13k.Enemy ) {
				alive += o.health > 0 ? 1 : 0;
			}
		} );

		return alive;
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
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		if( this.isGameOver ) {
			if( js13k.Input.isPressed( js13k.Input.ACTION.DO, true ) ) {
				js13k.Renderer.reloadLevel();
			}

			return;
		}

		if( !this.locked ) {
			const p1 = this.player;

			if( p1 ) {
				if( p1.drawnHealth <= 0 ) {
					this.isGameOver = true;
					return;
				}

				this._updatePlayer( p1, dt );
			}

			this.objects.sort( ( a, b ) => a.prio() - b.prio() );
			this.objects.forEach( o => {
				if( o == p1 ) {
					return;
				}

				o.update( dt );

				if(
					// Is the player attacking?
					p1?.isAttacking &&
					o.health > 0 &&
					o.canTakeDamage() &&
					// Does the attack hit?
					p1.item?.checkHit( o )
				) {
					o.takeDamage( p1.item );
				}

				if( !o.action ) {
					js13k.Puppeteer.decideAction( o, p1 );
				}
			} );
		}
	}


};
