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
	// imageShadow: null,
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

	/**
	 * Center position for the canvas content
	 * @type {js13k.Vector2D}
	 */
	center: new js13k.Vector2D(),

	// Scaling factor. Updated in resize().
	scale: 1,
	translateX: 0,
	translateY: 0,


	/**
	 *
	 * @private
	 * @param  {number[]}         color
	 * @param  {number}           sy
	 * @param  {js13k.Character?} char
	 * @return {HTMLCanvasElement}
	 */
	_getCharacter( color, sy, char, sx = 0 ) {
		const [cnv, ctx] = this.getOffscreenCanvas( 32, 32 );

		ctx.drawImage(
			this.images,
			sx, sy, 32, 16,
			0, 0, 32, 16
		);

		char && char.drawFace( ctx );

		let imgData = ctx.getImageData( 0, 0, 32, 16 );

		for( let i = 0; i < imgData.data.length; i += 4 ) {
			let r = imgData.data[i];
			let g = imgData.data[i + 1];
			let b = imgData.data[i + 2];

			// Set character color
			if( r + g + b === 255 * 3 ) {
				imgData.data[i + 0] = color[0];
				imgData.data[i + 1] = color[1];
				imgData.data[i + 2] = color[2];
			}
		}

		ctx.putImageData( imgData, 0, 0 );
		ctx.putImageData( imgData, 0, 16 ); // Copy top row for bottom

		// Get bottom row to convert to white
		imgData = ctx.getImageData( 0, 16, 32, 16 );

		for( let i = 0; i < imgData.data.length; i += 4 ) {
			const alpha = imgData.data[i + 3];

			// Set to white if not transparent
			if( alpha !== 0 ) {
				imgData.data[i + 0] = 255; // R
				imgData.data[i + 1] = 255; // G
				imgData.data[i + 2] = 255; // B
			}
		}

		ctx.putImageData( imgData, 0, 16 );

		return cnv;
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
				0,
				Math.max( -limits.w + this.center.x * 2, this.translateX )
			);
		}

		this.translateX *= this.scale;
	},


	/**
	 *
	 * @param {js13k.Level} level
	 */
	changeLevel( level ) {
		// TODO: transition animation
		this.level = level;
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
	 *
	 * @param  {number} x0 
	 * @param  {number} y0 
	 * @param  {number} x1 
	 * @param  {number} y1 
	 * @param  {string} colorStart 
	 * @param  {string} colorEnd 
	 * @return {CanvasGradient}
	 */
	createLinearGradient( x0, y0, x1, y1, colorStart = '#0003', colorEnd = '#fff1' ) {
		const gradient = this.ctx.createLinearGradient( x0, y0, x1, y1 );
		gradient.addColorStop( 0, colorStart );
		gradient.addColorStop( 1, colorEnd );

		return gradient;
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
		this.ctxUI.font = '56px ' + js13k.FONT_SANS;
		this.ctxUI.textAlign = 'center';
		this.ctxUI.textBaseline = 'top';
		this.ctxUI.fillText( 'GAME OVER', this.center.x, this.center.y - 56 );
	},


	/**
	 *
	 * @param {js13k.Character} char
	 * @param {string[]}        text
	 * @param {number}          position - 0: center, 1: bottom, 2: top
	 */
	drawMonologueBox( char, text, position ) {
		let w = js13k.TILE_SIZE * 9;
		let h = js13k.TILE_SIZE * 2;
		let x = this.center.x - w / 2;
		let y = this.center.y - h / 2;

		if( position === 1 ) {
			y = this.center.y * 2 - h - js13k.TILE_SIZE;
		}
		else if( position === 2 ) {
			y = js13k.TILE_SIZE_HALF;
		}

		this.ctxUI.fillStyle = '#0004';
		this.ctxUI.fillRect( x - 12, y - 12, w + 24, h + 24 );

		this.ctxUI.fillStyle = '#444';
		this.ctxUI.fillRect( x, y, w, h );

		this.ctxUI.drawImage(
			char.images,
			0, 0, 16, 16,
			x, y + js13k.TILE_SIZE * 0.25, js13k.TILE_SIZE * 1.75, js13k.TILE_SIZE * 1.75
		);

		this.ctxUI.lineWidth = 12;
		this.ctxUI.strokeStyle = '#847e87';
		this.ctxUI.strokeRect( x + 6, y + 6, js13k.TILE_SIZE * 2 - 12, js13k.TILE_SIZE * 2 - 12 );

		this.ctxUI.fillStyle = '#fff';
		this.ctxUI.font = '600 31px ' + js13k.FONT_MONO;
		this.ctxUI.textAlign = 'left';
		this.ctxUI.textBaseline = 'alphabetic';

		let xText = x + 28;
		let yText = y + 48;

		text.forEach( line => {
			this.ctxUI.fillText( line, xText + js13k.TILE_SIZE * 2, yText );
			yText +=  38;
		} );
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
		this.ctxUI.font = '56px ' + js13k.FONT_SANS;
		this.ctxUI.textAlign = 'center';
		this.ctxUI.textBaseline = 'top';
		this.ctxUI.fillText( 'PAUSED', this.center.x, this.center.y - 56 );
	},


	/**
	 *
	 */
	fillBackground() {
		this.ctx.fillRect(
			-this.translateX / this.scale - js13k.TILE_SIZE,
			-this.translateY / this.scale - js13k.TILE_SIZE,
			this.cnv.width / this.scale + js13k.TILE_SIZE * 2,
			this.cnv.height / this.scale + js13k.TILE_SIZE * 2
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


			// Pickup arrow

			const [cnvArrow, ctxArrow] = this.getOffscreenCanvas( 5, 3 );

			let imgData = new ImageData( 5, 3 );
			imgData.data.set( [
				// Top row
				255, 255, 255, 196,
				255, 255, 255, 255,
				255, 255, 255, 255,
				255, 255, 255, 255,
				255, 255, 255, 196,
				// Second row
				0, 0, 0, 0,
				255, 255, 255, 196,
				255, 255, 255, 255,
				255, 255, 255, 196,
				0, 0, 0, 0,
				// Bottom row
				0, 0, 0, 0,
				0, 0, 0, 0,
				255, 255, 255, 196,
				0, 0, 0, 0,
				0, 0, 0, 0,
			] );
			ctxArrow.putImageData( imgData, 0, 0 );

			this.imageArrow = cnvArrow;


			// Characters
			this.imagesPlayer = this._getCharacter( [255, 255, 0], 16, js13k.Player );
			this.imagesKnight = this._getCharacter( [255, 0, 0], 16, js13k.Knight );
			this.imagesDummy = this._getCharacter( [0, 0, 0], 48 );
			this.imagesPirate = this._getCharacter( [255, 255, 255], 32 );
			this.imagesCrate = this._getCharacter( [0, 0, 0], 48, null, 32 );


			// Repeating water pattern

			const [cnvWater, ctxWater] = this.getOffscreenCanvas( js13k.TILE_SIZE, js13k.TILE_SIZE );

			ctxWater.drawImage(
				this.images,
				16, 0, 16, 16,
				0, 0, js13k.TILE_SIZE, js13k.TILE_SIZE
			);

			this.patternWater = ctxWater.createPattern( cnvWater, 'repeat' );


			// Radial shadow

			const [cnvShadow, ctxShadow] = js13k.Renderer.getOffscreenCanvas( js13k.TILE_SIZE, js13k.TILE_SIZE );

			const gradient = ctxShadow.createRadialGradient(
				// Circle inner: x0, y0, r0
				js13k.TILE_SIZE_HALF, js13k.TILE_SIZE_HALF, 0,
				// Circle outer: x1, y1, r1
				js13k.TILE_SIZE_HALF, js13k.TILE_SIZE_HALF, js13k.TILE_SIZE_HALF
			);
			gradient.addColorStop( 0, '#000a' );
			gradient.addColorStop( 0.9, '#0002' );
			gradient.addColorStop( 1, '#0000' );

			ctxShadow.fillStyle = gradient;
			ctxShadow.fillRect( 0, 0, js13k.TILE_SIZE, js13k.TILE_SIZE );

			this.imageShadow = cnvShadow;


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
				this.ctxUI.font = '600 16px ' + js13k.FONT_MONO;
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
