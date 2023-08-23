'use strict';


js13k.Ship = class extends js13k.LevelObject {


	/**
	 *
	 * @constructor
	 * @param {object} data
	 */
	constructor( data ) {
		super( data );
		this.crew = [];
	}


	/**
	 *
	 * @override
	 * @return {number}
	 */
	prio() {
		return this.pos.y;
	}


};


js13k.PlayerShip = class extends js13k.Ship {


	/**
	 * 
	 * @constructor
	 * @param {object} data 
	 */
	constructor( data ) {
		super( data );
		this.health = 100;

		this.numTilesX = 8;
		this.numTilesY = 4;
		this.tileSize = 96;
		this.w = this.numTilesX * this.tileSize;
		this.h = this.numTilesY * this.tileSize;
	}


	/**
	 * Add one or more characters to the ship's crew.
	 * @param {js13k.Character[]} characters 
	 */
	add( ...characters ) {
		characters.forEach( c => {
			c.ship = this;

			if( c instanceof js13k.Captain ) {
				c.pos.set(
					this.pos.x + this.w - this.tileSize,
					this.pos.y + this.h / 2 - c.h / 2
				);
			}
			else if( c instanceof js13k.Fighter ) {
				// TODO: position
			}
			else if( c instanceof js13k.Builder ) {
				// TODO: position
			}
		} );

		this.crew.push( ...characters );
	}


	/**
	 *
	 * @override
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.fillStyle = '#8f563b';
		ctx.fillRect(
			this.pos.x - 3, this.pos.y - 3,
			this.w + 6, this.h + 3
		);

		for( let x = 0; x < this.numTilesX; x++ ) {
			for( let y = 0; y < this.numTilesY; y++ ) {
				const sx = this.pos.x + x * this.tileSize;
				const sy = this.pos.y + y * this.tileSize;

				ctx.drawImage(
					js13k.Renderer.images,
					0, 0, 32, 32, sx, sy,
					this.tileSize, this.tileSize
				);
			}
		}
	}


};


js13k.EnemyShip = class extends js13k.Ship {


	/**
	 * 
	 * @constructor
	 * @param {object} data 
	 */
	constructor( data ) {
		super( data );
	}


};
