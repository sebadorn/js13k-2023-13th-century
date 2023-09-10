'use strict';


js13k.Level.Ship = class extends js13k.Level {


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
			w: js13k.TILE_SIZE * this.numTilesX,
			h: js13k.TILE_SIZE * this.numTilesY,
		};

		this.player = new js13k.Player( {
			x: this.limits.w / 2 - js13k.TILE_SIZE * 2,
			y: this.limits.h / 2 - js13k.TILE_SIZE,
			item: new js13k.WeaponFist()
		} );

		this.addCharacters( this.player );

		const yBottom = this.limits.h - js13k.TILE_SIZE;

		this.addItems(
			this._buildMast(),
			new js13k.WeaponSword( {
				x: js13k.TILE_SIZE * 4,
				y: js13k.TILE_SIZE * 4.5
			} ),
			new js13k.Crate( { x: this.limits.w / 2 - js13k.TILE_SIZE_HALF, y: this.limits.h / 2 - js13k.TILE_SIZE } ),
			new js13k.Crate( { y: yBottom } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 4 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 2, y: js13k.TILE_SIZE } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 2, y: js13k.TILE_SIZE } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 18 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 19 } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 18.5, y: js13k.TILE_SIZE } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 8.5, y: yBottom } ),
			new js13k.Crate( { x: js13k.TILE_SIZE * 9.5, y: yBottom } ),
			new js13k.Crate( { x: this.limits.w - js13k.TILE_SIZE * 2, y: yBottom } ),
		);

		this.introTimer = new js13k.Timer( this, 10 );
		this.waveTimer = new js13k.Timer( this );
		this.nextWaveTimer = new js13k.Timer( this, 4 );
		this.waveCounter = 0;
		this.numWaves = 3;
	}


	/**
	 *
	 * @private
	 * @return {js13k.LevelObject}
	 */
	_buildMast() {
		const mast = new js13k.LevelObject( {
			x: this.limits.w / 2 + js13k.TILE_SIZE_HALF + 8,
			y: this.limits.h / 2 - js13k.TILE_SIZE_HALF * 1.25,
			w: js13k.TILE_SIZE - 16,
			h: js13k.TILE_SIZE_HALF * 1.25
		} );

		mast.isSolid = true;

		mast.draw = function( ctx ) {
			const y = this.pos.y - js13k.TILE_SIZE * 8;
			const h = this.h + js13k.TILE_SIZE * 8;
			const lw = this.w / 3;

			ctx.fillStyle = '#5a3c2e';
			ctx.fillRect( this.pos.x, y, this.w, h );
			ctx.fillStyle = '#0002';
			ctx.fillRect( this.pos.x, y, lw, h );
			ctx.fillStyle = '#fff1';
			ctx.fillRect( this.pos.x + this.w - lw, y, lw, h );
		};

		return mast;
	}


	/**
	 *
	 * @private
	 */
	_startWave() {
		this.waveCounter++;
		this.waveTimer.set( 2 );
		this.waveEnemies = [];

		if( this.waveCounter === 1 ) {
			this.waveEnemies.push(
				new js13k.Pirate( {
					x: -js13k.TILE_SIZE,
					y: js13k.TILE_SIZE * 1.5
				} ),
				new js13k.Pirate( {
					x: -js13k.TILE_SIZE,
					y: js13k.TILE_SIZE * 3
				} ),
				new js13k.Pirate( {
					x: this.limits.w,
					y: js13k.TILE_SIZE * 2.5,
					facingX: -1
				} ),
			);
		}
		else if( this.waveCounter === 2 ) {
			this.waveEnemies.push(
				new js13k.Pirate( {
					x: this.limits.w,
					y: js13k.TILE_SIZE * 1.5,
					facingX: -1
				} ),
				new js13k.Pirate( {
					x: this.limits.w,
					y: js13k.TILE_SIZE * 3,
					facingX: -1
				} ),
				new js13k.Pirate( {
					x: -js13k.TILE_SIZE,
					y: js13k.TILE_SIZE * 2.5
				} ),
			);
		}
		else if( this.waveCounter === 3 ) {
			this.waveEnemies.push(
				new js13k.Pirate( {
					x: this.limits.w,
					y: js13k.TILE_SIZE * 1.5,
					facingX: -1
				} ),
				new js13k.Knight( {
					x: this.limits.w,
					y: js13k.TILE_SIZE * 3,
					facingX: -1,
					item: new js13k.WeaponSword()
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
		/** @type {CanvasRenderingContext2D} */
		const ctxUI = js13k.Renderer.ctxUI;
		ctxUI.fillStyle = '#fff';
		ctxUI.font = '600 23px ' + js13k.FONT_MONO;
		ctxUI.textAlign = 'left';
		ctxUI.fillText(
			`Wave ${this.waveCounter}/${this.numWaves}`,
			js13k.TILE_SIZE_HALF, js13k.TILE_SIZE_HALF
		);

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
			const [cnvWaves, ctxWaves] = js13k.Renderer.getOffscreenCanvas(
				js13k.TILE_SIZE *  ( this.numTilesX + 1 ), js13k.TILE_SIZE
			);

			for( let i = 0; i <= this.numTilesX; i++ ) {
				ctxWaves.drawImage(
					js13k.Renderer.images,
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

			const [canvasFg, ctxFg] = js13k.Renderer.getOffscreenCanvas( width, height );
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

		if( !this.introTimer.elapsed() ) {
			js13k.Renderer.drawMonologueBox(
				this.player,
				[
					'The Rhine has become a',
					'battlefield! I have to',
					'to defend the ship!',
				],
				2
			);
		}
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
	 * @override
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );
		this.waterMovement = ( this.timer % 20 ) / 20 * js13k.TILE_SIZE;

		// More waves to come and wait for next one is over
		if( this.waveCounter <= this.numWaves && this.nextWaveTimer.elapsed() ) {
			this._startWave();
			this.nextWaveTimer.set( 20 );
		}

		// No more waves coming and all enemies are defeated
		if( this.waveCounter > this.numWaves && this.numEnemiesAlive() === 0 ) {
			js13k.Renderer.changeLevel( new js13k.Level.Finale() );
		}
	}


};
