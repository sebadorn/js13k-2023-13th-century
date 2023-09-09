'use strict';


js13k.Level.Tutorial = class extends js13k.Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		super();

		this.limits = {
			w: js13k.Renderer.center.x * 2,
			h: js13k.TILE_SIZE * 8,
		};

		const fighter1 = new js13k.Fighter( {
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

		ctx.font = '600 23px "Courier New", monospace';
		ctx.fillStyle = '#fffc';
		ctx.textAlign = 'center';

		const p1 = this.player;
		const oc = p1.getOffsetCenter();
		const enemOC = this.tutorialEnemy.getOffsetCenter();

		if( this.tutStep < 0 ) {
			ctx.fillStyle = '#111';
			js13k.Renderer.fillBackground();
		}
		// Walking
		else if( this.tutStep === 0 ) {
			ctx.fillText( 'Move with [W][A][S][D] or arrow keys', oc.x, oc.y - p1.h );
		}
		// Disarm
		else if( this.tutStep === 1 ) {
			ctx.fillText( 'Attack with [ENTER]', enemOC.x, enemOC.y - this.tutorialEnemy.h * 2 );
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
			ctx.fillText( 'You can dodge roll with [R]', oc.x, oc.y - p1.h - js13k.TILE_SIZE );
		}
		// Continue
		else if( this.tutStep === 5 ) {
			ctx.fillText( 'Right, that’s how it goes!', js13k.Renderer.center.x, 0 );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawBackground( ctx ) {
		if( this.tutStep < 0 ) {
			return;
		}

		const p1 = this.player;
		const te = this.tutorialEnemy;
		const item = this.items[0];

		ctx.fillStyle = '#222';
		ctx.fillRect(
			p1.pos.x - js13k.TILE_SIZE_HALF,
			p1.pos.y + p1.h - js13k.TILE_SIZE_HALF,
			js13k.TILE_SIZE * 2, js13k.TILE_SIZE
		);
		ctx.fillRect(
			te.pos.x - js13k.TILE_SIZE_HALF,
			te.pos.y + te.h - js13k.TILE_SIZE_HALF,
			js13k.TILE_SIZE * 2, js13k.TILE_SIZE
		);

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
		const R = js13k.Renderer;

		if( this.tutStep < 0 ) {
			const progress = this.introTimer.progress();
			const scale = 1 - ( progress >= 0.5 ? 2 - progress * 2 : 1 );

			R.scaleCenter( R.ctxUI, 1, 1 - scale, R.center );
			R.drawMonologueBox(
				this.player,
				[
					'Before heading out, let’s',
					'think back on my training.',
					'How did it go again?',
				],
				0
			);
			R.ctxUI.setTransform( R.scale, 0, 0, R.scale, 0, 0 );
		}

		if( this.tutStep !== 5 ) {
			return;
		}

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
			if(
				Input.isPressed( Input.ACTION.UP ) ||
				Input.isPressed( Input.ACTION.RIGHT ) ||
				Input.isPressed( Input.ACTION.DOWN ) ||
				Input.isPressed( Input.ACTION.LEFT )
			) {
				this.tutStep = 1;
			}
		}
		// Check if enemy has been disarmed
		else if( this.tutStep === 1 ) {
			if( !( this.tutorialEnemy.item instanceof js13k.WeaponSword ) ) {
				this.items[0].pos.x = this.tutorialEnemy.pos.x + js13k.TILE_SIZE * 2;
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
