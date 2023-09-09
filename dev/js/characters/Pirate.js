'use strict';


js13k.Pirate = class extends js13k.Enemy {


	/**
	 *
	 * @constructor
	 * @override
	 * @param {object?} data
	 */
	constructor( data ) {
		super( data );

		this.images = js13k.Renderer.imagesPirate;
	}


};
