'use strict';


js13k.Level.Test = class extends js13k.Level {


	/**
     *
     * @constructor
     */
	constructor() {
		super();

		const cap1 = new js13k.Captain();
		this.addCharacters( cap1 );

		this.ship = new js13k.PlayerShip( { x: 0, y: 0 } );
		this.ship.add( cap1 );

		this.objects.push( this.ship );

		this.selectedCharacter.p1 = this.characters[0];
	}


};
