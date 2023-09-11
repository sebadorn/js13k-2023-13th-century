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

		this.images = js13k.Renderer.imagesKnight;
		this._walkAnimSpeed = 32 / js13k.TARGET_FPS;

		this.speed.set( 3, 3 );
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
