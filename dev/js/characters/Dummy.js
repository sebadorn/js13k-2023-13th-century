'use strict';


js13k.Dummy = class extends js13k.Enemy {


	/**
	 *
	 * @constructor
	 * @override
	 * @param {object?} data
	 */
	constructor( data ) {
		super( data );

		this.imgSX = 0;
		this.imgSY = 48;
		this.imgSW = 16;
		this.imgSH = 16;

		this.health = 1000;
		this.healthTotal = 1000;
	}


	/**
	 * Drop the currently hold item (if it can be dropped).
	 * @override
	 */
	dropItem() {
		this.item?.drop();
		this.item = null;
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
