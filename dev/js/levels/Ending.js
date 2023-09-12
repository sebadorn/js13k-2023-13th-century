'use strict';


js13k.Level.Ending = class extends js13k.Level {


	/**
	 *
	 * @override
	 * @constructor
	 */
	constructor() {
		super();

		const cx = js13k.Renderer.center.x;
		const cy = js13k.Renderer.center.y;

		this.player = new js13k.Player( {
			x: cx - js13k.TILE_SIZE_HALF,
			y: cy - js13k.TILE_SIZE_HALF,
			facingX: -1,
			item: new js13k.WeaponSword()
		} );
		this.player.noFixPos = true;

		this.addCharacters( this.player );

		const gw = js13k.TILE_SIZE - 6;
		const gh = js13k.TILE_SIZE - 30;

		this.gold = [];

		let numRowItems = 1;
		const stepX = gw / 2;
		const yStart = this.player.pos.y + gh;

		for( let row = -1; row < 8; row++ ) {
			const xStart = this.player.pos.x - Math.floor( numRowItems / 2 ) * stepX;

			for( let i = 0; i < numRowItems; i++ ) {
				this.gold.push( new js13k.Gold( {
					x: xStart + i * stepX,
					y: yStart + row * gh
				} ) );
			}

			numRowItems += 2;
		}

		this.showText = 0;
		this.textTimer = new js13k.Timer( this, 5 );
	}


	/**
	 *
	 * @override
	 */
	draw() {
		const ctx = js13k.Renderer.ctxUI;
		this.gold.forEach( gold => gold.draw( ctx ) );

		const cx = js13k.Renderer.center.x;
		let y = js13k.TILE_SIZE * 2.5;

		ctx.fillStyle = '#ff0';
		ctx.font = '600 72px ' + js13k.FONT_MONO;
		ctx.textAlign = 'center';
		ctx.fillText( 'YOU CLAIMED THE TREASURE!', cx, y );

		ctx.fillStyle = '#fffa';
		ctx.font = '600 18px ' + js13k.FONT_MONO;

		if( this.showText > 0 ) {
			y += 32;
			ctx.fillText( 'That makes you the richest person far and wide.', cx, y );
		}
		if( this.showText > 1 ) {
			y += 25;
			ctx.fillText( 'Make sure to properly pay your crew.', cx, y );
		}
		if( this.showText > 2 ) {
			y += 25;
			ctx.fillText( 'Where will you even store all that?', cx, y );
		}

		this.player.draw( ctx );
	}


	/**
	 *
	 * @override
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		if( this.textTimer.elapsed() ) {
			this.showText++;
			this.textTimer.set( 5 );
		}
	}


};
