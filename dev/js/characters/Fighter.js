'use strict';


js13k.Fighter = class extends js13k.Character {


	/**
	 *
	 * @override
	 * @constructor
	 * @param {object?} data
	 */
	constructor( data = {} ) {
		data.item = data.item || new js13k.WeaponFist();
		super( data );
		this.health = this.healthTotal = Infinity;

		this.coolDown = {};
	}


	/**
	 *
	 * @override
	 * @return {boolean}
	 */
	attack() {
		if( this.coolDown.attack && !this.coolDown.attack.elapsed() ) {
			return false;
		}

		if( !super.attack() ) {
			return false;
		}

		this.coolDown.attack = this.coolDown.attack || new js13k.Timer( this.level );
		this.coolDown.attack.set( 0.65 );

		return true;
	}


	/**
	 *
	 * @override
	 * @return {boolean}
	 */
	dodge() {
		if( this.coolDown.dodge && !this.coolDown.dodge.elapsed() ) {
			return false;
		}

		if( !super.dodge() ) {
			return false;
		}

		this.coolDown.dodge = this.coolDown.dodge || new js13k.Timer( this.level );
		this.coolDown.dodge.set( 0.8 );

		return true;
	}


};
