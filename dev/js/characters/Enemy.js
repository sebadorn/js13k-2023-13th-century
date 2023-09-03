'use strict';


js13k.Enemy = class extends js13k.Character {


	/**
	 *
	 * @constructor
	 * @override
	 * @param {object?} data
	 */
	constructor( data ) {
		super( data );

		this.imgSX = 0;
		this.imgSY = 32;
		this.imgSW = 16;
		this.imgSH = 16;

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
