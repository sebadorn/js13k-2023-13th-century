'use strict';


js13k.Weapon = class extends js13k.LevelObject {


	/**
	 * 
	 * @constructor
	 * @param {object} data 
	 */
	constructor( data ) {
		super( data );

		this.owner = null;
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawHighlight( ctx ) {
		const hb = this.getInteractHitbox();
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 2;
		ctx.strokeRect( hb.x, hb.y, hb.w, hb.h );
	}


	/**
	 * Set the position where to drop the item.
	 * @private
	 */
	_setDropPos() {
		if( this.owner ) {
			this.pos.set(
				this.owner.pos.x + this.owner.w / 2,
				this.owner.pos.y - this.owner.h
			);
		}
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
