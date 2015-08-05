// Copyright AJ Weeks 2015
/* jshint browser: true */
/* jshint devel: true */
/* global Stats */
/* global Bugsnag */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
function get(what) {
    return document.getElementById(what);
}
var ID;
(function (ID) {
    ID[ID["BLANK"] = 0] = "BLANK";
    ID[ID["MIRROR"] = 1] = "MIRROR";
    ID[ID["POINTER"] = 2] = "POINTER";
    ID[ID["RECEPTOR"] = 3] = "RECEPTOR";
})(ID || (ID = {}));
var COLOUR;
(function (COLOUR) {
    COLOUR[COLOUR["RED"] = 0] = "RED";
    COLOUR[COLOUR["GREEN"] = 1] = "GREEN";
    COLOUR[COLOUR["BLUE"] = 2] = "BLUE";
    COLOUR[COLOUR["WHITE"] = 3] = "WHITE";
})(COLOUR || (COLOUR = {}));
var STATE;
(function (STATE) {
    STATE[STATE["MAIN_MENU"] = 0] = "MAIN_MENU";
    STATE[STATE["GAME"] = 1] = "GAME";
    STATE[STATE["ABOUT"] = 2] = "ABOUT";
    STATE[STATE["OPTION"] = 3] = "OPTION";
    STATE[STATE["LEVEL_SELECT"] = 4] = "LEVEL_SELECT";
})(STATE || (STATE = {}));
var IMAGE;
(function (IMAGE) {
    IMAGE[IMAGE["BLANK"] = 0] = "BLANK";
    IMAGE[IMAGE["MIRROR"] = 1] = "MIRROR";
    IMAGE[IMAGE["POINTER"] = 2] = "POINTER";
    IMAGE[IMAGE["RECEPTOR"] = 3] = "RECEPTOR";
    IMAGE[IMAGE["LASER"] = 4] = "LASER";
})(IMAGE || (IMAGE = {}));
var DIRECTION;
(function (DIRECTION) {
    DIRECTION[DIRECTION["NORTH"] = 0] = "NORTH";
    DIRECTION[DIRECTION["EAST"] = 1] = "EAST";
    DIRECTION[DIRECTION["SOUTH"] = 2] = "SOUTH";
    DIRECTION[DIRECTION["WEST"] = 3] = "WEST";
    DIRECTION[DIRECTION["NW"] = 0] = "NW";
    DIRECTION[DIRECTION["NE"] = 1] = "NE";
    DIRECTION[DIRECTION["SE"] = 2] = "SE";
    DIRECTION[DIRECTION["SW"] = 3] = "SW";
})(DIRECTION || (DIRECTION = {}));
var Game = (function () {
    function Game() {
    }
    Game.init = function () {
        document.title = "Mirrors V" + Game.version;
        get('versionNumber').innerHTML = '<a href="https://github.com/ajweeks/mirrors-ts" target="_blank" style="color: inherit; text-decoration: none;">' + "V." + Game.version + ' <span style="font-size: 14px">(beta)</span></a>';
        Game.images[IMAGE.BLANK] = new Image();
        Game.images[IMAGE.BLANK].src = "res/blank.png";
        Game.images[IMAGE.BLANK].alt = "blank";
        Game.images[IMAGE.MIRROR] = new Image();
        Game.images[IMAGE.MIRROR].src = "res/mirror.png";
        Game.images[IMAGE.MIRROR].alt = "mirror";
        Game.images[IMAGE.POINTER] = new Image();
        Game.images[IMAGE.POINTER].src = "res/pointer.png";
        Game.images[IMAGE.POINTER].alt = "pointer";
        Game.images[IMAGE.RECEPTOR] = [];
        Game.images[IMAGE.RECEPTOR][COLOUR.RED] = new Image();
        Game.images[IMAGE.RECEPTOR][COLOUR.RED].src = "res/receptor_red.png";
        Game.images[IMAGE.RECEPTOR][COLOUR.RED].alt = "receptor";
        Game.images[IMAGE.RECEPTOR][COLOUR.GREEN] = new Image();
        Game.images[IMAGE.RECEPTOR][COLOUR.GREEN].src = "res/receptor_green.png";
        Game.images[IMAGE.RECEPTOR][COLOUR.GREEN].alt = "receptor";
        Game.images[IMAGE.RECEPTOR][COLOUR.BLUE] = new Image();
        Game.images[IMAGE.RECEPTOR][COLOUR.BLUE].src = "res/receptor_blue.png";
        Game.images[IMAGE.RECEPTOR][COLOUR.BLUE].alt = "receptor";
        Game.images[IMAGE.RECEPTOR][COLOUR.WHITE] = new Image();
        Game.images[IMAGE.RECEPTOR][COLOUR.WHITE].src = "res/receptor_white.png";
        Game.images[IMAGE.RECEPTOR][COLOUR.WHITE].alt = "receptor";
        Game.images[IMAGE.LASER] = [];
        Game.images[IMAGE.LASER][COLOUR.RED] = new Image();
        Game.images[IMAGE.LASER][COLOUR.RED].src = "res/laser_red.png";
        Game.images[IMAGE.LASER][COLOUR.RED].alt = "red laser";
        Game.images[IMAGE.LASER][COLOUR.GREEN] = new Image();
        Game.images[IMAGE.LASER][COLOUR.GREEN].src = "res/laser_green.png";
        Game.images[IMAGE.LASER][COLOUR.GREEN].alt = "green laser";
        Game.images[IMAGE.LASER][COLOUR.BLUE] = new Image();
        Game.images[IMAGE.LASER][COLOUR.BLUE].src = "res/laser_blue.png";
        Game.images[IMAGE.LASER][COLOUR.BLUE].alt = "blue laser";
        Game.stats = Stats();
        Game.stats.setMode(0);
        Game.stats.domElement.style.position = 'absolute';
        Game.stats.domElement.style.left = '0px';
        Game.stats.domElement.style.top = '0px';
        document.body.appendChild(Game.stats.domElement);
        Game.sm = new StateManager();
        Game.completedLevels = new Array(Game.defaultLevels.length);
        Level.loadCompletedLevelsFromMemory();
        Game.setDefaultPrefs();
    };
    Game.renderImage = function (context, x, y, image, dir, size) {
        context.save();
        context.translate(x, y);
        context.rotate(dir * 90 * (Math.PI / 180));
        try {
            context.drawImage(image, -size / 2, -size / 2);
        }
        catch (e) {
            throw new Error(e.message);
        }
        context.restore();
    };
    Game.setDefaultPrefs = function () {
        setDebug(Game.releaseStage === Game.releaseStages.DEVELOPMENT);
        setLevelEditMode(Game.debug);
        Game.preferences.warn = !Game.debug;
    };
    Game.setPopup = function (str, styles) {
        if (styles === void 0) { styles = ''; }
        get('darken').className = "";
        get('popup').className = "";
        get('popup').style.cssText = styles;
        get('popup').innerHTML = '<a id="popupClose" onclick="if (clickType(event)===\'left\') { Sound.play(Sound.select); Game.clearPopup(); }">x</a>' + str;
        Game.popupUp = true;
    };
    Game.clearPopup = function () {
        get('darken').className = "hidden";
        get('popup').className = "hidden";
        get('popup').style.cssText = "";
        Game.popupUp = false;
    };
    Game.update = function () {
        Game.ticks += 1;
        if (Game.keysdown[Game.KEYBOARD.ESC]) {
            if (Game.popupUp === true) {
                Sound.play(Sound.select);
                Game.clearPopup();
            }
            else {
                this.sm.enterPreviousState();
            }
        }
        else if (Game.keysdown[Game.KEYBOARD.ZERO]) {
            toggleLevelEditMode();
        }
        else if (Game.keysdown[Game.KEYBOARD.NINE]) {
            toggleDebug();
        }
        Game.sm.update();
        for (var i = 0; i < Game.keysdown.length; i++) {
            Game.keysdown[i] = false;
        }
    };
    Game.render = function () {
        Game.sm.render();
    };
    Game.loop = function () {
        Game.stats.begin();
        Game.update();
        if (document.hasFocus() || Game.ticks % 5 === 0) {
            Game.render();
        }
        Game.stats.end();
        window.setTimeout(Game.loop, 1000 / Game.fps);
    };
    Game.version = 0.100;
    Game.releaseStages = { DEVELOPMENT: "development", PRODUCTION: "production" };
    Game.releaseStage = Game.releaseStages.PRODUCTION;
    Game.images = [];
    Game.preferences = { 'warn': Game.debug };
    Game.selectedTileID = ID.BLANK;
    Game.saveLocation = "Mirrors";
    Game.popupUp = false;
    Game.defaultLevels = [
        [9, 9, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [2, 1, 1, 1], 0, 0, 0, 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [3, 0, 'XXGX'], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [1, 1], 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        [9, 9, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [2, 1, 1, 2], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [3, 0, 'XXBX'], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        [9, 9, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [1, 1], 0, 0, 0, 0, 0, [3, 0, 'RXXX'], 0, 0, 0, 0, 0, 0, 0, 0, [2, 2, 1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, [3, 0, 'XXGX'], 0, 0, 0, 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        [9, 9, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, [2, 2, 1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [3, 3, 'RXGX'], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        [9, 9, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, [3, 1, 'WWWX'], 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [1, 1], [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, [2, 0, 1, 1], 0, [2, 0, 1, 2], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        [9, 9, [0, 0, 0, 0, 0, 0, 0, 0, 0, [1, 1], 0, 1, 0, 1, 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [1, 1], 0, [3, 3, 'RXBX'], 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, [2, 3, 1, 2], 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        [9, 9, [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, [3, 2, 'GXBX'], 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [2, 1, 1, 2], 0, 0, 0, 0, 0, 0, 0, [1, 1], [2, 1, 1, 1], 0, 0, 0, 0, 0, 0, [1, 1], [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0]],
        [9, 9, [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, [2, 1, 1, 2], 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, [3, 1, 'BXXR'], 0, 1, 1, 0, 0, [2, 3, 1, 0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [1, 1], 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        [9, 9, [[2, 2, 1, 1], 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, [1, 1], 0, 0, 1, 0, 1, 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, [2, 3, 1, 2], 0, 0, 0, 0, 0, 0, 0, 0, 0, [3, 2, 'BXWX'], 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0]],
        [9, 9, [0, 0, [2, 2, 1, 2], 0, 0, 0, 0, 0, 0, [1, 1], 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, [2, 0, 1, 0], 1, [1, 1], 1, [3, 2, 'BXRR'], 1, 0, 0, 0, [1, 1], 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, [1, 1], 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0]],
        [9, 9, [[2, 1, 1, 0], 0, 0, 1, 0, 0, 0, 0, 0, [1, 1], 0, 0, 0, 0, 0, 1, 0, 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, [2, 2, 1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [2, 0, 1, 1], 0, 0, 0, 0, 0, 0, 0, [1, 1], [1, 1], 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, [3, 1, 'GRGX'], 0, [1, 1], 1, 0, 0, 0, 0, 0, 1, 0, 0]],
        [9, 9, [0, [2, 1, 1, 2], 0, 1, [1, 1], 0, 0, 0, 0, 0, 0, 1, 0, [1, 1], 0, 0, 0, 1, 0, 0, [3, 2, 'XXRX'], 0, 0, 0, 0, 0, 1, [1, 1], 0, 0, 0, [3, 3, 'GXBX'], 0, 0, 0, [1, 1], 0, 0, [2, 1, 1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, [1, 1], 0, 0, 0, 0, 0, 0, 0, [1, 1], 1, 0, 0, [2, 3, 1, 0], 0, 0, 0, 0, 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, [1, 1]]],
        [9, 9, [0, [1, 1], 0, 0, 0, 0, 0, [2, 2, 1, 2], 0, [2, 1, 1, 0], 0, 0, 0, 0, 0, 1, 0, [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, [1, 1], [3, 1, 'RXBG'], 0, 1, 0, 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, [1, 1], 1, 0, 0, 0, 0, 0, 0, 0, [2, 3, 1, 2], 1, 0, 0, 0, 0, 0, 0, [3, 3, 'XXBX'], 0, 0, [2, 0, 1, 1], 0, 0, 1, 0, 0, 0, 0]],
        [9, 9, [0, [1, 1], 0, [1, 1], [2, 3, 1, 1], 1, 1, 1, [1, 1], [2, 2, 1, 2], 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, [1, 1], [1, 1], 0, 1, 2, 0, 0, 0, 0, 0, [3, 0, 'RXXX'], [1, 1], 0, 1, 0, 0, 1, 0, 0, 0, [3, 2, 'GXGX'], 0, [1, 1], 0, 0, 0, 0, 0, 0, 0, [3, 2, 'WXBX'], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [1, 1], 0, 0, 0, [1, 1], 0, 0, [2, 3, 1, 0], [2, 0, 1, 1], 0, [1, 1], 0, 0, 0, 0, [1, 1], 0]],
        [9, 9, [0, 0, [2, 1, 1, 1], [1, 1], 0, [1, 1], 1, 1, 0, 0, [2, 1, 1, 0], 0, [1, 1], 0, 1, 0, [3, 0, 'RGRG'], 1, 0, 0, 0, 0, 1, 0, [1, 1], 0, 0, 0, [1, 1], 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, [1, 1], 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, [2, 0, 1, 1], 0, 0, [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        [9, 9, [0, [1, 1], 0, 0, [1, 1], 1, [1, 1], [1, 1], 1, [1, 1], 0, [1, 1], [2, 1, 1, 2], 0, 0, [1, 1], [1, 1], 0, 0, 0, 0, 1, 1, 0, 1, 2, 0, [2, 0, 1, 1], 0, [3, 0, 'BRXG'], [1, 1], [3, 0, 'XGBR'], 0, [1, 1], 1, 0, [2, 1, 1, 2], 1, 0, 0, 0, 0, 0, [2, 0, 1, 1], 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [2, 1, 1, 0], 0, 0, 0, 0, 1, 0, 0, 0, [2, 1, 1, 0], 1, [1, 1], 0, 0, [1, 1], 1, [1, 1], 0, 0, 0, 1, 0, 0, 1]],
        [9, 9, [[2, 1, 1, 1], 0, 1, 0, 0, 0, [1, 1], 0, [2, 3, 1, 1], 0, [1, 1], [1, 1], 0, 0, 0, [1, 1], 1, 0, 0, 0, 0, [1, 1], [3, 1, 'WXWX'], [1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, [1, 1], [3, 0, 'WXWX'], [1, 1], 0, 0, [1, 1], 0, [2, 1, 1, 0], 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, [1, 1], 0, 1, [1, 1], 0, 0]],
        [9, 9, [0, 0, 0, 0, [2, 3, 1, 2], [2, 2, 1, 2], [2, 2, 1, 2], [2, 1, 1, 2], 0, [1, 1], 0, 0, 1, 0, 0, 0, 0, 0, [3, 3, 'XXBX'], 0, [1, 1], [3, 2, 'RXBX'], 1, 1, 0, 0, 0, 0, [1, 1], 1, [1, 1], [3, 0, 'RXBX'], [1, 1], 0, 0, 0, 0, 0, [1, 1], 0, [1, 1], [3, 0, 'RXBX'], [1, 1], [1, 1], 0, 0, 0, 0, 1, [1, 1], 1, [3, 3, 'RXBX'], 1, 0, 0, 0, 0, 0, [1, 1], 0, 1, [2, 3, 1, 2], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [2, 3, 1, 0], 2, 2, [2, 1, 1, 0], 0, 0, 0, 0]],
        [9, 9, [[1, 1], 0, 1, 0, 0, 0, [1, 1], 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, [1, 1], 0, 0, 0, 0, 0, 0, 0, [1, 1], 0, 0, 0, [3, 2, 'XXRX'], [3, 1, 'XXGX'], [3, 3, 'BXXX'], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, [1, 1], 0, 0, 0, 0, [1, 1], 0, 0, [1, 1], 0, 2, [2, 0, 1, 1], [2, 1, 1, 2], 0, 0, [1, 1], 1, 0, 1]]
    ];
    Game.keysdown = [];
    Game.offset = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    Game.ticks = 0;
    Game.fps = 60;
    Game.lvlselectButtonSpeed = 6;
    Game.lvlselectButtonDirection = 0;
    Game.KEYBOARD = {
        BACKSPACE: 8, TAB: 9, RETURN: 13, ESC: 27, SPACE: 32, PAGEUP: 33, PAGEDOWN: 34, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, INSERT: 45, DELETE: 46, ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, TILDE: 192, SHIFT: 999
    };
    return Game;
})();
var BasicState = (function () {
    function BasicState(id, sm) {
        this.id = id;
        this.sm = sm;
    }
    BasicState.prototype.update = function () {
    };
    BasicState.prototype.render = function () {
    };
    BasicState.prototype.click = function (event, down) {
    };
    BasicState.prototype.hide = function () {
    };
    BasicState.prototype.restore = function () {
    };
    BasicState.prototype.destroy = function () {
    };
    return BasicState;
})();
var MainMenuState = (function (_super) {
    __extends(MainMenuState, _super);
    function MainMenuState(sm) {
        _super.call(this, STATE.MAIN_MENU, sm);
    }
    MainMenuState.prototype.hide = function () {
        get('mainmenubtns').style.display = "none";
    };
    MainMenuState.prototype.restore = function () {
        get('mainmenubtns').style.display = "block";
    };
    MainMenuState.prototype.destroy = function () {
        assert(false, "Main Menu State is being destroyed!! D:");
    };
    return MainMenuState;
})(BasicState);
var AboutState = (function (_super) {
    __extends(AboutState, _super);
    function AboutState(sm) {
        _super.call(this, STATE.ABOUT, sm);
        get('aboutstate').style.display = "block";
    }
    AboutState.prototype.restore = function () {
        get('aboutstate').style.display = "block";
    };
    AboutState.prototype.destroy = function () {
        get('aboutstate').style.display = "none";
    };
    return AboutState;
})(BasicState);
var OptionState = (function (_super) {
    __extends(OptionState, _super);
    function OptionState(sm) {
        _super.call(this, STATE.OPTION, sm);
        get('optionstate').style.display = "initial";
    }
    OptionState.prototype.setResetAllLevelsPopup = function () {
        Game.setPopup('<h3>Clear level data</h3>' +
            '<p>Are you sure? This will erase all of your saved data!<br />This can not be undone!</p>' +
            '<div class="popupButton button" id="yesButton" onclick="if (clickType(event)===\'left\') { Sound.play(Sound.wizzle); Level.resetAll(); Game.clearPopup(); }">Reset</div>' +
            '<div class="popupButton button" id="cancelButton" onclick="if (clickType(event)===\'left\') { Sound.play(Sound.select); Game.clearPopup(); }">Cancel</div>', 'margin-left: -170px;');
    };
    OptionState.prototype.restore = function () {
        get('optionstate').style.display = "initial";
    };
    OptionState.prototype.destroy = function () {
        get('optionstate').style.display = "none";
    };
    return OptionState;
})(BasicState);
var LevelSelectState = (function (_super) {
    __extends(LevelSelectState, _super);
    function LevelSelectState(sm) {
        _super.call(this, STATE.LEVEL_SELECT, sm);
        this.height = 8;
        this.numOfLevels = 64;
        this.offset = 150;
        this.maxOffset = -(Math.ceil(this.numOfLevels / this.height) * 250 - window.innerWidth + 150);
        get('levelselectstate').style.display = "block";
        var x, y, str = '', index;
        for (x = 0; x < Math.ceil(this.numOfLevels / this.height); x++) {
            str += '<div class="col">';
            for (y = 0; y < this.height; y++) {
                index = x * this.height + y;
                var enabled = Game.defaultLevels[index] !== undefined;
                str += '<div class="button lvlselect' + (enabled ? ' enabled' : '') + '" id="' + index + 'lvlselectButton" ' +
                    (enabled ? 'onclick="if (clickType(event)===\'left\') Game.sm.enterState(\'game\', ' + index + ');"' : '') +
                    '>' + index + '</div>';
            }
            str += '</div>';
        }
        str += '<div id="backarrow" onmouseover="Game.lvlselectButtonDirection=1;" onmouseout="Game.lvlselectButtonDirection=0;" onclick="Game.lvlselectButtonDirection=1000" style="visibility: hidden"><p>&#9664;</p></div>';
        str += '<div id="forwardarrow" onmouseover="Game.lvlselectButtonDirection=-1" onmouseout="Game.lvlselectButtonDirection=0;" onclick="Game.lvlselectButtonDirection=-1000"><p>&#9654;</p></div>';
        str += '<div class="button" onclick="if (clickType(event)===\'left\') Game.sm.enterPreviousState();" style="margin-left: -90px; margin-top: -490px;">Back</div>';
        get('levelselectstate').style.width = 250 * Math.ceil(this.numOfLevels / this.height) + 'px';
        get('levelselectstate').style.marginLeft = '150px';
        get('levelselectstate').style.marginTop = '80px';
        get('levelselectstate').innerHTML = str;
        LevelSelectState.updateButtonBgs();
    }
    LevelSelectState.prototype.highestLevelUnlocked = function () {
        var highest = 0;
        for (var i = 0; i < this.numOfLevels; i++) {
            if (Game.completedLevels[i] === false) {
                highest = i;
            }
        }
        highest %= 8;
        highest += 8;
    };
    LevelSelectState.updateButtonBgs = function () {
        if (get('levelselectstate').innerHTML === '')
            return;
        for (var i = 0; i < Game.defaultLevels.length; i++) {
            if (Game.completedLevels[i] === true) {
                get(i + 'lvlselectButton').style.backgroundColor = Colour.GREEN;
            }
            else {
                get(i + 'lvlselectButton').style.backgroundColor = null;
            }
        }
    };
    LevelSelectState.prototype.update = function () {
        this.offset += Game.lvlselectButtonSpeed * Game.lvlselectButtonDirection;
        if (this.offset >= 150) {
            this.offset = 150;
            get('backarrow').style.visibility = "hidden";
        }
        else if (this.offset <= this.maxOffset) {
            this.offset = this.maxOffset;
            get('forwardarrow').style.visibility = "hidden";
        }
        else {
            this.highestLevelUnlocked();
            get('forwardarrow').style.visibility = "visible";
            get('backarrow').style.visibility = "visible";
        }
        get('levelselectstate').style.marginLeft = this.offset + 'px';
    };
    LevelSelectState.prototype.hide = function () {
        get('levelselectstate').style.display = "none";
    };
    LevelSelectState.prototype.restore = function () {
        LevelSelectState.updateButtonBgs();
        get('levelselectstate').style.display = "block";
    };
    LevelSelectState.prototype.destroy = function () {
        get('levelselectstate').style.display = "none";
    };
    return LevelSelectState;
})(BasicState);
var GameState = (function (_super) {
    __extends(GameState, _super);
    function GameState(sm, levelNum) {
        _super.call(this, STATE.GAME, sm);
        this.levelNum = levelNum;
        GameState.levelEditTiles = [
            Level.getNewDefaultTile(ID.BLANK, 0, 0),
            Level.getNewDefaultTile(ID.MIRROR, 0, 0),
            Level.getNewDefaultTile(ID.POINTER, 0, 0),
            Level.getNewDefaultTile(ID.RECEPTOR, 0, 0)];
        this.level = new Level(this.levelNum);
        get('gameboard').style.display = "initial";
        get('gameboard').style.left = "50%";
        get('gameboard').style.marginLeft = -(this.level.w * Tile.size) / 2 + "px";
        get('gameboard').style.width = this.level.w * Tile.size + "px";
        get('gameboard').style.height = this.level.h * Tile.size + "px";
        get('gamecanvas').width = this.level.w * Tile.size;
        get('gamecanvas').height = this.level.h * Tile.size;
        get('lvledittiles').innerHTML = '<div>' +
            '<div class="selectionTile" id="0tile" onclick="selectionTileClick(event, true, 0);" onmouseup="selectionTileClick(event, false, 0);" ' +
            'onmouseover="get(\'0tilep\').style.visibility=\'visible\'" onmouseout="get(\'0tilep\').style.visibility=\'hidden\'"><p id="0tilep" style="visibility: hidden">blank</p></div>' +
            '<div class="selectionTile" id="1tile" onclick="selectionTileClick(event, true, 1);" onmouseup="selectionTileClick(event, false, 1);" ' +
            'onmouseover="get(\'1tilep\').style.visibility=\'visible\'" onmouseout="get(\'1tilep\').style.visibility=\'hidden\'"><p id="1tilep" style="visibility: hidden">mirror</p></div>' +
            '<div class="selectionTile" id="2tile" onclick="selectionTileClick(event, true, 2);" onmouseup="selectionTileClick(event, false, 2);" ' +
            'onmouseover="get(\'2tilep\').style.visibility=\'visible\'" onmouseout="get(\'2tilep\').style.visibility=\'hidden\'"><p id="2tilep" style="visibility: hidden">pointer</p></div>' +
            '<div class="selectionTile" id="3tile" onclick="selectionTileClick(event, true, 3);" onmouseup="selectionTileClick(event, false, 3);" ' +
            'onmouseover="get(\'3tilep\').style.visibility=\'visible\'" onmouseout="get(\'3tilep\').style.visibility=\'hidden\'"><p id="3tilep" style="visibility: hidden">receptor</p></div>' +
            '<div class="selectionTile" id="printButton" onclick="selectionTileClick(event, true, 888)"><p>print</p></div>' +
            '<div class="selectionTile" id="clearButton" onclick="selectionTileClick(event, true, 887)"><p>clear</p></div>' +
            '<div class="selectionTile" id="helpButton" onclick="selectionTileClick(event, true, 886)"><p>help</p></div>' +
            '</div>';
        get('lvledittilescanvas').width = Tile.size;
        get('lvledittilescanvas').height = 7 * Tile.size;
        if (GameState.levelEditMode) {
            get('lvledittilesarea').style.display = "initial";
        }
        else {
            get('lvledittilesarea').style.display = "none";
        }
        get('levelNumHeading').innerHTML = 'Level ' + this.levelNum;
    }
    GameState.prototype.update = function () {
    };
    GameState.prototype.render = function () {
        this.level.render();
        if (GameState.levelEditMode) {
            var context = get('lvledittilescanvas').getContext('2d');
            for (var i = 0; i < 7; i++) {
                if (Game.selectedTileID === i)
                    context.fillStyle = Colour.GREEN;
                else
                    context.fillStyle = Colour.DARK_GRAY;
                context.fillRect(0, i * Tile.size, Tile.size, Tile.size);
                if (i < GameState.levelEditTiles.length)
                    GameState.levelEditTiles[i].render(context, Tile.size / 2, i * Tile.size + Tile.size / 2);
                context.strokeStyle = Colour.LIGHT_GRAY;
                context.lineWidth = 1;
                context.strokeRect(0, i * Tile.size, Tile.size, Tile.size);
            }
        }
    };
    GameState.prototype.restore = function () {
        get('gameboard').style.display = "initial";
        if (GameState.levelEditMode)
            get('lvledittilesarea').style.display = "initial";
    };
    GameState.prototype.destroy = function () {
        get('gameboard').style.display = "none";
        get('lvledittilesarea').style.display = "none";
    };
    GameState.prototype.click = function (event, down) {
        this.level.click(event, down);
        this.level.saveToMemory();
    };
    GameState.prototype.hover = function (event, into) {
        this.level.hover(event, into);
    };
    GameState.prototype.setResetLevelPopup = function () {
        Game.setPopup('<h3>Reset level</h3>' +
            '<p>Are you sure you want to reset?</p>' +
            '<div class="popupButton button" id="yesButton" onclick="if (clickType(event)===\'left\') { Sound.play(Sound.wizzle); Game.sm.currentState().level.reset(); Game.clearPopup(); }">Reset</div>' +
            '<div class="popupButton button" id="cancelButton" onclick="if (clickType(event)===\'left\') { Sound.play(Sound.select); Game.clearPopup(); }">Cancel</div>', 'margin-left: -146px;');
    };
    return GameState;
})(BasicState);
var StateManager = (function () {
    function StateManager() {
        this.states = [];
        this.states.push(new MainMenuState(this));
    }
    StateManager.prototype.update = function () {
        if (this.states.length > 0) {
            this.currentState().update();
        }
    };
    StateManager.prototype.render = function () {
        if (this.states.length > 0) {
            this.currentState().render();
        }
    };
    StateManager.prototype.enterState = function (state, levelNum) {
        Sound.play(Sound.select);
        this.currentState().hide();
        if (state === "game")
            this.states.push(this.getState(state, levelNum || 0));
        else
            this.states.push(this.getState(state));
    };
    StateManager.prototype.getState = function (state, levelNum) {
        switch (state) {
            case "mainmenu":
                return new MainMenuState(this);
            case "about":
                return new AboutState(this);
            case "levelselect":
                return new LevelSelectState(this);
            case "game":
                return new GameState(this, levelNum);
            case "option":
                return new OptionState(this);
        }
        return null;
    };
    StateManager.prototype.enterPreviousState = function () {
        if (this.states.length > 1) {
            Sound.play(Sound.select);
            this.currentState().destroy();
            this.states.pop();
            this.currentState().restore();
            return true;
        }
        return false;
    };
    StateManager.prototype.currentState = function () {
        return this.states[this.states.length - 1];
    };
    return StateManager;
})();
var Laser = (function () {
    function Laser(entering, exiting, colour) {
        this.entering = entering;
        this.exiting = exiting;
        this.colour = colour;
        if (!colour)
            this.colour = COLOUR.RED;
    }
    Laser.prototype.render = function (context, x, y, dir) {
        if (this.entering !== null)
            Game.renderImage(context, x, y, Game.images[IMAGE.LASER][this.colour], Direction.add(dir, this.entering), Tile.size);
        if (this.exiting !== null)
            Game.renderImage(context, x, y, Game.images[IMAGE.LASER][this.colour], Direction.add(dir, this.exiting), Tile.size);
    };
    return Laser;
})();
var Receptor = (function () {
    function Receptor(colour) {
        this.colour = colour;
        this.laser = null;
        this.on = false;
    }
    Receptor.prototype.update = function () {
        var wasOn = this.on;
        this.on = (this.laser !== null && Receptor.colourTurnsMeOn(this.laser.colour, this.colour));
        if (this.on === false) {
            this.laser = null;
        }
        else {
            if (wasOn === false)
                Sound.play(Sound.blip);
        }
    };
    Receptor.prototype.render = function (context, x, y, dir) {
        Game.renderImage(context, x, y, Game.images[ID.RECEPTOR][this.colour], dir, Tile.size);
    };
    Receptor.colourTurnsMeOn = function (laserColour, receptorColour) {
        if (receptorColour === COLOUR.WHITE)
            return true;
        else
            return (receptorColour === laserColour);
    };
    return Receptor;
})();
var Tile = (function () {
    function Tile(x, y, id, dir) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.hovering = false;
        this.lasers = [];
        if (dir)
            this.dir = dir;
        else
            this.dir = DIRECTION.NORTH;
    }
    Tile.prototype.maxdir = function () {
        switch (this.id) {
            case ID.BLANK:
                return 0;
            case ID.MIRROR:
                return 1;
            case ID.POINTER:
            case ID.RECEPTOR:
                return 3;
            default:
                return 0;
        }
    };
    Tile.prototype.click = function (event, down) {
        if (down === false)
            return;
        if (clickType(event) === "left") {
            if (event.shiftKey) {
                this.dir -= 1;
                if (this.dir < 0)
                    this.dir = this.maxdir();
            }
            else {
                this.dir += 1;
                if (this.dir > this.maxdir())
                    this.dir = 0;
            }
        }
    };
    Tile.prototype.hover = function (into) {
        this.hovering = into;
    };
    Tile.prototype.update = function (board) {
    };
    Tile.prototype.render = function (context, x, y) {
        var i;
        for (i = 0; i < this.lasers.length; i++) {
            this.lasers[i].render(context, x, y, 0);
        }
        Game.renderImage(context, x, y, Game.images[this.id], this.dir, Tile.size);
    };
    Tile.prototype.addLaser = function (laser) {
        this.lasers.push(laser);
    };
    Tile.prototype.removeAllLasers = function () {
        this.lasers = [];
    };
    Tile.prototype.getNextType = function () {
        return (this.id + 1) % ID.RECEPTOR;
    };
    Tile.size = 64;
    return Tile;
})();
var BlankTile = (function (_super) {
    __extends(BlankTile, _super);
    function BlankTile(x, y) {
        _super.call(this, x, y, ID.BLANK);
    }
    BlankTile.prototype.addLaser = function (laser) {
        laser.exiting = Direction.opposite(laser.entering);
        _super.prototype.addLaser.call(this, laser);
    };
    return BlankTile;
})(Tile);
var MirrorTile = (function (_super) {
    __extends(MirrorTile, _super);
    function MirrorTile(x, y, dir) {
        _super.call(this, x, y, ID.MIRROR, dir);
    }
    MirrorTile.prototype.addLaser = function (laser) {
        if (this.dir === DIRECTION.NW) {
            if (laser.entering === DIRECTION.NORTH)
                laser.exiting = DIRECTION.EAST;
            else if (laser.entering === DIRECTION.EAST)
                laser.exiting = DIRECTION.NORTH;
            else if (laser.entering === DIRECTION.SOUTH)
                laser.exiting = DIRECTION.WEST;
            else if (laser.entering === DIRECTION.WEST)
                laser.exiting = DIRECTION.SOUTH;
        }
        else if (this.dir === DIRECTION.NE) {
            if (laser.entering === DIRECTION.NORTH)
                laser.exiting = DIRECTION.WEST;
            else if (laser.entering === DIRECTION.WEST)
                laser.exiting = DIRECTION.NORTH;
            else if (laser.entering === DIRECTION.EAST)
                laser.exiting = DIRECTION.SOUTH;
            else if (laser.entering === DIRECTION.SOUTH)
                laser.exiting = DIRECTION.EAST;
        }
        _super.prototype.addLaser.call(this, laser);
    };
    return MirrorTile;
})(Tile);
var PointerTile = (function (_super) {
    __extends(PointerTile, _super);
    function PointerTile(x, y, dir, on, colour) {
        _super.call(this, x, y, ID.POINTER, dir);
        this.on = on;
        this.colour = colour;
        if (this.on) {
            this.addLaser(new Laser(null, this.dir, this.colour));
        }
    }
    PointerTile.prototype.click = function (event, down) {
        if (down === false)
            return;
        if (clickType(event) === "left") {
            _super.prototype.click.call(this, event, down);
        }
        else if (clickType(event) === "right") {
            if (GameState.levelEditMode) {
                this.on = !this.on;
                if (this.on) {
                    this.colour = Colour.nextColor(this.colour, false);
                    this.addLaser(new Laser(null, this.dir, this.colour));
                }
                else {
                    this.removeAllLasers();
                }
            }
        }
    };
    PointerTile.prototype.update = function (level) {
        if (this.on === false)
            return;
        this.addLaser(new Laser(null, this.dir, this.colour));
        var checkedTiles = new Array(level.w * level.h), nextDir = this.dir, nextTile = level.getTile(this.x, this.y), xx, yy;
        for (var i = 0; i < level.w * level.h; i++) {
            checkedTiles[i] = 0;
        }
        do {
            xx = nextTile.x + Game.offset[nextDir][0];
            yy = nextTile.y + Game.offset[nextDir][1];
            if (xx < 0 || xx >= level.w || yy < 0 || yy >= level.h)
                break;
            if (checkedTiles[xx + yy * level.w] >= 2)
                break;
            else
                checkedTiles[xx + yy * level.w]++;
            nextTile = level.getTile(xx, yy);
            if (nextTile === null)
                break;
            if (nextTile.id === ID.POINTER) {
                break;
            }
            nextTile.addLaser(new Laser(Direction.opposite(nextDir), null, this.lasers[0].colour));
            if (nextTile.lasers.length > 0) {
                nextDir = nextTile.lasers[nextTile.lasers.length - 1].exiting;
            }
            else
                break;
        } while (nextDir !== null);
    };
    PointerTile.prototype.addLaser = function (laser) {
        if (this.lasers.length > 0)
            return;
        _super.prototype.addLaser.call(this, laser);
    };
    return PointerTile;
})(Tile);
var ReceptorTile = (function (_super) {
    __extends(ReceptorTile, _super);
    function ReceptorTile(x, y, dir, receptors) {
        if (receptors === void 0) { receptors = "XXXX"; }
        _super.call(this, x, y, ID.RECEPTOR, dir);
        if (receptors) {
            this.receptors = new Array(4);
            for (var i = 0; i < 4; i++) {
                if (receptors.charAt(i) === 'X')
                    this.receptors[i] = null;
                else
                    this.receptors[i] = new Receptor(getColourLonghand(receptors.charAt(i)));
            }
        }
        else {
            this.receptors = [new Receptor(COLOUR.WHITE), null, new Receptor(COLOUR.RED), null];
        }
    }
    ReceptorTile.prototype.numOfReceptors = function (receptors) {
        var num = 0, i;
        for (i = 0; i < this.receptors.length; i++) {
            if (receptors[i] !== null)
                num++;
        }
        return num;
    };
    ReceptorTile.prototype.click = function (event, down) {
        if (down === false)
            return;
        if (clickType(event) === "left") {
            _super.prototype.click.call(this, event, down);
        }
        else if (clickType(event) === "right") {
            if (GameState.levelEditMode) {
                if (Game.selectedTileID === this.id) {
                    var xx = getRelativeCoordinates(event, get('gamecanvas')).x % Tile.size, yy = getRelativeCoordinates(event, get('gamecanvas')).y % Tile.size, index;
                    if (xx + yy <= Tile.size) {
                        if (xx >= yy) {
                            index = Direction.sub(DIRECTION.NORTH, this.dir);
                        }
                        else {
                            index = Direction.sub(DIRECTION.WEST, this.dir);
                        }
                    }
                    else {
                        if (xx >= yy) {
                            index = Direction.sub(DIRECTION.EAST, this.dir);
                        }
                        else {
                            index = Direction.sub(DIRECTION.SOUTH, this.dir);
                        }
                    }
                    if (this.receptors[index] === null) {
                        this.receptors[index] = new Receptor(COLOUR.RED);
                    }
                    else {
                        this.receptors[index].colour = Colour.nextColor(this.receptors[index].colour, true);
                        if (this.numOfReceptors(this.receptors) > 1 && this.receptors[index].colour === COLOUR.RED)
                            this.receptors[index] = null;
                    }
                }
            }
        }
    };
    ReceptorTile.prototype.update = function (board) {
        for (var i = 0; i < this.receptors.length; i++) {
            if (this.receptors[i] !== null)
                this.receptors[i].laser = null;
        }
        for (i = 0; i < this.lasers.length; i++) {
            if (this.receptors[Direction.sub(this.lasers[i].entering, this.dir)] !== null) {
                this.receptors[Direction.sub(this.lasers[i].entering, this.dir)].laser = this.lasers[i];
            }
        }
        for (i = 0; i < this.receptors.length; i++) {
            if (this.receptors[i] !== null)
                this.receptors[i].update();
        }
    };
    ReceptorTile.prototype.allReceptorsOn = function () {
        for (var r in this.receptors) {
            if (this.receptors[r] && this.receptors[r].on == false)
                return false;
        }
        return true;
    };
    ReceptorTile.prototype.render = function (context, x, y) {
        if (this.allReceptorsOn()) {
            context.fillStyle = Colour.GREEN;
            context.strokeStyle = Colour.GREEN;
            context.lineJoin = "round";
            context.lineWidth = 20;
            context.strokeRect(x - Tile.size / 2 + 10, y - Tile.size / 2 + 10, Tile.size - 20, Tile.size - 20);
            context.fillRect(x - Tile.size / 2 + 10, y - Tile.size / 2 + 10, Tile.size - 20, Tile.size - 20);
        }
        for (var i = 0; i < this.lasers.length; i++) {
            if (this.lasers[i].exiting !== null)
                this.lasers[i].render(context, x, y, 0);
        }
        for (i = 0; i < this.receptors.length; i++) {
            if (this.receptors[i] !== null)
                this.receptors[i].render(context, x, y, this.dir + i);
        }
    };
    ReceptorTile.prototype.addLaser = function (laser) {
        // receptors keep track of their own lasers, but leave the rendering to the receptor objects
        var solid = false;
        for (var i = 0; i < this.receptors.length; i++) {
            if (this.receptors[i] !== null) {
                if (Direction.sub(i, this.dir) === laser.entering || Direction.sub(i, this.dir) === Direction.opposite(laser.entering)) {
                    solid = true;
                }
            }
        }
        if (solid === false)
            laser.exiting = Direction.opposite(laser.entering);
        _super.prototype.addLaser.call(this, laser);
    };
    ReceptorTile.prototype.removeAllLasers = function () {
        if (this.id === ID.RECEPTOR) {
            for (var i = 0; i < this.receptors.length; i++) {
                if (this.receptors[i] !== null)
                    this.receptors[i].laser = null;
            }
        }
        _super.prototype.removeAllLasers.call(this);
    };
    return ReceptorTile;
})(Tile);
var Level = (function () {
    function Level(levelNum, w, h, tiles) {
        this.levelNum = levelNum;
        if (tiles) {
            this.w = w;
            this.h = h;
            this.tiles = tiles.slice();
        }
        else {
            if (Game.completedLevels[this.levelNum] ||
                this.loadLevelFromMemory() === false) {
                this.loadDefaultLevel();
            }
        }
        this.update();
    }
    Level.prototype.loadDefaultLevel = function () {
        var lvl = Game.defaultLevels[this.levelNum];
        this.w = lvl[0];
        this.h = lvl[1];
        this.tiles = Level.anyArrayToTileArray(this.w, this.h, lvl[2]);
    };
    Level.prototype.clear = function () {
        for (var i = 0; i < this.w * this.h; i++) {
            this.tiles[i] = new BlankTile(i % this.w, Math.floor(i / this.w));
        }
        this.update();
    };
    Level.prototype.getTile = function (x, y) {
        if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
            return this.tiles[x + y * this.w];
        }
        return null;
    };
    Level.prototype.update = function () {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].removeAllLasers();
        }
        for (i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].id === ID.POINTER)
                this.tiles[i].update(this);
        }
        for (i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].id !== ID.POINTER)
                this.tiles[i].update(this);
        }
        this.checkCompleted();
    };
    Level.prototype.render = function () {
        var context = get('gamecanvas').getContext('2d');
        context.fillStyle = Colour.GRAY;
        context.fillRect(0, 0, this.w * Tile.size, this.h * Tile.size);
        for (var i = 0; i < this.w * this.h; i++) {
            if (Game.debug === true) {
                context.strokeStyle = '#444';
                context.lineWidth = 1;
                context.strokeRect((i % this.w) * Tile.size, Math.floor(i / this.w) * Tile.size, Tile.size, Tile.size);
            }
            this.tiles[i].render(context, (i % this.w) * Tile.size + Tile.size / 2, Math.floor(i / this.w) * Tile.size + Tile.size / 2);
        }
    };
    Level.prototype.click = function (event, down) {
        var x = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).x / Tile.size);
        var y = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).y / Tile.size);
        this.tiles[y * this.w + x].click(event, down);
        if (GameState.levelEditMode && event.ctrlKey === false) {
            if (clickType(event) === "left")
                this.tiles[y * this.w + x] = Level.getNewDefaultTile(Game.selectedTileID, x, y);
            else if (clickType(event) === "right")
                this.tiles[y * this.w + x] = Level.getNewDefaultTile(ID.BLANK, x, y);
        }
        this.update();
    };
    Level.prototype.checkCompleted = function () {
        if (GameState.levelEditMode)
            return;
        var on = true;
        for (var i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].id === ID.RECEPTOR) {
                if (this.tiles[i].allReceptorsOn() == false) {
                    on = false;
                    break;
                }
            }
        }
        if (on) {
            Level.removeFromMemory(this.levelNum);
            Sound.play(Sound.win);
            if (Game.completedLevels[this.levelNum] !== true) {
                Game.completedLevels[this.levelNum] = true;
                Level.saveCompletedLevelsToMemory();
            }
        }
        if (on && Game.popupUp === false) {
            var str = '<div id="popupContent">' +
                '<h3>Level complete!</h3> <p>' + getMessage('win') + '!</p>' +
                '<div class="popupButton button" id="returnButton" onclick="if (clickType(event)===\'left\') { Game.sm.enterPreviousState(); Game.clearPopup(); }">Return</div>' +
                '<div class="popupButton button" id="nextButton" onclick="if (clickType(event)===\'left\') { Game.sm.enterPreviousState(); Game.clearPopup(); if (' + (this.levelNum + 1) + ' < Game.defaultLevels.length) { Game.sm.enterState(\'game\', ' + (this.levelNum + 1) + '); } }">Next Level!</div>' +
                '</div>';
            Game.setPopup(str);
        }
        else {
            Game.clearPopup();
        }
    };
    Level.prototype.hover = function (event, into) {
        var x = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).x / Tile.size);
        var y = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).y / Tile.size);
        this.tiles[y * this.w + x].hover(into);
    };
    Level.prototype.loadLevelFromMemory = function () {
        var data, storage, tiles, i, w, h;
        if (typeof (Storage) === "undefined") {
            alert("Failed to load data. You must update your browser if you want to play this game.");
            return false;
        }
        storage = window.localStorage.getItem(Game.saveLocation + ' lvl: ' + this.levelNum);
        if (storage !== null)
            data = decodeURI(storage).split('|').filter(function (n) {
                return n !== '';
            });
        if (data === undefined) {
            return false;
        }
        w = parseInt(data[1].split(',')[0]);
        h = parseInt(data[1].split(',')[1]);
        tiles = new Array(w * h);
        for (i = 0; i < w * h; i++) {
            tiles[i] = new BlankTile(i % w, Math.floor(i / w));
        }
        for (i = 2; i < data.length; i++) {
            var info = data[i].split(','), id = info[0], pos = parseInt(info[1]), dir = parseInt(info[2]);
            switch (id) {
                case 'M':
                    tiles[pos] = new MirrorTile(pos % w, Math.floor(pos / w), dir);
                    break;
                case 'P':
                    tiles[pos] = new PointerTile(pos % w, Math.floor(pos / w), dir, parseBool(info[3]), parseInt(info[4]));
                    break;
                case 'R':
                    tiles[pos] = new ReceptorTile(pos % w, Math.floor(pos / w), dir, info[3]);
                    break;
                default:
                    console.error("unknown type saved in local storage: " + id);
                    break;
            }
        }
        this.w = w;
        this.h = h;
        this.tiles = tiles;
        return true;
    };
    Level.resetAll = function () {
        for (var i = 0; i < Game.defaultLevels.length; i++) {
            Level.removeFromMemory(i);
        }
        Game.completedLevels = new Array(Game.defaultLevels.length);
        Level.saveCompletedLevelsToMemory();
        LevelSelectState.updateButtonBgs();
    };
    Level.prototype.reset = function () {
        Level.removeFromMemory(this.levelNum);
        this.loadDefaultLevel();
        this.update();
    };
    Level.removeFromMemory = function (levelNum) {
        if (typeof (Storage) === "undefined") {
            return;
        }
        if (window.localStorage.getItem(Game.saveLocation + ' lvl: ' + levelNum) !== null) {
            window.localStorage.removeItem(Game.saveLocation + ' lvl: ' + levelNum);
        }
    };
    Level.prototype.saveToMemory = function () {
        var str = '', i, j, tile, receptors;
        if (typeof (Storage) === "undefined") {
            console.error("Failed to save data. Please update your browser.");
            return;
        }
        if (Game.completedLevels[this.levelNum])
            return;
        str += Game.version + '|';
        str += this.w + ',' + this.h + '|';
        for (i = 0; i < this.tiles.length; i++) {
            tile = this.tiles[i];
            switch (tile.id) {
                case ID.BLANK:
                    break;
                case ID.MIRROR:
                    str += 'M,' + i + ',' + tile.dir + '|';
                    break;
                case ID.POINTER:
                    str += 'P,' + i + ',' + tile.dir + ',' + getBoolShorthand(tile.on) + ',' + tile.colour + '|';
                    break;
                case ID.RECEPTOR:
                    receptors = 'XXXX';
                    for (j = 0; j < 4; j++) {
                        if (tile.receptors[j] !== null)
                            receptors = receptors.substring(0, j) + getColourShorthand(tile.receptors[j].colour) + receptors.substring(j + 1);
                    }
                    str += 'R,' + i + ',' + tile.dir + ',' + receptors + '|';
                    break;
            }
        }
        window.localStorage.setItem(Game.saveLocation + ' lvl: ' + this.levelNum, encodeURI(str));
    };
    Level.saveCompletedLevelsToMemory = function () {
        if (typeof (Storage) === "undefined") {
            console.error("Failed to save data. Please update your browser.");
            return;
        }
        var str = '';
        for (var i = 0; i < Game.completedLevels.length; i++) {
            if (Game.completedLevels[i] === true)
                str += i + ',';
        }
        str = str.substr(0, Math.max(str.length - 1, 0));
        if (str.length === 0) {
            if (window.localStorage.getItem(Game.saveLocation + ' cl: ') !== undefined)
                window.localStorage.removeItem(Game.saveLocation + ' cl: ');
        }
        else
            window.localStorage.setItem(Game.saveLocation + ' cl: ', str);
    };
    Level.loadCompletedLevelsFromMemory = function () {
        if (typeof (Storage) === "undefined") {
            console.error("Failed to save data. Please update your browser.");
            return;
        }
        if (window.localStorage.getItem(Game.saveLocation + ' cl: ') === null)
            return;
        var str = window.localStorage.getItem(Game.saveLocation + ' cl: ').split(',');
        for (var i = 0; i < Game.completedLevels.length; i++) {
            if (str[i])
                Game.completedLevels[str[i]] = true;
        }
    };
    Level.prototype.getLevelString = function () {
        var i, j, tile, receptors, lvl = new Array(3);
        lvl[0] = this.w;
        lvl[1] = this.h;
        lvl[2] = new Array(this.w * this.h);
        for (i = 0; i < this.tiles.length; i++) {
            tile = this.tiles[i];
            switch (tile.id) {
                case ID.BLANK:
                    lvl[2][i] = ID.BLANK;
                    break;
                case ID.MIRROR:
                    if (tile.dir === DIRECTION.NORTH)
                        lvl[2][i] = ID.MIRROR;
                    else
                        lvl[2][i] = [ID.MIRROR, tile.dir];
                    break;
                case ID.POINTER:
                    if (tile.dir === DIRECTION.NORTH && tile.on === true && tile.colour === COLOUR.RED)
                        lvl[2][i] = ID.POINTER;
                    else
                        lvl[2][i] = [ID.POINTER, tile.dir, getBoolShorthand(tile.on), tile.colour];
                    break;
                case ID.RECEPTOR:
                    receptors = "XXXX";
                    for (j = 0; j < 4; j++) {
                        if (tile.receptors[j] !== null)
                            receptors = receptors.substring(0, j) + getColourShorthand(tile.receptors[j].colour) + receptors.substring(j + 1);
                    }
                    lvl[2][i] = [ID.RECEPTOR, tile.dir, "'" + receptors + "'"];
                    break;
            }
        }
        var str = "[" + lvl[0] + ", " + lvl[1] + ", [";
        for (i = 0; i < lvl[2].length; i++) {
            if (typeof lvl[2][i] === "number")
                str += lvl[2][i] + ", ";
            else
                str += "[" + lvl[2][i] + "], ";
        }
        str = str.substr(0, str.length - 2);
        str += "]]";
        return str;
    };
    Level.anyArrayToTileArray = function (w, h, arr) {
        var tiles = new Array(arr.length);
        for (var i = 0; i < w * h; i++) {
            tiles[i] = Level.getNewDefaultTile(arr[i], i % w, Math.floor(i / w));
            if (tiles[i] === null) {
                switch (arr[i][0]) {
                    case ID.BLANK:
                        console.error("Blank tiles shouldn't be saved using arrays (index: " + i + ")");
                        tiles[i] = new BlankTile(i % w, Math.floor(i / w));
                        break;
                    case ID.MIRROR:
                        tiles[i] = new MirrorTile(i % w, Math.floor(i / w), arr[i][1]);
                        break;
                    case ID.POINTER:
                        tiles[i] = new PointerTile(i % w, Math.floor(i / w), arr[i][1], arr[i][2], arr[i][3]);
                        break;
                    case ID.RECEPTOR:
                        tiles[i] = new ReceptorTile(i % w, Math.floor(i / w), arr[i][1], arr[i][2]);
                        break;
                    default:
                        console.error("Invalid tile property: " + arr[i] + " at index " + i);
                        break;
                }
            }
        }
        return tiles;
    };
    Level.getNewDefaultTile = function (id, x, y) {
        switch (id) {
            case ID.BLANK:
                return new BlankTile(x, y);
            case ID.MIRROR:
                return new MirrorTile(x, y, DIRECTION.NORTH);
            case ID.POINTER:
                return new PointerTile(x, y, DIRECTION.NORTH, true, COLOUR.RED);
            case ID.RECEPTOR:
                return new ReceptorTile(x, y, DIRECTION.NORTH, "RXBX");
        }
        return null;
    };
    Level.prototype.copy = function () {
        return new Level(this.levelNum, this.w, this.h, this.tiles);
    };
    return Level;
})();
var Sound = (function () {
    function Sound() {
    }
    Sound.toggleMute = function () {
        Sound.muted = !Sound.muted;
    };
    Sound.play = function (sound) {
        if (Sound.muted)
            return;
        get(sound).currentTime = 0;
        get(sound).play();
    };
    Sound.blip = 'blipSound';
    Sound.win = 'winSound';
    Sound.select = 'selectSound';
    Sound.select3 = 'selectSound3';
    Sound.wizzle = 'wizzleSound';
    Sound.muted = false;
    return Sound;
})();
var Colour = (function () {
    function Colour() {
    }
    Colour.nextColor = function (colour, useWhite) {
        switch (colour) {
            case COLOUR.RED:
                return COLOUR.GREEN;
            case COLOUR.GREEN:
                return COLOUR.BLUE;
            case COLOUR.BLUE:
                if (useWhite)
                    return COLOUR.WHITE;
                return COLOUR.RED;
            case COLOUR.WHITE:
                return COLOUR.RED;
        }
        return COLOUR.RED;
    };
    Colour.PURPLE = '#3B154B';
    Colour.GREEN = '#004500';
    Colour.GRAY = '#0A0A0A';
    Colour.DARK_GRAY = '#121212';
    Colour.LIGHT_GRAY = '#555';
    return Colour;
})();
function getBoolShorthand(bool) {
    return bool === true || bool === 1 || bool === "1" ? 1 : 0;
}
function getColourShorthand(colour) {
    switch (colour) {
        case COLOUR.RED:
            return 'R';
        case COLOUR.GREEN:
            return 'G';
        case COLOUR.BLUE:
            return 'B';
        case COLOUR.WHITE:
            return 'W';
    }
    return 'NULL';
}
function getColourLonghand(colour) {
    switch (colour) {
        case 'R':
            return COLOUR.RED;
        case 'G':
            return COLOUR.GREEN;
        case 'B':
            return COLOUR.BLUE;
        case 'W':
            return COLOUR.WHITE;
    }
    return -1;
}
function decimalToHex(decimal) {
    var n = Number(decimal).toString(16).toUpperCase();
    while (n.length < 2) {
        n = "0" + n;
    }
    return n;
}
function hexToDecimal(hex) {
    var n = String(parseInt(hex, 16));
    while (n.length < 2) {
        n = "0" + n;
    }
    return n;
}
function parseBool(value) {
    return value === "1" || value === 1 || value === true;
}
function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message;
    }
}
function selectionTileClick(event, down, id) {
    if (clickType(event) !== 'left')
        return;
    if (id === 888) {
        var msg = "<h3>Level " + Game.sm.currentState().level.levelNum + " save</h3><p>Copy and paste into Game.defaultLevels!</p><textarea id='levelSave' readonly>" + Game.sm.currentState().level.getLevelString() + "</textarea>";
        Game.setPopup(msg, 'max-width: 320px; margin-left: -172px');
        get('levelSave').select();
    }
    else if (id === 887) {
        Game.sm.currentState().level.clear();
    }
    else if (id === 886) {
        var msg = "<h3>Level editor help</h3><p>Hello curious player! You are currently in Mirror's level editor. Here you can create your own levels! The print button will export the save as a string." +
            " As of this update, the only way to using these strings is by pasting it in the Game.defaultLevels array.</p><p>Tip: hold crtl to edit receptor tiles</p>";
        Game.setPopup(msg, 'max-width: 320px; margin-left: -172px');
    }
    else if (down) {
        Game.selectedTileID = id;
    }
}
function toggleLevelEditMode() {
    setLevelEditMode(!GameState.levelEditMode);
}
function setLevelEditMode(levelEditMode) {
    GameState.levelEditMode = levelEditMode;
    if (GameState.levelEditMode) {
        setDebug(true);
        get('lvlEditInfo').style.backgroundColor = Colour.GREEN;
        if (Game.sm.currentState().id === STATE.GAME) {
            get('lvledittilesarea').style.display = "initial";
        }
    }
    else {
        get('lvlEditInfo').style.backgroundColor = "initial";
        get('lvledittilesarea').style.display = "none";
    }
}
function toggleDebug() {
    setDebug(!Game.debug);
}
function setDebug(debug) {
    Game.debug = debug;
    if (Game.debug === false)
        setLevelEditMode(false);
    if (Game.debug)
        Game.stats.domElement.style.display = "initial";
    else
        Game.stats.domElement.style.display = "none";
    if (Game.debug) {
        get('infoarea').style.display = "initial";
        get('debugInfo').style.backgroundColor = Colour.GREEN;
    }
    else {
        get('infoarea').style.display = "none";
        get('debugInfo').style.backgroundColor = "initial";
    }
}
var Direction = (function () {
    function Direction() {
    }
    Direction.clockwise = function (dir) {
        dir += 1;
        if (dir > 3) {
            dir = 0;
        }
        return dir;
    };
    Direction.anticlockwise = function (dir) {
        dir -= 1;
        if (dir < 0) {
            dir = 3;
        }
        return dir;
    };
    Direction.add = function (dir1, dir2) {
        return (dir1 + dir2) % 4;
    };
    Direction.sub = function (dir1, dir2) {
        var result = dir1 - dir2;
        if (result < 0) {
            dir1 = (4 + result) % 4;
        }
        else {
            dir1 = result;
        }
        return dir1;
    };
    Direction.opposite = function (dir) {
        if (dir === DIRECTION.NORTH) {
            return DIRECTION.SOUTH;
        }
        else if (dir === DIRECTION.EAST) {
            return DIRECTION.WEST;
        }
        else if (dir === DIRECTION.SOUTH) {
            return DIRECTION.NORTH;
        }
        else if (dir === DIRECTION.WEST) {
            return DIRECTION.EAST;
        }
        else {
            console.error("Invalid direction!! " + dir);
        }
        return 0;
    };
    return Direction;
})();
function keyPressed(event, down) {
    if (Game.keysdown) {
        var keycode = event.keyCode ? event.keyCode : event.which;
        Game.keysdown[keycode] = down;
        if (Game.keysdown[Game.KEYBOARD.ONE])
            Game.selectedTileID = 0;
        if (Game.keysdown[Game.KEYBOARD.TWO])
            Game.selectedTileID = 1;
        if (Game.keysdown[Game.KEYBOARD.THREE])
            Game.selectedTileID = 2;
        if (Game.keysdown[Game.KEYBOARD.FOUR])
            Game.selectedTileID = 3;
    }
}
window.onkeydown = function (event) {
    keyPressed(event, true);
};
window.onkeyup = function (event) {
    keyPressed(event, false);
};
function boardClick(event, down) {
    if (Game.sm.currentState().id === STATE.GAME)
        Game.sm.currentState().click(event, down);
}
function clickType(event) {
    if (event.which === 3 || event.button === 2)
        return "right";
    else if (event.which === 1 || event.button === 0)
        return "left";
    else if (event.which === 2 || event.button === 1)
        return "middle";
}
function getRelativeCoordinates(event, reference) {
    var x, y, e, el, pos, offset;
    event = event || window.event;
    el = event.target || event.srcElement;
    pos = getAbsolutePosition(reference);
    x = event.pageX - pos.x;
    y = event.pageY - pos.y;
    return { x: x, y: y };
}
function getAbsolutePosition(element) {
    var r = { x: element.offsetLeft, y: element.offsetTop };
    if (element.offsetParent) {
        var tmp = getAbsolutePosition(element.offsetParent);
        r.x += tmp.x;
        r.y += tmp.y;
    }
    return r;
}
function getMessage(type) {
    var num = Math.floor(Math.random() * 6);
    switch (type) {
        case 'win':
            switch (num) {
                case 0:
                    return 'Good Job';
                case 1:
                    return 'Sweet';
                case 2:
                    return 'Excellent';
                case 3:
                    return 'Nice';
                case 4:
                    return 'Awesome';
                case 5:
                    return 'Congrats';
            }
    }
    return 'Good Job';
}
function mobileCheck() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
        check = true; })(navigator.userAgent || navigator.vendor);
    return check;
}
window.onload = function () {
    if (mobileCheck()) {
        window.location.href = 'http://ajweeks.github.io/mirrorsm';
    }
    Game.init();
    Game.loop();
};
