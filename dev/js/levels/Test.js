'use strict';


js13k.Level.Test = class extends js13k.Level {


	/**
     *
     * @constructor
     */
	constructor() {
		super();

		this.addCharacters(
			new js13k.Captain( { x: window.innerWidth / 2, y: window.innerHeight / 2 } ),
			new js13k.Captain( { x: window.innerWidth / 2 + 200, y: window.innerHeight / 2 } ),
		);

		this.selectedCharacter.p1 = this.characters[0];
	}


};
