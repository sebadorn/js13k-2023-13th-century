'use strict';


/**
 * @namespace js13k.Renderer
 */
js13k.Renderer = {


	// No need to set these attributes right now.
	// Leaving them as comment to know they (will) exist.
	// --------------------------------------------------
	//
	// center: 0,
	// last: 0,
	// level: null,
	//
	// // Canvas for background, player
	// cnv: null,
	// ctx: null,
	//
	// cnvUI: null,
	// ctxUI: null,

	// Scaling factor. Updated in resize().
	scale: 1,


	/**
	 * Clear the canvas.
	 */
	clear() {
		this.ctx.clearRect( 0, 0, window.innerWidth, window.innerHeight );
		this.ctxUI.clearRect( 0, 0, window.innerWidth, window.innerHeight );
	},


	/**
	 * Draw to the canvas.
	 */
	draw() {
		this.clear();
		this.level && this.level.draw();
	},


	/**
	 * Draw the pause screen.
	 */
	drawPause() {
		this.ctxUI.setTransform( this.scale, 0, 0, this.scale, 0, 0 );
		this.ctxUI.clearRect( 0, 0, window.innerWidth, window.innerHeight );

		this.ctxUI.fillStyle = 'rgba(0,0,0,0.4)';
		this.ctxUI.fillRect( 0, 0, window.innerWidth, window.innerHeight );

		this.ctxUI.fillStyle = '#FFF';
		this.ctxUI.font = 'normal 56px ' + js13k.FONT;
		this.ctxUI.textAlign = 'center';
		this.ctxUI.textBaseline = 'top';
		this.ctxUI.fillText( 'PAUSED', this.center, 60 );
	},


	/**
	 * Get an offset canvas and its context.
	 * @param  {number} w
	 * @param  {number} h
	 * @return {array} [HTMLCanvasElement, CanvasRenderingContext2D]
	 */
	getOffscreenCanvas( w, h ) {
		const canvas = document.createElement( 'canvas' );
		canvas.width = w;
		canvas.height = h;

		const ctx = canvas.getContext( '2d', { alpha: true } );
		ctx.imageSmoothingEnabled = false;

		return [canvas, ctx];
	},


	/**
	 * Initialize the renderer.
	 * @param {function} cb
	 */
	init( cb ) {
		this.cnv = document.getElementById( 'c' );
		this.ctx = this.cnv.getContext( '2d', { alpha: true } );
		this.ctx.imageSmoothingEnabled = false;

		this.cnvUI = document.getElementById( 'ui' );
		this.ctxUI = this.cnvUI.getContext( '2d', { alpha: true } );
		this.ctxUI.imageSmoothingEnabled = false;

		this.registerEvents();
		cb();
	},


	/**
	 * Start the main loop. Update logic, render to the canvas.
	 * @param {number} [timestamp = 0]
	 */
	mainLoop( timestamp = 0 ) {
		js13k.Input.update();

		if( timestamp && this.last ) {
			const timeElapsed = timestamp - this.last; // Time that passed between frames. [ms]

			// Target speed of 60 FPS (=> 1000 / 60 ~= 16.667 [ms]).
			const dt = timeElapsed / ( 1000 / js13k.TARGET_FPS );

			this.ctx.imageSmoothingEnabled = false;
			this.ctxUI.imageSmoothingEnabled = false;

			this.ctx.setTransform( this.scale, 0, 0, this.scale, 0, 0 );
			this.ctxUI.setTransform( this.scale, 0, 0, this.scale, 0, 0 );

			if( this.isPaused ) {
				this.drawPause();
				return; // Stop the loop.
			}

			this.level.update( dt );
			this.draw();

			// Draw FPS info
			if( js13k.DEBUG ) {
				this.ctxUI.fillStyle = '#000';
				this.ctxUI.fillRect( 40, window.innerHeight - 45, 140, 28 );

				this.ctxUI.fillStyle = '#FFF';
				this.ctxUI.font = 'bold 16px ' + js13k.FONT;
				this.ctxUI.textAlign = 'right';
				this.ctxUI.textBaseline = 'bottom';
				this.ctxUI.fillText( ~~( js13k.TARGET_FPS / dt ) + ' FPS / ' + this.scale, 160, window.innerHeight - 22 );
			}
		}

		this.last = timestamp;

		requestAnimationFrame( t => this.mainLoop( t ) );
	},


	/**
	 *
	 */
	pause() {
		this.isPaused = true;
		js13k.Audio.mute();
	},


	/**
	 *
	 */
	registerEvents() {
		window.addEventListener( 'resize', _ev => this.resize() );
		this.resize();

		const keys = js13k.Input.getKeysForAction( js13k.Input.ACTION.PAUSE );

		setInterval(
			() => {
				// Inputs are not updated if main loop is not running.
				if( this.isPaused ) {
					js13k.Input.update();
				}

				keys.gamepad.forEach( key => {
					if( js13k.Input.isPressedGamepad( key, true ) ) {
						this.togglePause();
					}
				} );
			},
			100
		);

		const cbPause = () => this.togglePause();
		keys.keyboard.forEach( key => js13k.Input.onKeyUp( key, cbPause ) );

		js13k.Input.on( 'gp_disconnect', () => this.pause() );
		js13k.Input.on( 'click', mouse => {
			if( !this.isPaused ) {
				this.level && this.level.clickAt( mouse );
			}
		} );
	},


	/**
	 *
	 */
	reloadLevel() {
		this.level = new this.level.constructor();
	},


	/**
	 * Resize the canvas.
	 */
	resize() {
		this.cnv.width = window.innerWidth;
		this.cnv.height = window.innerHeight;

		this.cnvUI.width = window.innerWidth;
		this.cnvUI.height = window.innerHeight;

		if( this.isPaused ) {
			clearTimeout( this._timeoutDrawPause );
			this._timeoutDrawPause = setTimeout( () => this.drawPause(), 100 );
		}
	},


	/**
	 *
	 */
	togglePause() {
		if( this.isPaused ) {
			this.unpause();
		}
		else {
			this.pause();
		}
	},


	/**
	 *
	 */
	unpause() {
		if( this.isPaused ) {
			this.isPaused = false;
			js13k.Audio.unmute();
			this.mainLoop();
		}
	},


};
