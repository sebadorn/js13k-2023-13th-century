'use strict';


js13k.Level.Finale = class extends js13k.Level {


	/**
     *
	 * @override
     * @constructor
     */
	constructor() {
		super();

		this.numTilesX = 24;
		this.numTilesY = 6;

		this.limits = {
			w: js13k.Renderer.center.x * 2,
			h: js13k.TILE_SIZE * this.numTilesY,
		};

		this.player = new js13k.Player( {
			x: js13k.TILE_SIZE * 4,
			y: this.limits.h / 2 - js13k.TILE_SIZE,
			item: new js13k.WeaponSaber()
		} );

		this.boss = new js13k.Boss( {
			x: this.limits.w - js13k.TILE_SIZE * 5,
			y: this.player.pos.y,
			facingX: -1,
			item: new js13k.WeaponSword()
		} );

		this.addCharacters( this.player, this.boss );

		let x = this.limits.w - js13k.TILE_SIZE + 6;

		const items = [
			new js13k.Crate( { x: js13k.TILE_SIZE * 4, y: 0 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 5, y: 0 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 12, y: 0 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 16, y: this.limits.h - js13k.TILE_SIZE } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 17, y: this.limits.h - js13k.TILE_SIZE * 2 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 18, y: this.limits.h - js13k.TILE_SIZE * 2 } ),
			new js13k.Gold( { x: js13k.TILE_SIZE - 18, y: -10 } ),
			new js13k.Gold( { x: js13k.TILE_SIZE - 18, y: js13k.TILE_SIZE * 6 - 130 } ),
			new js13k.Gold( { x: x - js13k.TILE_SIZE + 18, y: -10 } ),
			new js13k.Gold( { x: x - js13k.TILE_SIZE + 18, y: js13k.TILE_SIZE * 6 - 130 } ),
		];

		for( let i = 0; i < 8; i++ ) {
			if( i == 3 || i == 4 ) {
				continue;
			}

			let y = ( js13k.TILE_SIZE - 20 ) * i - 46;
			items.push( new js13k.Gold( { y: y } ) );
			items.push( new js13k.Gold( { x: x, y: y } ) );
		}

		this.addItems( ...items );

		this.introTimer = new js13k.Timer( this, 8 );
		this.locked = true;
		this.stage = 1;
		this.waveTimer = new js13k.Timer( this );
		this.drawnHealth = this.boss.health;

		js13k.Renderer.centerOn( this.player );
	}


	/**
	 *
	 * @private
	 */
	_drawBossHealth() {
		if( this.drawnHealth <= 0 ) {
			return;
		}

		const percent = Math.max( 0, this.drawnHealth / this.boss.healthTotal );
		const R = js13k.Renderer;

		/** @type {CanvasRenderingContext2D} */
		const ctxUI = R.ctxUI;

		let x = js13k.TILE_SIZE * 3;
		let y = R.cnvUI.height / R.scale - js13k.TILE_SIZE * 2;
		let w = R.cnvUI.width / R.scale - js13k.TILE_SIZE * 6;
		let h = 24;

		ctxUI.fillStyle = '#000a';
		ctxUI.fillRect( x, y, w, h );

		ctxUI.fillStyle = '#f00';
		ctxUI.fillRect( x, y, w * percent, h );

		ctxUI.fillStyle = '#fff2';
		ctxUI.fillRect( x, y, w * percent, h / 2 );

		ctxUI.fillStyle = '#fffa';
		ctxUI.fillRect( x, y, 2, h );
		ctxUI.fillRect( x + w / 3, y, 2, h );
		ctxUI.fillRect( x + w * 2 / 3, y, 2, h );
		ctxUI.fillRect( x + w, y, 2, h );
	}


	/**
	 *
	 * @private
	 */
	_nextEnemies() {
		this.waveTimer.set( 2 );
		this.waveEnemies = [];

		if( this.stage == 2 ) {
			this.waveEnemies.push(
				new js13k.Pirate( {
					x: -js13k.TILE_SIZE,
					y: js13k.TILE_SIZE * 1.5,
					item: new js13k.WeaponSaber()
				} ),
				new js13k.Pirate( {
					x: this.limits.w,
					y: js13k.TILE_SIZE * 2.5,
					facingX: -1
				} ),
			);
		}
		else if( this.stage == 3 ) {
			this.waveEnemies.push(
				new js13k.Pirate( {
					x: this.limits.w,
					y: js13k.TILE_SIZE * 1.5,
					facingX: -1
				} ),
				new js13k.Knight( {
					x: -js13k.TILE_SIZE,
					y: js13k.TILE_SIZE * 2.5,
					item: new js13k.WeaponSword()
				} ),
			);
		}

		this.waveEnemies.forEach( enemy => {
			enemy.noFixPos = true;
			const dir = new js13k.Vector2D( enemy.facingX / 2 );

			enemy.action = dt => {
				if( this.waveTimer.elapsed() ) {
					enemy.action = null;
					delete enemy.noFixPos;

					return;
				}

				return enemy.moveInDir( dir, dt, js13k.STATE_WALKING );
			};
		} );

		this.addCharacters( ...this.waveEnemies );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawBackground( ctx ) {
		const R = js13k.Renderer;

		this.drawWater( ctx, this.waterMovement );

		// Railing in top area
		if( this._cnvRailing ) {
			ctx.drawImage( this._cnvRailing, -6, -js13k.TILE_SIZE );
		}

		if( this._cnvShip ) {
			ctx.drawImage( this._cnvShip, 0, 0 );
		}
		else {
			const lineWidth = 6;
			const [cnvShip, ctxShip] = js13k.Renderer.getOffscreenCanvas(
				this.limits.w + lineWidth * 1.5,
				this.limits.h + lineWidth * 0.5 + js13k.TILE_SIZE * 2
			);

			// Ship outline
			ctxShip.lineWidth = lineWidth;
			let offset = lineWidth / 2;

			ctxShip.strokeStyle = '#8f563b';
			ctxShip.strokeRect(
				0, offset,
				this.limits.w + ctxShip.lineWidth + offset, this.limits.h + offset
			);

			// Ship tiles
			for( let x = 0; x < this.numTilesX; x++ ) {
				for( let y = 0; y < this.numTilesY; y++ ) {
					let dx = x * js13k.TILE_SIZE;
					let dy = lineWidth + y * js13k.TILE_SIZE;

					ctxShip.drawImage(
						R.images,
						0, 0, 16, 16,
						dx, dy, js13k.TILE_SIZE, js13k.TILE_SIZE
					);
				}
			}

			// Ship bottom area
			ctxShip.fillStyle = '#5a3c2e';
			ctxShip.fillRect(
				offset - ctxShip.lineWidth, this.limits.h,
				this.limits.w + ctxShip.lineWidth * 2, js13k.TILE_SIZE * 2
			);

			ctxShip.fillStyle = js13k.Renderer.createLinearGradient(
				0, this.limits.h, 0, this.limits.h + js13k.TILE_SIZE * 2,
				'#0003', '#4b73ac30'
			);
			ctxShip.fillRect(
				offset - ctxShip.lineWidth, this.limits.h,
				this.limits.w + ctxShip.lineWidth * 2, js13k.TILE_SIZE * 2
			);

			// Dark to light gradient on tiles for depth
			ctxShip.fillStyle = js13k.Renderer.createLinearGradient( 0, 0, 0, this.limits.h );
			ctxShip.fillRect( 0, 0, this.limits.w + offset, this.limits.h );

			this._cnvShip = cnvShip;
		}
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawForeground( ctx ) {
		const R = js13k.Renderer;
		const lineWidth = 6;

		// Waves against the ship
		if( this._cnvWaves ) {
			ctx.drawImage(
				this._cnvWaves,
				-this.waterMovement, this.limits.h + js13k.TILE_SIZE + 0.5,
				js13k.TILE_SIZE * ( this.numTilesX + 1 ), js13k.TILE_SIZE
			);
		}
		else {
			const [cnvWaves, ctxWaves] = R.getOffscreenCanvas(
				js13k.TILE_SIZE *  ( this.numTilesX + 1 ), js13k.TILE_SIZE
			);

			for( let i = 0; i <= this.numTilesX; i++ ) {
				ctxWaves.drawImage(
					R.images,
					32, 0, 16, 16,
					i * js13k.TILE_SIZE, 0,
					js13k.TILE_SIZE, js13k.TILE_SIZE
				);
			}

			this._cnvWaves = cnvWaves;
		}

		// Railing in lower area
		if( this._cnvRailing ) {
			ctx.drawImage(
				this._cnvRailing,
				-lineWidth, this.limits.h - js13k.TILE_SIZE
			);
		}
		else {
			const width = 2 * lineWidth + this.limits.w;
			const height = js13k.TILE_SIZE;

			const [canvasFg, ctxFg] = R.getOffscreenCanvas( width, height );
			ctxFg.lineWidth = lineWidth;

			// Railing top
			ctxFg.fillStyle = '#5a3c2e';
			ctxFg.fillRect(
				0, 0,
				this.limits.w + ctxFg.lineWidth * 2, lineWidth * 3
			);

			ctxFg.fillStyle = '#0002';
			ctxFg.fillRect(
				0, 12,
				this.limits.w + ctxFg.lineWidth * 2, lineWidth
			);

			ctxFg.fillStyle = '#fff1';
			ctxFg.fillRect(
				0, 0,
				this.limits.w + ctxFg.lineWidth * 2, lineWidth
			);

			// Railing bars
			const num = this.limits.w / js13k.TILE_SIZE + 1;

			for( let i = 0; i <= num; i++ ) {
				let x = i * js13k.TILE_SIZE;
				let y = lineWidth * 3;
				let h = js13k.TILE_SIZE + 1;

				ctxFg.fillStyle = '#5a3c2e';
				ctxFg.fillRect(
					x, y,
					lineWidth * 3, h
				);

				ctxFg.fillStyle = '#0002';
				ctxFg.fillRect(
					x, y,
					lineWidth, h
				);

				ctxFg.fillStyle = '#fff1';
				ctxFg.fillRect(
					x + 12, y,
					6, h
				);
			}

			this._cnvRailing = canvasFg;
		}

		this._drawBossHealth();

		if( !this.introTimer.elapsed() ) {
			R.drawMonologueBox(
				this.player,
				[
					'So much gold! What a treasure!',
					'There is only one other group left',
					'opposing us. Let’s finish this!'
				]
			);
		}

		if( this.endingTimer && !this.endingTimer.elapsed() ) {
			R.drawMonologueBox(
				this.player,
				[
					'Cast off, crew!',
					'Before even more arrive!'
				]
			);
		}
	}


	/**
	 *
	 * @override
	 * @param {number} dt
	 */
	update( dt ) {
		if( this.introTimer.progress() > 0.3 ) {
			this.locked = false;
		}

		super.update( dt );
		this.waterMovement = Math.sin( this.timer / 50 ) * 12;

		if( this.drawnHealth > this.boss.health ) {
			this.drawnHealth = Math.max( this.boss.health, this.drawnHealth - dt );
		}

		const percent = Math.max( 0, this.drawnHealth / this.boss.healthTotal );

		if( this.stage == 1 ) {
			if( percent < 0.67 ) {
				this.stage = 2;
				this._nextEnemies();
			}
		}
		else if( this.stage == 2 ) {
			if( percent < 0.34 ) {
				this.stage = 3;
				this._nextEnemies();
			}
		}
		else if( percent == 0 && this.numEnemiesAlive() == 0 ) {
			if( !this.endingTimer ) {
				this.endingTimer = new js13k.Timer( this, 5 );
			}
			else if( this.endingTimer?.elapsed() ) {
				js13k.Renderer.changeLevel( js13k.Level.Ending.id );
			}
		}
	}


};

js13k.Level.Finale.id = 5;
