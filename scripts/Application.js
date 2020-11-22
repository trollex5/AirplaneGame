import Controller from "./controller/Controller.js";
import gameSettings from "./gameSettings.js";

export default class Application {
    app;
    controller;

    constructor() {
        console.log("Application class");

        this.start();
    }


    start = () => {
        this.app = new PIXI.Application({
            width: gameSettings.gameW,
            height: gameSettings.gameH,
            backgroundColor: gameSettings.bgColor
        });

        document.querySelector("#gameParent").appendChild(this.app.view);

        this.controller = new Controller(this.app);
    };
}