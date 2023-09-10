'use strict';


js13k.Player = class extends js13k.Character {


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
	}


	/**
	 *
	 * @override
	 * @return {boolean}
	 */
	attack() {
		if( this.coolDownAttack && !this.coolDownAttack.elapsed() ) {
			return false;
		}

		if( !super.attack() ) {
			return false;
		}

		this.coolDownAttack = this.coolDownAttack || new js13k.Timer( this.level );
		this.coolDownAttack.set( 0.65 );

		return true;
	}


	/**
	 *
	 * @override
	 * @return {boolean}
	 */
	dodge() {
		if( this.coolDownDodge && !this.coolDownDodge.elapsed() ) {
			return false;
		}

		if( !super.dodge() ) {
			return false;
		}

		this.coolDownDodge = this.coolDownDodge || new js13k.Timer( this.level );
		this.coolDownDodge.set( 0.8 );

		return true;
	}


};
