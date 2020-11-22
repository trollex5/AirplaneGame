import Model from "../model/Model.js";
import View from "../view/View.js";
import gameSettings from "../gameSettings.js";

export default class Controller {

    constructor(app) {
        window.addEventListener('RESOURCES_LOADED', (e) => { this.dispatchCommand(e); });
        window.addEventListener('GAME-INITIALIZED', (e) => { this.dispatchCommand(e); });
        window.addEventListener('PLAY-PRESSED', (e) => { this.dispatchCommand(e); });
        window.addEventListener('DESTROYED-TANK', (e) => { this.dispatchCommand(e); });
        window.addEventListener('DECREASES-FUEL', (e) => { this.dispatchCommand(e); });
        window.addEventListener('INCREASE-BOMBS', (e) => { this.dispatchCommand(e); });
        window.addEventListener('INCREASE-FUEL', (e) => { this.dispatchCommand(e); });
        window.addEventListener('AIRPLANE-CRASHED', (e) => { this.dispatchCommand(e); });

        document.addEventListener('keyup', this.keyboardUpControll);
        document.addEventListener('keydown', this.keyboardDownControll);
             
        this.app = app;
        this.queu = [];
        this.currentState = 'INITIALIZATION';
        this.nextState = 'INITIALIZATION';
        this.allowTransition = true;
        this.pauseGame = false;
        this.gameOver = false;

        this.gameScore = gameSettings.gameScore;
        this.gameFuel = gameSettings.gameFuel;
        this.gameBombs = gameSettings.gameBombs;

        this.model = new Model();
        this.view = new View(this.app);
    }

    startEngine = () => {
        this.app.ticker.add(this.gameLoop);
    }

    gameLoop = (delta) => {
        if(!this.pauseGame && !this.gameOver) {
            this.view.update();
        }
    }

    gameReset = () => {
        this.pauseGame = false;
        this.gameOver = false;
        this.gameScore = gameSettings.gameScore;
        this.gameFuel = gameSettings.gameFuel;
        this.gameBombs = gameSettings.gameBombs;
    }

    keyboardUpControll = (e) => {
        switch(e.keyCode) {
            case 32:  // space
                if(this.gameBombs -1 < 0) {
                    this.gameBombs = 0;
                } else {
                    if(!this.gamePause || !this.gameOver) {
                        this.view.airplaneFire();
                        this.view.setGameBomb(--this.gameBombs);
                    }
                }
            break;

            case 80:  // pause(P)
                if(!this.gameOver) {
                    this.pauseGame = !this.pauseGame;
                    this.view.gamePause(this.pauseGame);
                }
            break;
        }
    }

    keyboardDownControll = (e) => {
        switch(e.keyCode) {
            case 87:   // up(W)
                if(this.gameFuel)
                    this.view.moveAirplane('up');
            break;

            case 83:  // down(S)
                if(this.gameFuel)
                    this.view.moveAirplane('down');
            break;

            case 65:  // left(A)
                if(this.gameFuel)
                    this.view.moveBg('left');
            break;

            case 68:  // right(D)
                if(this.gameFuel)
                    this.view.moveBg('right');
            break;
        }
    }

    dispatchCommand = (e) => {
        setTimeout(() => {
        //  console.log('dispatchCommand:', e.type, e.detail);
           this.sMachine(e.type, e.detail);
        }, 10);
    }


    sMachine = (command, params) => {
        let trunk;
        //  console.log("controller commandS: ", command, params);
        if(command != "" || command != undefined) {
          trunk = { command, params };
          this.queu.push(trunk);
        }
        //console.log("controller commands: ", command, params, this.queu.length);
        if(this.allowTransition && this.queu.length > 0) {
            this.allowTransition = false;
            switch (this.currentState) {
                case 'INITIALIZATION':
               // console.log('STATE-GAME_INITIALIZATION', this.queu[0].command);
                    switch (this.queu[0].command) {
                        case 'RESOURCES_LOADED':
                            this.view.buildGame();
                            this.nextState = 'INIT-SCREEN';
                        break;
                    }
                    this.currentState = this.nextState;
                break;

                case 'INIT-SCREEN':
              //  console.log('STATE-INIT_SCREEN', this.queu[0].command);
                        switch (this.queu[0].command) {
                            case 'GAME-INITIALIZED':
                                this.view.showInitStage();
                                this.pauseGame = true;
                                this.startEngine();
                                this.nextState = 'INIT-SCREEN';
                            break;

                            case 'PLAY-PRESSED':
                                this.gameReset();
                                this.view.restoreGame();
                                this.view.addAirplaneBombs(this.gameBombs);
                                this.view.playGame();
                                this.view.setGameBomb(this.gameBombs);
                                this.view.setGameFuel(this.gameFuel);
                                this.view.setGameScore(this.gameScore);
                                this.nextState = 'PLAY_GAME';
                            break;
                        }
                        this.currentState = this.nextState;
                break;
        
                case 'PLAY_GAME':
              //  console.log('STATE-PLAY_GAME', this.queu[0].command);
                        switch (this.queu[0].command) {
                            case 'DESTROYED-TANK':
                                this.gameScore += 10;
                                this.view.setGameScore(this.gameScore);
                                this.nextState = 'PLAY_GAME';
                            break;

                            case 'DECREASES-FUEL':
                                --this.gameFuel;
                                if(this.gameFuel == 0) {
                                    this.gameFuel = 0;
                                    this.view.crashAirplane(this.gameBombs);
                                    this.nextState = 'END_GAME';
                                } else {
                                    this.view.setGameFuel(this.gameFuel);
                                    this.nextState = 'PLAY_GAME';
                                }
                            break;

                            case 'INCREASE-FUEL':
                                this.gameFuel += 2;
                                this.view.setGameFuel(this.gameFuel);
                                this.nextState = 'PLAY_GAME';
                            break;

                            case 'INCREASE-BOMBS':
                                this.gameBombs += 5;
                                this.view.setGameBomb(this.gameBombs);
                                this.view.addAirplaneBombs(5);
                                this.nextState = 'PLAY_GAME';
                            break;
        
                        }
                        this.currentState = this.nextState;
                break;

                case 'END_GAME':
             //   console.log('STATE-END-GAME', this.queu[0].command);
                        switch (this.queu[0].command) {
                            case 'AIRPLANE-CRASHED':
                                this.pauseGame = true;
                                this.gameOver = true;
                                this.view.gamePause(this.pauseGame);
                                this.view.endGame();
                                this.nextState = 'INIT-SCREEN';
                            break;
                        }
                        this.currentState = this.nextState;
                break;

                default: console.log('!!! STARTE-MACHINE controler - defoult case !!!');
            }
            this.queu.shift();
            this.allowTransition = true;
            if(this.queu.length > 0)
            this.sMachine("", []);
        }
    }
}