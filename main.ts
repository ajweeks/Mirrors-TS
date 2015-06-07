// Copyright AJ Weeks 2015
/* jshint browser: true */
/* jshint devel: true */
/* global Stats */
/* global Bugsnag */

declare
    function Stats(): any;

function get(what: string): HTMLElement {
    return document.getElementById(what);
}

enum ID { BLANK = 0, MIRROR = 1, POINTER = 2, RECEPTOR = 3 }
enum COLOUR { RED, GREEN, BLUE, WHITE }
enum STATE { MAIN_MENU, GAME, ABOUT, OPTION, LEVEL_SELECT }
enum IMAGE { BLANK = 0, MIRROR = 1, POINTER = 2, RECEPTOR = 3, LASER = 4 }
enum DIRECTION { NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3, NW = 0, NE = 1, SE = 2, SW = 3 }

class Game {
    static version: number = 0.041;
    static releaseStages = { DEVELOPMENT: "development", PRODUCTION: "production" };
    static releaseStage: string = Game.releaseStages.DEVELOPMENT;   // RELEASE make false
    static images = [];
    static preferences = { 'warn': Game.debug };
    static selectedTileID: number = ID.BLANK;
    static saveLocation: string = "Mirrors";
    static debug: boolean;
    static popupUp: boolean = false;

    /*
     *   Levels are stored as follows:
     *   In the simplest form, just a 1D array of numbers   e.g. [0, 1, 2, 0, 2], with each number cooresponding to a tile type
     *   However, if a tile has more information than just type (everything except blank types) then a sub-array will be
     *   used to store that info     e.g. [0, [1, 1], 2, 0, [2, 1, 2], 1]    if this method is used, not every complex
     *   element needs to be in an array, if the default direction, colour, etc. is wanted (FYI it's NORTH & RED)
     *   If an element does use the sub-array method, it MUST have all fields filled out, even if they are the same as the defaults
     *   Mirror: [ID, DIR]
     *   Pointer: [ID, DIR, ON, COL]
     *   Receptor: [ID, DIR, RECEPTORS STRING (NESW, 'R', 'G', 'B', 'W', 'X' <- blank)]
     *
     *   eg.
     *   Mirror: [1, 1]
     *   Pointer: [2, 3, 1, 2]
     *   Receptor: [3, 1, "RBXW"]
     */

