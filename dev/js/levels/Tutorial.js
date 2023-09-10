'use strict';


js13k.Level.Tutorial = class extends js13k.Level {


	/**
	 *
	 * @override
	 * @constructor
	 */
	constructor() {
		super();

		this.limits = {
			w: js13k.Renderer.center.x * 2,
			h: js13k.TILE_SIZE * 8,
		};

		const fighter1 = new js13k.Player( {
			x: js13k.TILE_SIZE * 6,
			y: js13k.TILE_SIZE * 3,
			item: new js13k.WeaponFist()
		} );

		const enem1 = new js13k.Dummy( {
			x: js13k.TILE_SIZE * 13,
			y: js13k.TILE_SIZE * 3,
			item: new js13k.WeaponSword()
		} );

		this.addCharacters( fighter1, enem1 );
		this.player = fighter1;
		this.tutorialEnemy = enem1;

		this.locked = true;
		this.tutStep = -1;
		this.introTimer = new js13k.Timer( this, 6 );
	}


	/**
	 *
	 * @override
	 */
	draw() {
		super.draw();

		/** @type {CanvasRenderingContext2D} */
		const ctx = js13k.Renderer.ctx;

		ctx.font = '600 23px ' + js13k.FONT_MONO;
		ctx.fillStyle = '#fffc';
		ctx.textAlign = 'center';

		const p1 = this.player;
		const oc = p1.getOffsetCenter();
		const enemOC = this.tutorialEnemy.getOffsetCenter();

		// Walking
		if( this.tutStep === 0 ) {
			ctx.fillText( 'Move with [W][A][S][D] or arrow keys', oc.x, oc.y - p1.h );
		}
		// Disarm
		else if( this.tutStep === 1 ) {
			ctx.fillText( 'Attack with [ENTER] or [SPACE]', enemOC.x, enemOC.y - this.tutorialEnemy.h * 2 );
		}
		// Pick up weapon
		else if( this.tutStep === 2 ) {
			const lo = this.items[0];

			if( lo ) {
				const hb = lo.getInteractHitbox();
				ctx.fillText( 'Pick up with [E]', hb.x + hb.w / 2, hb.y - hb.h - js13k.TILE_SIZE_HALF - 8 );
			}
		}
		// Attack
		else if( this.tutStep === 3 ) {
			ctx.fillText( 'Attack with the sword', enemOC.x, enemOC.y - this.tutorialEnemy.h );
		}
		// Dodge
		else if( this.tutStep === 4 ) {
			ctx.fillText( 'You can dodge roll with [SHIFT]', oc.x, oc.y - p1.h - js13k.TILE_SIZE );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawBackground( ctx ) {
		const p1 = this.player;
		const te = this.tutorialEnemy;
		const item = this.items[0];

		ctx.fillStyle = '#222';
		ctx.fillRect(
			p1.pos.x - js13k.TILE_SIZE_HALF,
			p1.pos.y + p1.h - js13k.TILE_SIZE_HALF,
			js13k.TILE_SIZE * 2, js13k.TILE_SIZE
		);

		if( te.health > 0 ) {
			ctx.fillRect(
				te.pos.x - js13k.TILE_SIZE_HALF,
				te.pos.y + te.h - js13k.TILE_SIZE_HALF,
				js13k.TILE_SIZE * 2, js13k.TILE_SIZE
			);
		}

		if( item ) {
			const hb = item.getInteractHitbox();

			ctx.fillRect(
				hb.x - js13k.TILE_SIZE_HALF,
				hb.y + hb.h - js13k.TILE_SIZE_HALF * 1.5,
				js13k.TILE_SIZE * 3, js13k.TILE_SIZE * 1.25
			);
		}
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawForeground( ctx ) {
		/** @type {js13k.Renderer} */
		const R = js13k.Renderer;

		if( this.tutStep < 0 ) {
			R.drawMonologueBox(
				this.player,
				[
					'Before heading out, let’s',
					'think back on my training.',
					'How did it go again?',
				],
				2
			);
		}

		if( this.tutStep !== 5 ) {
			return;
		}

		R.drawMonologueBox(
			this.player,
			[
				'Right, that’s how it goes!',
				'Now I am prepared!',
			],
			2
		);

		const progress = Math.sin( this.timer / 25 );
		let x = this.limits.w - js13k.TILE_SIZE + progress * 8;
		let y = this.limits.h / 2 + 9;
		const center = { x: x, y: y };

		ctx.fillStyle = '#fff';
		ctx.textAlign = 'right';
		ctx.fillText( 'Continue', x - 22, y - 8 );

		let rot = -Math.PI / 2;

		R.rotateCenter( ctx, rot, center );
		ctx.drawImage(
			R.imageArrow,
			x, y,
			5 * 6, 3 * 6
		);
		R.rotateCenter( ctx, -rot, center );
	}


	/**
	 *
	 * @override
	 * @param {number} dt
	 */
	update( dt ) {
		const p1 = this.player;
		const Input = js13k.Input;

		if( this.tutStep === -1 ) {
			js13k.Renderer.centerOn( p1 );

			if( Input.isPressed( Input.ACTION.DO, true ) ) {
				this.introTimer.set( 0 );
			}

			if( this.introTimer.elapsed() ) {
				this.locked = false;
				this.tutStep = 0;
			}
		}
		// Check for walking
		else if( this.tutStep === 0 ) {
			// Ignore further attack inputs by querying and
			// forgetting it to avoid a sequence break.
			Input.isPressed( Input.ACTION.ATTACK, true );

			if( this.tutStepTimer0 ) {
				if( this.tutStepTimer0.elapsed() ) {
					this.tutStep = 1;
				}
			}
			else if(
				Input.isPressed( Input.ACTION.UP ) ||
				Input.isPressed( Input.ACTION.RIGHT ) ||
				Input.isPressed( Input.ACTION.DOWN ) ||
				Input.isPressed( Input.ACTION.LEFT )
			) {
				this.tutStepTimer0 = new js13k.Timer( this, 3 );
			}
		}
		// Check if enemy has been disarmed
		else if( this.tutStep === 1 ) {
			if( !( this.tutorialEnemy.item instanceof js13k.WeaponSword ) ) {
				const weapon = this.items[0];
				weapon.pos.x = this.tutorialEnemy.pos.x + js13k.TILE_SIZE * 2;
				weapon.pos.y += js13k.TILE_SIZE_HALF;

				this.tutStep = 2;
			}
		}
		// Check if weapon has been picked up
		else if( this.tutStep === 2 ) {
			if( p1.item instanceof js13k.WeaponSword ) {
				this.tutStep = 3;
			}
		}
		// Check if enemy has taken damage
		else if( this.tutStep === 3 ) {
			if( this.tutorialEnemy.health < this.tutorialEnemy.healthTotal - p1.item.damage ) {
				this.tutStep = 4;
			}
		}
		// Check for dodge roll execution
		else if( this.tutStep === 4 ) {
			if( Input.isPressed( Input.ACTION.DODGE ) ) {
				this.tutStep = 5;
			}
		}
		// Check if level end has been reached
		else if( this.tutStep === 5 ) {
			const oc = p1.getOffsetCenter();

			if( oc.x >= this.limits.w - js13k.TILE_SIZE_HALF ) {
				js13k.Renderer.changeLevel( new js13k.Level.Port() );
				return;
			}
		}

		super.update( dt );
	}


};
