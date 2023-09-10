'use strict';


js13k.Weapon = class extends js13k.LevelObject {


	/**
	 * 
	 * @constructor
	 * @param {object} data 
	 */
	constructor( data ) {
		super( data );

		// this.owner = null;
	}


	/**
	 *
	 * @private
	 */
	_drawHighlight() {
		/** @type {js13k.Renderer} */
		const R = js13k.Renderer;
		const hb = this.getInteractHitbox();
		const translateX = R.translateX / R.scale;
		const translateY = R.translateY / R.scale;

		const progress = Math.sin( R.level.timer / 25 );
		let x = hb.x + hb.w / 2 + translateX - 15;
		let y = hb.y - js13k.TILE_SIZE_HALF * 1.5 + translateY;

		R.ctxUI.drawImage(
			R.imageArrow,
			x, y + progress * 8,
			30, 18
		);

		R.ctxUI.fillStyle = '#fff';

		let offset = progress * 2;
		x = hb.x - 6 + translateX - offset;
		y = hb.y + hb.h + translateY + offset;

		R.ctxUI.fillRect( x, y, 6, 12 );
		R.ctxUI.fillRect( x, y + 6, 12, 6 );

		x = hb.x + hb.w + translateX + offset;
		y = hb.y - 6 + translateY - offset;

		R.ctxUI.fillRect( x - 6, y, 12, 6 );
		R.ctxUI.fillRect( x, y, 6, 12 );
	}


	/**
	 * Set the position where to drop the item.
	 * @private
	 */
	_setDropPos() {
		if( !this.owner ) {
			return;
		}

		this.pos.set(
			this.owner.pos.x - js13k.TILE_SIZE_HALF,
			this.owner.pos.y + this.owner.h
		);
	}


	/**
	 * Drop the item.
	 */
	drop() {
		if( this.canInteract ) {
			this._setDropPos();
			this.owner?.level.addItems( this );
		}

		this.owner = null;
	}


	/**
	 *
	 * @return {function?}
	 */
	getHitEffect() {
		return null;
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
