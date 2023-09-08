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
			x: js13k.TILE_SIZE * 3,
			y: js13k.TILE_SIZE * 3,
			item: new js13k.WeaponFist()
		} );

		const enem1 = new js13k.Dummy( {
			x: js13k.TILE_SIZE * 14,
			y: js13k.TILE_SIZE * 3,
			item: new js13k.WeaponSword()
		} );

		this.addCharacters( fighter1, enem1 );
		this.selectedCharacter.p1 = fighter1;
		this.tutorialEnemy = enem1;

		this.tutStep = 0;
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
		ctx.fillStyle = '#fff7';
		ctx.textAlign = 'center';

		const p1 = this.selectedCharacter.p1;
		const oc = p1.getOffsetCenter();
		const enemOC = this.tutorialEnemy.getOffsetCenter();

		// Walking
		if( this.tutStep === 0 ) {
			ctx.fillText( 'Move with [W][A][S][D] or arrow keys', oc.x, oc.y - p1.h );
		}
		// Disarm
		else if( this.tutStep === 1 ) {
			ctx.fillText( 'Attack with [ENTER]', enemOC.x, enemOC.y - this.tutorialEnemy.h * 2 );
		}
		// Pick up weapon
		else if( this.tutStep === 2 ) {
			ctx.fillText( 'Pick up with [E]', enemOC.x, enemOC.y - this.tutorialEnemy.h );
		}
		// Attack
		else if( this.tutStep === 3 ) {
			ctx.fillText( 'Attack with the sword', enemOC.x, enemOC.y - this.tutorialEnemy.h );
		}
		// Dodge
		else if( this.tutStep === 4 ) {
			ctx.fillText( 'You can dodge roll with [R]', oc.x, oc.y - p1.h );
		}
		// Continue
		else if( this.tutStep === 5 ) {
			ctx.fillText( 'Your training is complete! Continue on...', oc.x, oc.y - p1.h );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawBackground( ctx ) {
		/** @type {js13k.Renderer} */
		const R = js13k.Renderer;

		ctx.fillStyle = '#273325';
		R.fillBackground();

		// Grass
		ctx.fillStyle = '#4d571b';
		ctx.fillRect( 0, 0, this.limits.w, this.limits.h );

		ctx.fillStyle = '#a58d2c';
		ctx.beginPath();
		ctx.ellipse(
			this.limits.w / 2, this.limits.h / 2,
			this.limits.w / 2 - js13k.TILE_SIZE, this.limits.h / 2 - js13k.TILE_SIZE,
			0, 0, Math.PI * 4
		);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = R.createLinearGradient(
			0, 0,
			0, this.limits.h,
			'#0003', '#0000'
		);
		ctx.fillRect( 0, 0, this.limits.w, this.limits.h );
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawForeground( ctx ) {
		if( this.tutStep !== 5 ) {
			return;
		}

		/** @type {js13k.Renderer} */
		const R = js13k.Renderer;

		const progress = Math.sin( this.timer / 25 );
		let x = this.limits.w - js13k.TILE_SIZE + progress * 8;
		let y = this.limits.h / 2 + 9;
		const center = { x: x, y: y };

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
		const p1 = this.selectedCharacter.p1;
		const Input = js13k.Input;

		// Check for walking
		if( this.tutStep === 0 ) {
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

			if( oc.x >= this.limits.w - js13k.TILE_SIZE ) {
				js13k.Renderer.changeLevel( new js13k.Level.Ship() );
				return;
			}
		}

		super.update( dt );
	}


};
