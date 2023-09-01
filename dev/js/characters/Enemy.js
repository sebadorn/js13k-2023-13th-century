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