    /* The default game levels (these NEVER get mutated) */
    static defaultLevels = [
        [10, 8, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [2, 1, 1, 0], 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, [3, 3, 'GXXX'], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [3, 1, 'RXXX'], 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, [2, 3, 1, 1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

        [10, 8, [[2, 1, 1, 2], 0, 0, 0, 0, 0, 0, 0, 0, 1, [1, 1], 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, [1, 1], 0, [1, 1], 0, 0, [1, 1], 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [2, 0, 1, 0], 0, 0, 0, 0, 0, 0, [3, 2, 'XXRB'], 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, [1, 1]]],

        [10, 8, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

        [10, 8, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    ];

    /* Stores which levels the player has completed */
    static completedLevels: boolean[];

    static keysdown: boolean[] = [];
    static sm: StateManager;

    static offset: number[][] = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // tile offsets (N, E, S, W)

    static ticks: number = 0;
    static fps: number = 60;

    static lvlselectButtonSpeed: number = 6; // the speed the level selection buttons are going
    static lvlselectButtonDirection: number = 0;

    static stats: any;

    static KEYBOARD = {
        BACKSPACE: 8, TAB: 9, RETURN: 13, ESC: 27, SPACE: 32, PAGEUP: 33, PAGEDOWN: 34, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, INSERT: 45, DELETE: 46, ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, TILDE: 192, SHIFT: 999
    };

    static init() {
        document.title = "Mirrors V" + Game.version;
        get('versionNumber').innerHTML = '<a href="https://github.com/ajweeks/mirrors-ts" target="_blank" style="color: inherit; text-decoration: none;">' + "V." + Game.version + '</a>';

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

        // Mr. Doob's stats widget:
        Game.stats = Stats();
        Game.stats.setMode(0); // 0: fps, 1: ms
        Game.stats.domElement.style.position = 'absolute';
        Game.stats.domElement.style.left = '0px';
        Game.stats.domElement.style.top = '0px';
        document.body.appendChild(Game.stats.domElement);

        Game.sm = new StateManager();

        Game.completedLevels = new Array<boolean>(Game.defaultLevels.length);

        Game.setDefaultPrefs();
    }

    static renderImage(context: CanvasRenderingContext2D, x: number, y: number, image, dir: number, size: number): void {
        context.save();
        context.translate(x, y);
        context.rotate(dir * 90 * (Math.PI / 180));

        try {
            context.drawImage(image, -size / 2, -size / 2);
        } catch (e) {
            throw new Error(e.message);
        }

        context.restore();
    }

    static setDefaultPrefs(): void {
        setDebug(Game.releaseStage === Game.releaseStages.DEVELOPMENT);
        setLevelEditMode(Game.debug);
        Game.preferences.warn = !Game.debug;
    }

    // TODO LATER add a tutorial overlay? controls at least?

    static setPopup(str: string): void {
        get('darken').style.display = "initial";
        get('popup').style.display = "initial";
        get('popup').innerHTML = str;
        Game.popupUp = true;
    }

    static clearPopup(): void {
        get('darken').style.display = "none";
        get('popup').style.display = "none";
        get('popup').innerHTML = "";
        Game.popupUp = false;
    }

    static update(): void {
        Game.ticks += 1;

        if (Game.keysdown[Game.KEYBOARD.ESC]) {
            if (Game.popupUp === true) {
                Game.clearPopup();
            } else {
                this.sm.enterPreviousState();
            }
        } else if (Game.keysdown[Game.KEYBOARD.ZERO]) {
            toggleLevelEditMode();
        } else if (Game.keysdown[Game.KEYBOARD.NINE]) {
            toggleDebug();
        }

        Game.sm.update();

        for (var i = 0; i < Game.keysdown.length; i++) {
            Game.keysdown[i] = false;
        }
    }

    static render(): void {
        Game.sm.render();
    }

    // Main loop
    static loop(): void {
        Game.stats.begin();

        Game.update();
        if (document.hasFocus() || Game.ticks % 5 === 0) { // render if the window has focus, or at least every 5 ticks
            Game.render();
        }

        Game.stats.end();

        window.setTimeout(Game.loop, 1000 / Game.fps);
    }
}

class BasicState {
    id: number;
    protected sm: StateManager;

    constructor(id: number, sm: StateManager) {
        this.id = id;
        this.sm = sm;
    }

    update(): void {
    }

    render(): void {
    }

    click(event: MouseEvent, down: boolean): void {
    }

    /* gets called when another state is placed on top of the stack and therefore covering this one */
    hide(): void {
    }

    restore(): void {
    }

    destroy(): void {
    }
}

class MainMenuState extends BasicState {
    constructor(sm: StateManager) {
        super(STATE.MAIN_MENU, sm);
    }

    hide() {
        get('mainmenubtns').style.display = "none";
    }

    restore() {
        get('mainmenubtns').style.display = "block";
    }

    destroy() {
        // should never be called, this state is always in memory
        assert(false, "Main Menu State is being destroyed!! D:");
    }
}

class AboutState extends BasicState {
    constructor(sm: StateManager) {
        super(STATE.ABOUT, sm);

        get('aboutstate').style.display = "block";
    }

    restore() {
        get('aboutstate').style.display = "block";
    }

    destroy() {
        get('aboutstate').style.display = "none";
    }
}

class OptionState extends BasicState {
    constructor(sm: StateManager) {
        super(STATE.OPTION, sm);

        get('optionstate').style.display = "block";
    }

    setResetLevelPopup():void {
      Game.setPopup('<h3>Clear level data</h3>' +
      '<p>Are you sure? This will erase all of your saved data!</p>' +
      '<div class="popupButton button" id="yesButton" onclick="if (clickType(event)===\'left\') { Level.resetAll(); Game.clearPopup(); }">Reset</div>' +
      '<div class="popupButton button" id="cancelButton" onclick="if (clickType(event)===\'left\') { Game.clearPopup(); }">Cancel</div>');
    }

    restore() {
        get('optionstate').style.display = "block";
    }

    destroy() {
        get('optionstate').style.display = "none";
    }
}

class LevelSelectState extends BasicState {
    height: number;
    numOfLevels: number;
    offset: number;
    maxOffset: number;

    constructor(sm: StateManager) {
        super(STATE.LEVEL_SELECT, sm);

        this.height = 8;
        this.numOfLevels = 64;
        this.offset = 150;
        this.maxOffset = -(Math.ceil(this.numOfLevels / this.height) * 250 - window.innerWidth + 150);

        get('levelselectstate').style.display = "block";
        var x, y, str = '', n;
        for (x = 0; x < Math.ceil(this.numOfLevels / this.height); x++) { // for every column
            str += '<div class="col">';
            for (y = 0; y < this.height; y++) { // for every item in the column
                n = (x * this.height) + y;
                var enabled = Game.defaultLevels[n] !== undefined;
                str += '<div class="button lvlselect' + (enabled ? ' enabled' : '') + '" id="' + n + 'lvlselectButton" ' +
                (enabled ? 'onmousedown="if (clickType(event)===\'left\') Game.sm.enterState(\'game\', ' + n + ');"' : '') +
                '>' + decimalToHex(n) + '</div>';
            }
            str += '</div>';
        }
        str += '<div id="backarrow" onmouseover="Game.lvlselectButtonDirection=1;" onmouseout="Game.lvlselectButtonDirection = 0;" style="visibility: hidden"><p>&#9664;</p></div>';
        str += '<div id="forwardarrow" onmouseover="Game.lvlselectButtonDirection=-1" onmouseout="Game.lvlselectButtonDirection = 0;"><p>&#9654;</p></div>';
        str += '<div class="button" onmousedown="if (clickType(event)===\'left\') Game.sm.enterPreviousState();" style="margin-left: -90px; margin-top: -490px;">Back</div>';
        get('levelselectstate').style.width = 250 * Math.ceil(this.numOfLevels / this.height) + 'px'; // LATER make this better, but this works for now I guess
        get('levelselectstate').style.marginLeft = '150px';
        get('levelselectstate').style.marginTop = '80px';
        get('levelselectstate').innerHTML = str;

        LevelSelectState.updateButtonBgs();

        // XXX TODO Save completed levels in local storage
    }

    static updateButtonBgs() {
        if (get('levelselectstate').innerHTML === '') return; // The level select buttons haven't been generated yet
        for (var i = 0; i < Game.defaultLevels.length; i++) {
            if (Game.completedLevels[i] === true) {
                get(i + 'lvlselectButton').style.backgroundColor = Colour.GREEN;
            } else {
                get(i + 'lvlselectButton').style.backgroundColor = null;
            }
        }
    }

    update() {
        this.offset += Game.lvlselectButtonSpeed * Game.lvlselectButtonDirection;
        if (this.offset >= 150) {
            this.offset = 150;
            get('backarrow').style.visibility = "hidden";
        } else if (this.offset <= this.maxOffset) {
            this.offset = this.maxOffset;
            get('forwardarrow').style.visibility = "hidden";
        } else {
            get('forwardarrow').style.visibility = "visible";
            get('backarrow').style.visibility = "visible";
        }

        get('levelselectstate').style.marginLeft = this.offset + 'px';
    }

    hide() {
        get('levelselectstate').style.display = "none";
    }

    restore() {
        LevelSelectState.updateButtonBgs();
        get('levelselectstate').style.display = "block";
    }

    destroy() {
        get('levelselectstate').style.display = "none";
    }
}

class GameState extends BasicState {
    static levelEditMode: boolean;
    static levelEditTiles: Tile[];
    levelNum: number;
    level: Level;

    constructor(sm: StateManager, levelNum: number) {
        super(STATE.GAME, sm);
        this.levelNum = levelNum;

        GameState.levelEditTiles = [
            Level.getNewDefaultTile(ID.BLANK, 0, 0),
            Level.getNewDefaultTile(ID.MIRROR, 0, 0),
            Level.getNewDefaultTile(ID.POINTER, 0, 0),
            Level.getNewDefaultTile(ID.RECEPTOR, 0, 0)];

        this.level = new Level(this.levelNum);

        get('gameboard').style.display = "block";

        // centering code:
        get('gameboard').style.left = "50%";
        get('gameboard').style.marginLeft = -(this.level.w * Tile.size) / 2 + "px";

        get('gameboard').style.width = this.level.w * Tile.size + "px";
        get('gameboard').style.height = this.level.h * Tile.size + "px";

        (<HTMLCanvasElement>get('gamecanvas')).width = this.level.w * Tile.size;
        (<HTMLCanvasElement>get('gamecanvas')).height = this.level.h * Tile.size;


        get('lvledittiles').innerHTML = '<div>' +
        '<div class="selectionTile" id="0tile" onmousedown="selectionTileClick(event, true, 0);" onmouseup="selectionTileClick(event, false, 0);" ' +
        'onmouseover="get(\'0tilep\').style.visibility=\'visible\'" onmouseout="get(\'0tilep\').style.visibility=\'hidden\'"><p id="0tilep" style="visibility: hidden">blank</p></div>' +
        '<div class="selectionTile" id="1tile" onmousedown="selectionTileClick(event, true, 1);" onmouseup="selectionTileClick(event, false, 1);" ' +
        'onmouseover="get(\'1tilep\').style.visibility=\'visible\'" onmouseout="get(\'1tilep\').style.visibility=\'hidden\'"><p id="1tilep" style="visibility: hidden">mirror</p></div>' +
        '<div class="selectionTile" id="2tile" onmousedown="selectionTileClick(event, true, 2);" onmouseup="selectionTileClick(event, false, 2);" ' +
        'onmouseover="get(\'2tilep\').style.visibility=\'visible\'" onmouseout="get(\'2tilep\').style.visibility=\'hidden\'"><p id="2tilep" style="visibility: hidden">pointer</p></div>' +
        '<div class="selectionTile" id="3tile" onmousedown="selectionTileClick(event, true, 3);" onmouseup="selectionTileClick(event, false, 3);" ' +
        'onmouseover="get(\'3tilep\').style.visibility=\'visible\'" onmouseout="get(\'3tilep\').style.visibility=\'hidden\'"><p id="3tilep" style="visibility: hidden">receptor</p></div>' +
        '<div class="selectionTile" id="printButton" onmousedown="selectionTileClick(event, true, 888)"><p>print</p></div>' +
        '<div class="selectionTile" id="clearButton" onmousedown="selectionTileClick(event, true, 887)"><p>clear</p></div>' +
        '<div class="selectionTile" id="helpButton" onmousedown="selectionTileClick(event, true, 886)"><p>help</p></div>' +
        '</div>';

        (<HTMLCanvasElement> get('lvledittilescanvas')).width = Tile.size;
        (<HTMLCanvasElement> get('lvledittilescanvas')).height = 7 * Tile.size;

        if (GameState.levelEditMode) {
            get('lvledittilesarea').style.display = "block";
        } else {
            get('lvledittilesarea').style.display = "none";
        }
    }

    update(): void {
        // this.level.update();
    }

    render(): void {
        this.level.render();

        if (GameState.levelEditMode) {
            var context: CanvasRenderingContext2D = (<HTMLCanvasElement> get('lvledittilescanvas')).getContext('2d');
            for (var i = 0; i < 7; i++) {
                if (Game.selectedTileID === i) context.fillStyle = Colour.GREEN;
                else context.fillStyle = Colour.DARK_GRAY;
                context.fillRect(0, i * Tile.size, Tile.size, Tile.size);
                if (i < GameState.levelEditTiles.length) GameState.levelEditTiles[i].render(context, Tile.size / 2, i * Tile.size + Tile.size / 2);
                // Game.renderImage(context, Tile.size / 2, i * Tile.size + Tile.size / 2, Game.images[i], DIRECTION.NORTH, Tile.size);
                context.strokeStyle = Colour.LIGHT_GRAY;
                context.lineWidth = 1;
                context.strokeRect(0, i * Tile.size, Tile.size, Tile.size);
            }
        }
    }

    restore(): void {
        get('gameboard').style.display = "block";
        if (GameState.levelEditMode) get('lvledittilesarea').style.display = "block";
    }

    destroy(): void {
        get('gameboard').style.display = "none";
        get('lvledittilesarea').style.display = "none";
    }

    click(event: MouseEvent, down: boolean): void {
        this.level.click(event, down);
        (<GameState> Game.sm.currentState()).level.saveToMemory(); // save the board every time the user updates the board LATER save on a timer instead? Or when leaving the page?
    }

    hover(event: MouseEvent, into: boolean): void {
        this.level.hover(event, into);
    }
}

class StateManager {
    states: BasicState[];

    constructor() {
        this.states = [];
        this.states.push(new MainMenuState(this));
    }

    update(): void {
        if (this.states.length > 0) {
            this.currentState().update();
        }
    }

    render(): void {
        if (this.states.length > 0) {
            this.currentState().render();
        }
    }

    enterState(state: string, levelNum?: number): void { // levelNum only used when entering a game state
        this.currentState().hide();
        if (state === "game") this.states.push(this.getState(state, levelNum || 0));
        else this.states.push(this.getState(state));
    }

    getState(state: string, levelNum?: number): BasicState {
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
    }

    enterPreviousState(): boolean {
        // TODO figure out why this line was here... pretty sure it just messes other things up now..
        // if (this.states[this.states.length - 1].id === STATE.GAME) (<GameState>this.states[this.states.length - 1]).level.checkCompleted();

        if (this.states.length > 1) { // if there is only one state, we can't go back any further
            this.currentState().destroy();
            this.states.pop();
            this.currentState().restore();
            return true;
        }

        return false;
    }

    currentState(): BasicState {
        return this.states[this.states.length - 1];
    }
}

/* @param colours: an array of size two [single laser, corner laser]
 @param dir: direction the tile is facing */
class Laser {
    constructor(public entering: number, public exiting: number, public colour: number) {
        if (!colour) this.colour = COLOUR.RED;
    }

    // @param dir: the direction the tile is facing
    render(context: CanvasRenderingContext2D, x: number, y: number, dir: number): void {
        if (this.entering !== null) Game.renderImage(context, x, y, Game.images[IMAGE.LASER][this.colour], Direction.add(dir, this.entering), Tile.size);
        if (this.exiting !== null) Game.renderImage(context, x, y, Game.images[IMAGE.LASER][this.colour], Direction.add(dir, this.exiting), Tile.size);
    }
}

// represents an actual receptor, in a receptor tile (receptor tiles can have 0-4 of these things)
class Receptor {
    laser: Laser;
    on: boolean;

    constructor(public colour: number) {
        this.laser = null;
        this.on = false;
    }

    update(): void {
        this.on = (this.laser !== null && Receptor.colourTurnsMeOn(this.laser.colour, this.colour));

        if (this.on === false) {
            this.laser = null;
        }
    }

    render(context: CanvasRenderingContext2D, x: number, y: number, dir: number): void {
        //            if (this.laser) this.laser.render(context, x, y, sub(dir, 2)); // don't render lasers on receptor tiles, for now at least
        Game.renderImage(context, x, y, Game.images[ID.RECEPTOR][this.colour], dir, Tile.size);
    }

    // returns whether or not the specified colour turns the specified receptor on
    static colourTurnsMeOn(laserColour: number, receptorColour: number): boolean {
        if (receptorColour === COLOUR.WHITE) return true;
        else return (receptorColour === laserColour);
    }
}

class Tile {
    static size: number = 64;
    x: number;
    y: number;
    id: number;
    hovering: boolean;
    lasers: Laser[];
    dir: number;

    constructor(x: number, y: number, id: number, dir?: number) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.hovering = false;
        this.lasers = [];
        if (dir) this.dir = dir;
        else this.dir = DIRECTION.NORTH;
    }

    maxdir(): number {
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
    }

    click(event: MouseEvent, down: boolean): void {
        if (down === false) return;
        if (clickType(event) === "left") {
            if (event.shiftKey) {
                this.dir -= 1;
                if (this.dir < 0) this.dir = this.maxdir();
            } else {
                this.dir += 1;
                if (this.dir > this.maxdir()) this.dir = 0;
            }
        }
    }

    hover(into: boolean): void {
        this.hovering = into;
    }

    update(board: Level): void {
    }

    render(context: CanvasRenderingContext2D, x: number, y: number): void {
        var i;
        for (i = 0; i < this.lasers.length; i++) {
            this.lasers[i].render(context, x, y, 0);
        }
        Game.renderImage(context, x, y, Game.images[this.id], this.dir, Tile.size);
    }

    //@param laser: a laser obj: { entering = the side of the tile it is entering (GLOBALLY), exiting = null }
    addLaser(laser: Laser): void {
        this.lasers.push(laser);
    }

    removeAllLasers(): void {
        this.lasers = [];
    }

    getNextType(): number {
        return (this.id + 1) % ID.RECEPTOR;
    }
}

class BlankTile extends Tile {
    constructor(x: number, y: number) {
        super(x, y, ID.BLANK);
    }

    addLaser(laser: Laser): void {
        laser.exiting = Direction.opposite(laser.entering);
        super.addLaser(laser);
    }
}

class MirrorTile extends Tile {
    constructor(x: number, y: number, dir: number) {
        super(x, y, ID.MIRROR, dir);
    }

    addLaser(laser: Laser): void {
        // there's probably a better way to do this, this will work for now though. FUTURE - implement a cool algorithm which elegantly handles this
        if (this.dir === DIRECTION.NW) {
            if (laser.entering === DIRECTION.NORTH) laser.exiting = DIRECTION.EAST;
            else if (laser.entering === DIRECTION.EAST) laser.exiting = DIRECTION.NORTH;
            else if (laser.entering === DIRECTION.SOUTH) laser.exiting = DIRECTION.WEST;
            else if (laser.entering === DIRECTION.WEST) laser.exiting = DIRECTION.SOUTH;
        } else if (this.dir === DIRECTION.NE) {
            if (laser.entering === DIRECTION.NORTH) laser.exiting = DIRECTION.WEST;
            else if (laser.entering === DIRECTION.WEST) laser.exiting = DIRECTION.NORTH;
            else if (laser.entering === DIRECTION.EAST) laser.exiting = DIRECTION.SOUTH;
            else if (laser.entering === DIRECTION.SOUTH) laser.exiting = DIRECTION.EAST;
        }
        super.addLaser(laser);
    }
}

class PointerTile extends Tile {
    on: boolean;
    colour: number;

    constructor(x: number, y: number, dir: number, on: boolean, colour: number) {
        super(x, y, ID.POINTER, dir);

        this.on = on;
        this.colour = colour;

        if (this.on) {
            this.addLaser(new Laser(null, this.dir, this.colour));
        }
    }

    click(event: MouseEvent, down: boolean): void {
        if (down === false) return;
        if (clickType(event) === "left") {
            super.click(event, down);
        } else if (clickType(event) === "right") {
            this.on = !this.on;
            if (this.on) {
                this.colour = Colour.nextColor(this.colour, false);
                this.addLaser(new Laser(null, this.dir, this.colour));
            } else {
                this.removeAllLasers();
            }
        }
    }

    update(level: Level): void {
        if (this.on === false) return;

        this.addLaser(new Laser(null, this.dir, this.colour));

        var checkedTiles = new Array<number>(level.w * level.h), // 0=not checked, 1=checked once, 2=checked twice (done)
            nextDir = this.dir, // direction towards next tile
            nextTile = level.getTile(this.x, this.y),
            xx,
            yy;

        for (var i = 0; i < level.w * level.h; i++) {
            checkedTiles[i] = 0;
        }

        do {
            xx = nextTile.x + Game.offset[nextDir][0];
            yy = nextTile.y + Game.offset[nextDir][1];

            if (xx < 0 || xx >= level.w || yy < 0 || yy >= level.h) break; // The next direction is leading us into the wall
            if (checkedTiles[xx + yy * level.w] >= 2) break; // we've already checked this tile twice (this line avoids infinite loops)
            else checkedTiles[xx + yy * level.w]++;

            nextTile = level.getTile(xx, yy); // get the tile to be updated
            if (nextTile === null) break; // we hit a wall

            if (nextTile.id === ID.POINTER) { // !!!! Add all other opaque/solid tiles here
                break;
            }

            // Find the next direction *after* setting the new laser object
            nextTile.addLaser(new Laser(Direction.opposite(nextDir), null, this.lasers[0].colour));
            if (nextTile.lasers.length > 0) {
                nextDir = nextTile.lasers[nextTile.lasers.length - 1].exiting;
            } else break; // they didn't add the laser, end the chain
        } while (nextDir !== null);
    }

    addLaser(laser: Laser): void {
        if (this.lasers.length > 0) return; // we already have a laser!! Don't add another one!
        super.addLaser(laser);
    }
}

class ReceptorTile extends Tile {
    receptors: Receptor[];

    constructor(x: number, y: number, dir: number, receptors: string = "XXXX") {
        super(x, y, ID.RECEPTOR, dir);

        if (receptors) {
            this.receptors = new Array<Receptor>(4);
            for (var i = 0; i < 4; i++) {
                if (receptors.charAt(i) === 'X') this.receptors[i] = null;
                else this.receptors[i] = new Receptor(getColourLonghand(receptors.charAt(i)));
            }
        } else {
            this.receptors = [new Receptor(COLOUR.WHITE), null, new Receptor(COLOUR.RED), null];
        }
    }

    numOfReceptors(receptors: Receptor[]): number {
        var num = 0, i;
        for (i = 0; i < this.receptors.length; i++) {
            if (receptors[i] !== null) num++;
        }
        return num;
    }

    click(event, down: boolean): void {
        if (down === false) return;
        if (clickType(event) === "left") {
            super.click(event, down);
        } else if (clickType(event) === "right") {
            if (GameState.levelEditMode) {
                if (Game.selectedTileID === this.id) {
                    // cycle through the different colours of receptors
                    var xx = getRelativeCoordinates(event, get('gamecanvas')).x % Tile.size,
                        yy = getRelativeCoordinates(event, get('gamecanvas')).y % Tile.size,
                        index;
                    if (xx + yy <= Tile.size) { // NW
                        if (xx >= yy) { // NE
                            index = Direction.sub(DIRECTION.NORTH, this.dir);
                        } else { // SW
                            index = Direction.sub(DIRECTION.WEST, this.dir);
                        }
                    } else { // SE
                        if (xx >= yy) { // NE
                            index = Direction.sub(DIRECTION.EAST, this.dir);
                        } else { // SW
                            index = Direction.sub(DIRECTION.SOUTH, this.dir);
                        }
                    }
                    if (this.receptors[index] === null) {
                        this.receptors[index] = new Receptor(COLOUR.RED);
                    } else {
                        this.receptors[index].colour = Colour.nextColor(this.receptors[index].colour, true);
                        if (this.numOfReceptors(this.receptors) > 1 && this.receptors[index].colour === COLOUR.RED) this.receptors[index] = null;
                    }
                }
            }
        }
    }

    update(board: Level): void {
        for (var i = 0; i < this.receptors.length; i++) {
            if (this.receptors[i] !== null) this.receptors[i].laser = null;
        }
        for (i = 0; i < this.lasers.length; i++) {
            if (this.receptors[Direction.sub(this.lasers[i].entering, this.dir)] !== null) { // there's a laser pointing into a receptor
                this.receptors[Direction.sub(this.lasers[i].entering, this.dir)].laser = this.lasers[i];
            }
        }
        for (i = 0; i < this.receptors.length; i++) {
            if (this.receptors[i] !== null) this.receptors[i].update();
        }
    }

    allReceptorsOn(): boolean {
        for (var r in this.receptors) {
            if (this.receptors[r] && (<Receptor>this.receptors[r]).on == false) return false;
        }
        return true;
    }

    render(context: CanvasRenderingContext2D, x: number, y: number): void {
        if (this.allReceptorsOn()) {
            context.fillStyle = Colour.GREEN;
            context.strokeStyle = Colour.GREEN;
            context.lineJoin = "round";
            context.lineWidth = 20;
            context.strokeRect(x - Tile.size / 2 + 10, y - Tile.size / 2 + 10, Tile.size - 20, Tile.size - 20);
            context.fillRect(x - Tile.size / 2 + 10, y - Tile.size / 2 + 10, Tile.size - 20, Tile.size - 20);
        }
        for (var i = 0; i < this.lasers.length; i++) {
            // check if any of our lasers go straight through us
            if (this.lasers[i].exiting !== null) this.lasers[i].render(context, x, y, 0);
        }
        for (i = 0; i < this.receptors.length; i++) {
            if (this.receptors[i] !== null) this.receptors[i].render(context, x, y, this.dir + i);
        }
    }

    addLaser(laser: Laser): void {
        // receptors keep track of their own lasers, but leave the rendering to the receptor objects

        // check if the laser can pass straight through us (if we have two or fewer receptors and they aren't in the way of the laser)
        var solid = false;
        for (var i = 0; i < this.receptors.length; i++) {
            if (this.receptors[i] !== null) {
                if (Direction.sub(i, this.dir) === laser.entering || Direction.sub(i, this.dir) === Direction.opposite(laser.entering)) {
                    solid = true; // there is a receptor in the way, just add the laser without an exiting dir
                }
            }
        }
        // if we reach this point, we can do what a blank tile does
        if (solid === false) laser.exiting = Direction.opposite(laser.entering);

        super.addLaser(laser);
    }

    removeAllLasers(): void {
        if (this.id === ID.RECEPTOR) {
            for (var i = 0; i < this.receptors.length; i++) {
                if (this.receptors[i] !== null) this.receptors[i].laser = null;
            }
        }
        super.removeAllLasers();
    }
}

class Level {
    tiles: Array<Tile>;
    w: number;
    h: number;
    levelNum: number;

    // tiles can be an array of tile objects, or an array of numbers to be converted into tiles
    constructor(levelNum: number, w?: number, h?: number, tiles?: Array<Tile>) {
        this.levelNum = levelNum;

        if (tiles) {
            this.w = w;
            this.h = h;
            this.tiles = tiles.slice();
        } else {
            if (Game.completedLevels[this.levelNum] ||
                this.loadLevelFromMemory() === false) { // check if the player has started this level earlier, if so load that
                this.loadDefaultLevel();
            }
        }

        this.update();
    }

    loadDefaultLevel(): void {
        var lvl = Game.defaultLevels[this.levelNum];
        this.w = (<number>lvl[0]);
        this.h = (<number>lvl[1]);
        this.tiles = Level.anyArrayToTileArray(this.w, this.h, (<Array<any>>lvl[2]));
    }

    clear(): void {
        for (var i = 0; i < this.w * this.h; i++) {
            this.tiles[i] = new BlankTile(i % this.w, Math.floor(i / this.w));
        }

        this.update();
    }

    getTile(x: number, y: number): Tile {
        if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
            return this.tiles[x + y * this.w];
        }
        return null;
    }

    private update(): void {
        // remove all lasers
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].removeAllLasers();
        }

        // update all pointer tiles
        for (i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].id === ID.POINTER) this.tiles[i].update(this);
        }

        // update all non-pointer tiles
        for (i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].id !== ID.POINTER) this.tiles[i].update(this);
        }

        // OPTIMIZATION: only render stuff when updates are made

        this.checkCompleted();
    }

    // OPTIMIZATION: pass in context through entire rendering chain?
    render(): void {
        var context: CanvasRenderingContext2D = (<HTMLCanvasElement> get('gamecanvas')).getContext('2d');
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
    }

    click(event: MouseEvent, down: boolean): void {
        var x = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).x / Tile.size);
        var y = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).y / Tile.size);
        this.tiles[y * this.w + x].click(event, down);
        // check if the user is editing a level
        if (GameState.levelEditMode && event.ctrlKey === false) {
            if (clickType(event) === "left") this.tiles[y * this.w + x] = Level.getNewDefaultTile(Game.selectedTileID, x, y);
            else if (clickType(event) === "right") this.tiles[y * this.w + x] = Level.getNewDefaultTile(ID.BLANK, x, y);
        }

        this.update();
    }

    /* Checks if all of this level's receptors have been activated and sets Game.completedLevels[levelNum] = true if so */
    checkCompleted(): void {
        var on = true;
        for (var i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].id === ID.RECEPTOR) {
                if ((<ReceptorTile>this.tiles[i]).allReceptorsOn() == false) {
                    on = false;
                    break;
                }
            }
        }
        if (on) {
            // As soon as this level is completed once, this gets set to true until the player manually resets all their data
            Game.completedLevels[this.levelNum] = true;
        }

        if (on && Game.popupUp === false) { // only show the popup when the player actually completed the level this tick, not if completedLevels[i] is true
            var str = '<div id="popupContent">' +
                '<h3>Level complete!</h3> <p>Good job!</p>' +
                '<div class="popupButton button" id="returnButton" onclick="if (clickType(event)===\'left\') { Game.sm.enterPreviousState(); Game.clearPopup(); }">Return</div>' +
                '<div class="popupButton button" id="nextButton" onclick="if (clickType(event)===\'left\') { Game.sm.enterPreviousState(); Game.clearPopup(); if (' + (this.levelNum + 1) + ' < Game.defaultLevels.length) { Game.sm.enterState(\'game\', ' + (this.levelNum + 1) + '); } }">Next Level!</div>' +
                '</div>';
            Game.setPopup(str);
        } else {
            Game.clearPopup();
        }
    }

    hover(event: MouseEvent, into: boolean): void {
        var x = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).x / Tile.size);
        var y = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).y / Tile.size);
        this.tiles[y * this.w + x].hover(into);
    }

    /*

     __DATA__
     [0] :    version number
     [1] :    width, height
     [2..n] : non-blank tile data (type, pos, dir, [on], [col], [receptors])

     */

    /* Attempts to load a level from the user's local storage
     Returns a true if there was data found for levelNum, otherwise null */
    loadLevelFromMemory(): boolean {
        var data, storage, tiles: Tile[], i: number, w: number, h: number;
        if (typeof (Storage) === "undefined") {
            alert("Failed to load data. You must update your browser if you want to play this game.");
            return false;
        }

        storage = window.localStorage.getItem(Game.saveLocation + ' lvl: ' + this.levelNum);
        if (storage !== null) data = decodeURI(storage).split('|').filter(function(n) {
            return n !== '';
        });
        if (data === undefined) {
            return false; // there is no previous save of this level
        }

        // LATER check version number HERE if a new feature is implemented that doesn't work with older saves
        // version = parseInt(data[0]);

        w = parseInt(data[1].split(',')[0]);
        h = parseInt(data[1].split(',')[1]);
        tiles = new Array<Tile>(w * h);

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
    }

    static resetAll(): void {
        for (var i = 0; i < Game.defaultLevels.length; i++) {
            Level.removeFromMemory(i);
        }
        LevelSelectState.updateButtonBgs();
    }

    reset(): void {
        Level.removeFromMemory(this.levelNum);
        this.loadDefaultLevel();
        this.update();
        // Game.completedLevels[this.levelNum] = false; // I think level completion should only be reset upon clicking the resetAll buton in the options screen
        // LevelSelectState.updateButtonBgs();
    }

    static removeFromMemory(levelNum: number): void {
        if (typeof (Storage) === "undefined") {
            return; // LATER USE COOKIES HERE INSTEAD ALSO?
        }
        if (window.localStorage.getItem(Game.saveLocation + ' lvl: ' + levelNum) !== null) {
          window.localStorage.removeItem(Game.saveLocation + ' lvl: ' + levelNum);
            Game.completedLevels[levelNum] = false;
        }
    }

    saveToMemory(): void {
        var str = '', i, j, tile, receptors;
        if (typeof (Storage) === "undefined") {
            console.error("Failed to save data. Please update your browser.");
            return; // LATER USE COOKIES HERE INSTEAD?
        }

        str += Game.version + '|';

        // store game board
        str += this.w + ',' + this.h + '|';
        for (i = 0; i < this.tiles.length; i++) {
            tile = this.tiles[i];
            switch (tile.id) {
                case ID.BLANK:
                    break; // Don't store blank tiles, any tile position that isn't saved is assumed to be blank
                case ID.MIRROR:
                    str += 'M,' + i + ',' + tile.dir + '|';
                    break;
                case ID.POINTER:
                    str += 'P,' + i + ',' + tile.dir + ',' + getBoolShorthand(tile.on) + ',' + tile.colour + '|';
                    break;
                case ID.RECEPTOR:
                    receptors = 'XXXX';
                    for (j = 0; j < 4; j++) {
                        if (tile.receptors[j] !== null) receptors = receptors.substring(0, j) + getColourShorthand(tile.receptors[j].colour) + receptors.substring(j + 1);
                    }
                    str += 'R,' + i + ',' + tile.dir + ',' + receptors + '|';
                    break;
            }
        }
        window.localStorage.setItem(Game.saveLocation + ' lvl: ' + this.levelNum, encodeURI(str)); // LATER add more encryption to prevent cheating!
    }

    /* Only used to generate the default levels, so I can make a level with the built-in editor, and export it with a click */
    getLevelString(): string {
        var i, j, tile, receptors, lvl = new Array<any>(3);

        lvl[0] = this.w;
        lvl[1] = this.h;
        lvl[2] = new Array<any>(this.w * this.h);
        for (i = 0; i < this.tiles.length; i++) {
            tile = this.tiles[i];
            switch (tile.id) {
                case ID.BLANK:
                    lvl[2][i] = ID.BLANK;
                    break;
                case ID.MIRROR:
                    if (tile.dir === DIRECTION.NORTH) lvl[2][i] = ID.MIRROR;
                    else lvl[2][i] = [ID.MIRROR, tile.dir];
                    break;
                case ID.POINTER:
                    if (tile.dir === DIRECTION.NORTH && tile.on === false && tile.colour === COLOUR.RED) lvl[2][i] = ID.POINTER;
                    else lvl[2][i] = [ID.POINTER, tile.dir, getBoolShorthand(tile.on), tile.colour];
                    break;
                case ID.RECEPTOR:
                    receptors = "XXXX";
                    for (j = 0; j < 4; j++) {
                        if (tile.receptors[j] !== null) receptors = receptors.substring(0, j) + getColourShorthand(tile.receptors[j].colour) + receptors.substring(j + 1);
                    }
                    lvl[2][i] = [ID.RECEPTOR, tile.dir, "'" + receptors + "'"];
                    break;
            }
        }
        var str = "[" + lvl[0] + ", " + lvl[1] + ", [";

        for (i = 0; i < lvl[2].length; i++) {
            if (typeof lvl[2][i] === "number") str += lvl[2][i] + ", ";
            else str += "[" + lvl[2][i] + "], ";
        }

        str = str.substr(0, str.length - 2); // remove last comma
        str += "]]";
        return str;
    }

    static anyArrayToTileArray(w: number, h: number, arr: Array<any>): Array<Tile> {
        var tiles = new Array<Tile>(arr.length);
        for (var i = 0; i < w * h; i++) {

            tiles[i] = Level.getNewDefaultTile(arr[i], i % w, Math.floor(i / w));

            if (tiles[i] === null) { // its a more complex type (it contains a sub-array)
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
    }

    static getNewDefaultTile(id: number, x: number, y: number): Tile {
        switch (id) {
            case ID.BLANK:
                return new BlankTile(x, y);
            case ID.MIRROR:
                return new MirrorTile(x, y, DIRECTION.NORTH);
            case ID.POINTER:
                return new PointerTile(x, y, DIRECTION.NORTH, false, COLOUR.RED);
            case ID.RECEPTOR:
                return new ReceptorTile(x, y, DIRECTION.NORTH, "RXBX");
        }
        return null;
    }

    copy(): Level {
        return new Level(this.levelNum, this.w, this.h, this.tiles);
    }

}

class Colour {
    static PURPLE = '#3B154B';
    static GREEN = '#004500';
    static GRAY = '#0A0A0A';
    static DARK_GRAY = '#121212';
    static LIGHT_GRAY = '#555'

    static nextColor(colour: number, useWhite: boolean) {
        switch (colour) {
            case COLOUR.RED:
                return COLOUR.GREEN;
            case COLOUR.GREEN:
                return COLOUR.BLUE;
            case COLOUR.BLUE:
                if (useWhite) return COLOUR.WHITE;
                return COLOUR.RED;
            case COLOUR.WHITE:
                return COLOUR.RED;
        }
        return COLOUR.RED;
    }
}

function getBoolShorthand(bool): number {
    return bool === true || bool === 1 || bool === "1" ? 1 : 0;
}

function getColourShorthand(colour: number): string {
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

function getColourLonghand(colour: string): number {
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

function decimalToHex(decimal: number): string {
    var n = Number(decimal).toString(16).toUpperCase();
    while (n.length < 2) {
        n = "0" + n;
    }
    return n;
}

function hexToDecimal(hex): string {
    var n = String(parseInt(hex, 16));
    while (n.length < 2) {
        n = "0" + n;
    }
    return n;
}

function parseBool(value): boolean {
    return value === "1" || value === 1 || value === true;
}

function assert(condition, message: string): void {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

function selectionTileClick(event: MouseEvent, down: boolean, id: number): void {
    if (clickType(event) !== 'left') return;
    if (id === 888) { // save button
        prompt("This is the level code: copy and paste it somewhere you'll remember", (<GameState> Game.sm.currentState()).level.getLevelString());
    } else if (id === 887) { // clear button
        (<GameState>Game.sm.currentState()).level.clear();
    } else if (id === 886) {
        var msg = "Hello curious player! You are currently in Mirror's level editor. Here you can create your own levels! The print button will export the save as a string." +
            " Level loading has not yet been implemented, but it might be soon. \n\nTip: hold crtl to edit tiles while still in lvl edit mode";
        alert(msg);
    } else if (down) {
        Game.selectedTileID = id;
    }
}

function toggleLevelEditMode(): void {
    setLevelEditMode(!GameState.levelEditMode);
}

function setLevelEditMode(levelEditMode: boolean): void {
    GameState.levelEditMode = levelEditMode;
    if (GameState.levelEditMode) {
        setDebug(true);
        get('lvlEditInfo').style.backgroundColor = Colour.GREEN;

        if (Game.sm.currentState().id === STATE.GAME) {
            get('lvledittilesarea').style.display = "block";
        }
    } else {
        get('lvlEditInfo').style.backgroundColor = "initial";
        get('lvledittilesarea').style.display = "none";
    }
}

function toggleDebug(): void {
    setDebug(!Game.debug);
}

function setDebug(debug: boolean): void {
    Game.debug = debug;
    if (Game.debug === false) setLevelEditMode(false);
    if (Game.debug) Game.stats.domElement.style.display = "block";
    else Game.stats.domElement.style.display = "none";

    if (Game.debug) {
        get('infoarea').style.display = "block";
        get('debugInfo').style.backgroundColor = Colour.GREEN;
    } else {
        get('infoarea').style.display = "none";
        get('debugInfo').style.backgroundColor = "initial";
    }
}

class Direction {

    static clockwise(dir: number): number {
        dir += 1;
        if (dir > 3) {
            dir = 0;
        }
        return dir;
    }

    static anticlockwise(dir: number): number {
        dir -= 1;
        if (dir < 0) {
            dir = 3;
        }
        return dir;
    }

    static add(dir1: number, dir2: number): number {
        return (dir1 + dir2) % 4;
    }

    static sub(dir1: number, dir2: number): number {
        var result = dir1 - dir2;
        if (result < 0) {
            dir1 = (4 + result) % 4;
        } else {
            dir1 = result;
        }
        return dir1;
    }

    static opposite(dir: number): number {
        if (dir === DIRECTION.NORTH) {
            return DIRECTION.SOUTH;
        } else if (dir === DIRECTION.EAST) {
            return DIRECTION.WEST;
        } else if (dir === DIRECTION.SOUTH) {
            return DIRECTION.NORTH;
        } else if (dir === DIRECTION.WEST) {
            return DIRECTION.EAST;
        } else {
            console.error("Invalid direction!! " + dir);
        }
        return 0;
    }

}

function keyPressed(event: KeyboardEvent, down: boolean): void {
    if (Game.keysdown) {
        var keycode = event.keyCode ? event.keyCode : event.which;
        Game.keysdown[keycode] = down;

        if (Game.keysdown[Game.KEYBOARD.ONE]) Game.selectedTileID = 0;
        if (Game.keysdown[Game.KEYBOARD.TWO]) Game.selectedTileID = 1;
        if (Game.keysdown[Game.KEYBOARD.THREE]) Game.selectedTileID = 2;
        if (Game.keysdown[Game.KEYBOARD.FOUR]) Game.selectedTileID = 3;
    }
}

window.onkeydown = function(event: KeyboardEvent): void {
    keyPressed(event, true);
};
window.onkeyup = function(event: KeyboardEvent): void {
    keyPressed(event, false);
};

function boardClick(event: MouseEvent, down: boolean): void {
    if (Game.sm.currentState().id === STATE.GAME) Game.sm.currentState().click(event, down);
}

function clickType(event): string {
    if (event.which === 3 || event.button === 2) return "right";
    else if (event.which === 1 || event.button === 0) return "left";
    else if (event.which === 2 || event.button === 1) return "middle";
}

/** The following two functions were taken from Acko.net */
function getRelativeCoordinates(event, reference) {
    var x, y, e, el, pos, offset;
    event = event || window.event;
    el = event.target || event.srcElement;

    //if (!window.opera && typeof event.offsetX != 'undefined') {
    //    // Use offset coordinates and find common offsetParent
    //    pos = {x: event.offsetX, y: event.offsetY};
    //
    //    // Send the coordinates upwards through the offsetParent chain.
    //    e = el;
    //    while (e) {
    //        e.mouseX = pos.x;
    //        e.mouseY = pos.y;
    //        pos.x += e.offsetLeft;
    //        pos.y += e.offsetTop;
    //        e = e.offsetParent;
    //    }
    //
    //    // Look for the coordinates starting from the reference element.
    //    e = reference;
    //    offset = {x: 0, y: 0};
    //    while (e) {
    //        if (typeof e.mouseX != 'undefined') {
    //            x = e.mouseX - offset.x;
    //            y = e.mouseY - offset.y;
    //            break;
    //        }
    //        offset.x += e.offsetLeft;
    //        offset.y += e.offsetTop;
    //        e = e.offsetParent;
    //    }
    //
    //    // Reset stored coordinates
    //    e = el;
    //    while (e) {
    //        e.mouseX = undefined;
    //        e.mouseY = undefined;
    //        e = e.offsetParent;
    //    }
    //} else {
    // Use absolute coordinates
    pos = getAbsolutePosition(reference);
    x = event.pageX - pos.x;
    y = event.pageY - pos.y;
    //}
    // Subtract distance to middle
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

window.onload = function() {
    Game.init();
    Game.loop();
};

// This is actually just really annoying and useless, since we're saving on click anyway
// window.onbeforeunload = function(event: BeforeUnloadEvent) {
//     if (Game.debug === false) {
//         if (typeof event == 'undefined') event = window.event;
//         if (event) event.returnValue = 'Are you sure you want to close Mirrors?';
//     }
// };
