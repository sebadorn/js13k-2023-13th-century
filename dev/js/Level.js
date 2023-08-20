'use strict';


js13k.Level = class {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.isGameOver = false;
		this.timer = 0;

		this.objects = [];
		this.characters = [];

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
	 */
	drawBackground() {}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawGameOver( ctx ) {
		const center = js13k.Renderer.center;

		ctx.font = 'bold 36px ' + js13k.FONT;
		ctx.textAlign = 'center';
		ctx.fillStyle = '#DDD';
		ctx.fillText( 'GAME OVER', center, center );
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
			this.objects.sort( ( a, b ) => a.y - b.y );

			const dir = js13k.Input.getDirections();

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
