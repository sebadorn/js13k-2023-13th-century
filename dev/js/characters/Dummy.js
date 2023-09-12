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

		this.images = js13k.Renderer.imagesDummy;
		this.health = this.healthTotal = 300;
	}


};
