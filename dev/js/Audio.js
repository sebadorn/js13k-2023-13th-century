'use strict';


/**
 * @namespace js13k.Audio
 */
js13k.Audio = {


	ATTACK: [.2,0,8,.01,.01,.01,1,2.29,86,,,,,,-82,,,.42,.01],
	DAMAGE_TAKEN: [.2,0,68,.02,.01,.18,2,1.89,-0.3,,,,,1.4,,.3,,.59,.06,.12],
	DODGE: [.1,0,382,.1,.01,.09,,2.2,-1.2,-3.8,,,,5,,,,.48,.05],
	// KILLED: [.2,0,396,.01,.07,.13,3,1.93,-0.4,,,,,.8,,.2,.08,.93,.07],
	SELECT: [.2,0,883,.01,.07,,1,1.74,,,366,.1,.06,,,,,.62,.01],


	/**
	 *
	 * @param {number[]} sound
	 */
	play( sound ) {
		zzfx( ...sound );
	}


};
