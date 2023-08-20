'use strict';


/**
 * @namespace js13k
 */
// eslint-disable-next-line no-redeclare
const js13k = {


	// Config
	DEBUG: true,
	FONT: '"Courier New", monospace',
	TARGET_FPS: 60,


	/**
	 *
	 */
	init() {
		js13k.Input.init();
		js13k.Audio.init();

		js13k.Renderer.init( () => {
			js13k.Renderer.level = new js13k.Level.Test();
			js13k.Renderer.mainLoop();
		} );
	},


};


window.addEventListener( 'load', () => js13k.init() );
