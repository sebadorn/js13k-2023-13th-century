'use strict';


js13k.Enemy = class extends js13k.Character {


	/**
	 *
	 * @constructor
	 * @override
	 * @param {object?} data
	 */
	constructor( data = {} ) {
		data.item = data.item || new js13k.WeaponFist();
		super( data );

		this.images = js13k.Renderer.imagesEnemy;
		this._walkAnimSpeed = 32 / js13k.TARGET_FPS;

		this.speed.set( 3, 3 );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	static drawFace( ctx ) {
		ctx.fillStyle = '#000';

		let y = 7;

		// Looking right
		let x = 6;
		ctx.fillRect( x, y, 6, 1 );
		ctx.fillRect( x + 2, y, 3, 2 );

		// Looking left
		x = 20;
		ctx.fillRect( x, y, 6, 1 );
		ctx.fillRect( x + 1, y, 3, 2 );
	}


	/**
	 *
	 * @override
	 * @param {js13k.Weapon} fromItem 
	 */
	takeDamage( fromItem ) {
		if( this.health <= 0 ) {
			return;
		}

		super.takeDamage( fromItem );
	}


};
