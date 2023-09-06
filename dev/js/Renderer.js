'use strict';


/**
 * @namespace js13k.Renderer
 */
js13k.Renderer = {


	// No need to set these attributes right now.
	// Leaving them as comment to know they (will) exist.
	// --------------------------------------------------
	//
	// images: null,
	// imagesWhite: null,
	// patternWater: null,
	//
	// last: 0,
	// level: null,
	//
	// cnv: null,
	// ctx: null,
	//
	// cnvUI: null,
	// ctxUI: null,

	// Center position for the canvas content
	center: new js13k.Vector2D(),

	// Scaling factor. Updated in resize().
	scale: 1,
	translateX: 0,
	translateY: 0,


	/**
	 *
	 * @private
	 * @param  {HTMLImageElement} img
	 * @return {HTMLCanvasElement}
	 */
	_renderToWhite( img ) {
		const [canvas, ctx] = this.getOffscreenCanvas( img.width, img.height );
		ctx.drawImage( img, 0, 0 );

		const imgData = ctx.getImageData( 0, 0, img.width, img.height );

		for( let y = 0; y < img.height; y++ ) {
			for( let x = 0; x < img.width; x++ ) {
				const index = ( y * img.width + x ) * 4;
				const alpha = imgData.data[index + 3];

				// Set to white if not transparent
				if( alpha !== 0 ) {
					imgData.data[index + 0] = 255; // R
					imgData.data[index + 1] = 255; // G
					imgData.data[index + 2] = 255; // B
				}
			}
		}

		ctx.putImageData( imgData, 0, 0 );

		return canvas;
	},


	/**
	 *
	 * @param {js13k.LevelObject} o
	 */
	centerOn( o ) {
		const oc = o.getOffsetCenter();
		this.translateX = this.center.x - oc.x;
		this.translateY = ( this.center.y - oc.y ) * this.scale;

		// Limit camera offset to horizontal level limits
		if( o.level ) {
			const limits = o.level.limits;

			this.translateX = Math.min(
				limits.x,
				Math.max( ( limits.x + limits.w - this.center.x ) / -2, this.translateX )
			);
		}

		this.translateX *= this.scale;
	},


	/**
	 * Clear the canvas.
	 */
	clear() {
		this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		this.ctx.clearRect( 0, 0, window.innerWidth, window.innerHeight );
		this.ctxUI.setTransform( 1, 0, 0, 1, 0, 0 );
		this.ctxUI.clearRect( 0, 0, window.innerWidth, window.innerHeight );
	},


	/**
	 * Draw to the canvas.
	 */
	draw() {
		this.clear();
		this.ctx.setTransform( this.scale, 0, 0, this.scale, this.translateX, this.translateY );
		this.ctxUI.setTransform( this.scale, 0, 0, this.scale, 0, 0 );
		this.level && this.level.draw();
	},


	/**
	 * Draw the game over screen.
	 */
	drawGameOver() {
		this.ctxUI.setTransform( 1, 0, 0, 1, 0, 0 );
		this.ctxUI.clearRect( 0, 0, window.innerWidth, window.innerHeight );

		this.ctxUI.setTransform( this.scale, 0, 0, this.scale, 0, 0 );
		this.ctxUI.fillStyle = 'rgba(0,0,0,0.4)';
		this.ctxUI.fillRect( 0, 0, this.cnvUI.width / this.scale, this.cnvUI.height / this.scale );

		this.ctxUI.fillStyle = '#FFF';
		this.ctxUI.font = '56px ' + js13k.FONT;
		this.ctxUI.textAlign = 'center';
		this.ctxUI.textBaseline = 'top';
		this.ctxUI.fillText( 'GAME OVER', this.center.x, this.center.y - 56 );
	},


	/**
	 * Draw the pause screen.
	 */
	drawPause() {
		this.ctxUI.setTransform( 1, 0, 0, 1, 0, 0 );
		this.ctxUI.clearRect( 0, 0, window.innerWidth, window.innerHeight );

		this.ctxUI.setTransform( this.scale, 0, 0, this.scale, 0, 0 );
		this.ctxUI.fillStyle = 'rgba(0,0,0,0.4)';
		this.ctxUI.fillRect( 0, 0, this.cnvUI.width / this.scale, this.cnvUI.height / this.scale );

		this.ctxUI.fillStyle = '#FFF';
		this.ctxUI.font = '56px ' + js13k.FONT;
		this.ctxUI.textAlign = 'center';
		this.ctxUI.textBaseline = 'top';
		this.ctxUI.fillText( 'PAUSED', this.center.x, this.center.y - 56 );
	},


	/**
	 *
	 */
	fillBackground() {
		this.ctx.fillRect(
			-this.translateX / this.scale, -this.translateY / this.scale,
			this.cnv.width / this.scale, this.cnv.height / this.scale
		);
	},


	/**
	 * Get an offset canvas and its context.
	 * @param  {number} w
	 * @param  {number} h
	 * @return {[HTMLCanvasElement, CanvasRenderingContext2D]}
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

		this.loadAssets( () => {
			this.registerEvents();
			cb();
		} );
	},


	/**
	 *
	 * @param {function} cb
	 */
	loadAssets( cb ) {
		const img = new Image();

		img.onload = () => {
			this.images = img;
			this.imagesWhite = this._renderToWhite( img );

			const [canvas, ctx] = this.getOffscreenCanvas( js13k.TILE_SIZE, js13k.TILE_SIZE );
			ctx.drawImage(
				this.images,
				16, 0, 16, 16,
				0, 0, js13k.TILE_SIZE, js13k.TILE_SIZE
			);
			this.patternWater = ctx.createPattern( canvas, 'repeat' );

			cb();
		};

		img.src = 'i.png';
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

			this.ctx.lineWidth = 1;
			this.ctx.textBaseline = 'alphabetic';

			if( this.isPaused ) {
				this.drawPause();
				return; // Stop the loop.
			}

			this.level.update( dt );
			this.draw();

			// Draw FPS info
			if( js13k.DEBUG ) {
				this.ctxUI.fillStyle = '#000';
				this.ctxUI.fillRect( 60, this.cnv.height / this.scale - 74, 140, 28 );

				this.ctxUI.fillStyle = '#FFF';
				this.ctxUI.font = '16px monospace';
				this.ctxUI.textAlign = 'right';
				this.ctxUI.textBaseline = 'bottom';
				this.ctxUI.fillText(
					~~( js13k.TARGET_FPS / dt ) + ' FPS, ' + Math.round( this.scale * 1000 ) / 1000,
					192, this.cnv.height / this.scale - 50
				);
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
	},


	/**
	 *
	 */
	reloadLevel() {
		this.level = new this.level.constructor();
	},


	/**
	 *
	 */
	resetTransform() {
		this.ctx.setTransform( this.scale, 0, 0, this.scale, this.translateX, this.translateY );
	},


	/**
	 * Resize the canvas.
	 */
	resize() {
		const targetRatio = 1920 / 1080;

		let height = window.innerHeight;
		let width = Math.round( height * targetRatio );

		if( width > window.innerWidth ) {
			width = window.innerWidth;
			height = width / targetRatio;
		}

		this.scale = height / 1080;

		this.center.x = width / 2 / this.scale;
		this.center.y = height / 2 / this.scale;

		let posTop = ~~( ( window.innerHeight - height ) / 2 ) + 'px';
		let posLeft = ~~( ( window.innerWidth - width ) / 2 ) + 'px';

		this.cnv.width = width;
		this.cnv.height = height;
		this.cnv.style.top = posTop;
		this.cnv.style.left = posLeft;

		this.cnvUI.width = width;
		this.cnvUI.height = height;
		this.cnvUI.style.top = posTop;
		this.cnvUI.style.left = posLeft;

		if( this.isPaused ) {
			clearTimeout( this._timeoutDrawPause );
			this._timeoutDrawPause = setTimeout( () => this.drawPause(), 100 );
		}
	},


	/**
	 * Rotate around a given coordinate.
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number}                   rad - Rotation in radians.
	 * @param {object}                   c
	 * @param {number}                   c.x - X coordinate to rotate around
	 * @param {number}                   c.y - Y coordinate to rotate around
	 */
	rotateCenter( ctx, rad, c ) {
		ctx.translate( c.x, c.y );
		ctx.rotate( rad );
		ctx.translate( -c.x, -c.y );
	},


	/**
	 * Scale around a given coordinate.
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number}                   sx
	 * @param {number}                   sy
	 * @param {object}                   c
	 * @param {number}                   c.x - X coordinate to scale around
	 * @param {number}                   c.y - Y coordinate to scale around
	 */
	scaleCenter( ctx, sx, sy, c ) {
		ctx.translate( c.x, c.y );
		ctx.scale( sx, sy );
		ctx.translate( -c.x, -c.y );
	},


	/**
	 *
	 */
	togglePause() {
		this.isPaused ? this.unpause() : this.pause();
	},


	/**
	 *
	 */
	unpause() {
		if( this.isPaused ) {
			this.isPaused = false;
			this.mainLoop();
		}
	},


};
