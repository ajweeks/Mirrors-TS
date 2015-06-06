// Copyright AJ Weeks 2015
/* jshint browser: true */
/* jshint devel: true */
/* global Stats */
/* global Bugsnag */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
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
    STATE[STATE["LEVEL_SELECT"] = 3] = "LEVEL_SELECT";
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
var LevelSelectState = (function (_super) {
    __extends(LevelSelectState, _super);
    function LevelSelectState(sm) {
        _super.call(this, STATE.LEVEL_SELECT, sm);
        this.height = 8;
        this.numOfLevels = 64;
        this.offset = 150;
        this.maxOffset = -(Math.ceil(this.numOfLevels / this.height) * 250 - window.innerWidth + 150);
        get('levelselectstate').style.display = "block";
        var x, y, str = '', n;
        for (x = 0; x < Math.ceil(this.numOfLevels / this.height); x++) {
            str += '<div class="col">';
            for (y = 0; y < this.height; y++) {
                n = (x * this.height) + y;
                str += '<div class="button lvlselect" id="' + n + 'lvlselectButton" ' +
                    (Game.defaultLevels[n] === undefined ? '' : 'onmousedown="if (clickType(event)===\'left\') Game.sm.enterState(\'game\', ' + n + ');"') +
                    '>' + decimalToHex(n) + '</div>';
            }
            str += '</div>';
        }
        str += '<div id="backarrow" onmouseover="Game.lvlselectButtonDirection=1;" onmouseout="Game.lvlselectButtonDirection = 0;" style="visibility: hidden"><p>&#9664;</p></div>';
        str += '<div id="forwardarrow" onmouseover="Game.lvlselectButtonDirection=-1" onmouseout="Game.lvlselectButtonDirection = 0;"><p>&#9654;</p></div>';
        str += '<div class="button" onmousedown="if (clickType(event)===\'left\') Game.sm.enterPreviousState();" style="margin-left: -90px; margin-top: -490px;">Back</div>';
        get('levelselectstate').style.width = 250 * Math.ceil(this.numOfLevels / this.height) + 'px';
        get('levelselectstate').style.marginLeft = '150px';
        get('levelselectstate').style.marginTop = '80px';
        get('levelselectstate').innerHTML = str;
        LevelSelectState.updateButtonBgs();
    }
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
            get('forwardarrow').style.visibility = "visible";
            get('backarrow').style.visibility = "visible";
        }
        get('levelselectstate').style.marginLeft = this.offset + 'px';
    };
    LevelSelectState.updateButtonBgs = function () {
        var i;
        for (i = 0; i < Game.defaultLevels.length; i++) {
            get(i + 'lvlselectButton').style.cursor = "pointer";
            if (Game.completedLevels[i] === true) {
                get(i + 'lvlselectButton').style.backgroundColor = "#007900";
            }
            else {
                get(i + 'lvlselectButton').style.backgroundColor = "#501967";
            }
        }
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
        GameState.levelEditMode = Game.debug;
        this.levelNum = levelNum;
        this.setLevel();
        get('gameboard').style.display = "block";
        get('gameboard').style.left = "50%";
        get('gameboard').style.marginLeft = -(this.level.w * Game.tileSize) / 2 + "px";
        get('gameboard').style.width = this.level.w * Game.tileSize + "px";
        get('gameboard').style.height = this.level.h * Game.tileSize + "px";
        get('gamecanvas').width = this.level.w * Game.tileSize;
        get('gamecanvas').height = this.level.h * Game.tileSize;
        get('lvledittiles').innerHTML = '<div>' +
            '<div class="selectionTile" id="0tile" onmousedown="selectionTileClick(event, true, 0);" onmouseup="selectionTileClick(event, false, 0);" style="background-image: url(res/blank.png)"></div>' +
            '<div class="selectionTile" id="1tile" onmousedown="selectionTileClick(event, true, 1);" onmouseup="selectionTileClick(event, false, 1);" style="background-image: url(res/mirror.png)"></div>' +
            '<div class="selectionTile" id="2tile" onmousedown="selectionTileClick(event, true, 2);" onmouseup="selectionTileClick(event, false, 2);" style="background-image: url(res/pointer.png)"></div>' +
            '<div class="selectionTile" id="3tile" onmousedown="selectionTileClick(event, true, 3);" onmouseup="selectionTileClick(event, false, 3);" style="background-image: url(res/receptor_white.png)"></div>' +
            '<div class="selectionTile" id="saveButton" onmousedown="selectionTileClick(event, true, 888)">save</div>' +
            '<div class="selectionTile" id="clearButton" onmousedown="selectionTileClick(event, true, 887)">clear</div>' +
            '</div>';
        get('lvledittilescanvas').width = Game.tileSize;
        get('lvledittilescanvas').height = 6 * Game.tileSize;
        if (GameState.levelEditMode) {
            get('lvledittilesarea').style.display = "block";
        }
    }
    GameState.prototype.setLevel = function () {
        this.level = Level.loadLevelFromMemory(this.levelNum);
        if (this.level === null) {
            var lvl = Game.defaultLevels[this.levelNum] || Game.defaultLevels[0];
            this.level = new Level(lvl[0], lvl[1], this.levelNum, lvl[2]);
        }
    };
    GameState.prototype.update = function () {
        this.level.update();
    };
    GameState.prototype.render = function () {
        this.level.render();
        if (GameState.levelEditMode) {
            var context = get('lvledittilescanvas').getContext('2d');
            for (var i = 0; i < 6; i++) {
                if (Game.selectedTile === i)
                    context.fillStyle = "#134304";
                else
                    context.fillStyle = "#121212";
                context.fillRect(0, i * Game.tileSize, Game.tileSize, Game.tileSize);
            }
        }
    };
    GameState.prototype.restore = function () {
        get('gameboard').style.display = "block";
        if (GameState.levelEditMode)
            get('lvledittilesarea').style.display = "block";
    };
    GameState.prototype.destroy = function () {
        get('tiles').innerHTML = "";
        get('gameboard').style.display = "none";
        get('lvledittilesarea').style.display = "none";
    };
    GameState.prototype.click = function (event, down) {
        this.level.click(event, down);
    };
    GameState.prototype.hover = function (event, into) {
        this.level.hover(event, into);
    };
    return GameState;
})(BasicState);
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
    return Colour;
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
            Game.renderImage(context, x, y, Game.images[IMAGE.LASER][this.colour], add(dir, this.entering), Game.tileSize);
        if (this.exiting !== null)
            Game.renderImage(context, x, y, Game.images[IMAGE.LASER][this.colour], add(dir, this.exiting), Game.tileSize);
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
        this.on = (this.laser !== null && Receptor.colourTurnsMeOn(this.laser.colour, this.colour));
        if (this.on === false) {
            this.laser = null;
        }
    };
    Receptor.prototype.render = function (context, x, y, dir) {
        Game.renderImage(context, x, y, Game.images[ID.RECEPTOR][this.colour], dir, Game.tileSize);
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
        Game.renderImage(context, x, y, Game.images[this.id], this.dir, Game.tileSize);
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
    return Tile;
})();
var BlankTile = (function (_super) {
    __extends(BlankTile, _super);
    function BlankTile(x, y) {
        _super.call(this, x, y, ID.BLANK);
    }
    BlankTile.prototype.addLaser = function (laser) {
        laser.exiting = opposite(laser.entering);
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
            this.on = !this.on;
            if (this.on) {
                this.colour = Colour.nextColor(this.colour, false);
                this.addLaser(new Laser(null, this.dir, this.colour));
            }
            else {
                this.removeAllLasers();
            }
        }
    };
    PointerTile.prototype.update = function (board) {
        if (this.on === false)
            return;
        this.addLaser(new Laser(null, this.dir, this.colour));
        var checkedTiles = new Array(board.w * board.h), nextDir = this.dir, nextTile = board.getTile(this.x, this.y), xx, yy;
        for (var i = 0; i < board.w * board.h; i++) {
            checkedTiles[i] = 0;
        }
        do {
            xx = nextTile.x + Game.offset[nextDir][0];
            yy = nextTile.y + Game.offset[nextDir][1];
            if (xx < 0 || xx >= board.w || yy < 0 || yy >= board.h)
                break;
            if (checkedTiles[xx + yy * board.w] >= 2)
                break;
            else
                checkedTiles[xx + yy * board.w]++;
            nextTile = board.getTile(xx, yy);
            if (nextTile === null)
                break;
            if (nextTile.id === ID.POINTER) {
                break;
            }
            nextTile.addLaser(new Laser(opposite(nextDir), null, this.lasers[0].colour));
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
                if (Game.selectedTile === this.id) {
                    var xx = getRelativeCoordinates(event, get('gamecanvas')).x % Game.tileSize, yy = getRelativeCoordinates(event, get('gamecanvas')).y % Game.tileSize, index;
                    if (xx + yy <= Game.tileSize) {
                        if (xx >= yy) {
                            index = sub(DIRECTION.NORTH, this.dir);
                        }
                        else {
                            index = sub(DIRECTION.WEST, this.dir);
                        }
                    }
                    else {
                        if (xx >= yy) {
                            index = sub(DIRECTION.EAST, this.dir);
                        }
                        else {
                            index = sub(DIRECTION.SOUTH, this.dir);
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
            if (this.receptors[sub(this.lasers[i].entering, this.dir)] !== null) {
                this.receptors[sub(this.lasers[i].entering, this.dir)].laser = this.lasers[i];
            }
        }
        for (i = 0; i < this.receptors.length; i++) {
            if (this.receptors[i] !== null)
                this.receptors[i].update();
        }
    };
    ReceptorTile.allReceptorsOn = function (receptors) {
        for (var r in receptors) {
            if (receptors[r] && receptors[r].on == false)
                return false;
        }
        return true;
    };
    ReceptorTile.prototype.render = function (context, x, y) {
        if (ReceptorTile.allReceptorsOn(this.receptors)) {
            context.fillStyle = "#1d4d12";
            context.fillRect(x - Game.tileSize / 2, y - Game.tileSize / 2, Game.tileSize, Game.tileSize);
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
                if (sub(i, this.dir) === laser.entering || sub(i, this.dir) === opposite(laser.entering)) {
                    solid = true;
                }
            }
        }
        if (solid === false)
            laser.exiting = opposite(laser.entering);
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
    function Level(w, h, levelNum, tiles) {
        this.w = w;
        this.h = h;
        this.levelNum = levelNum;
        if (typeof tiles[0] === "number" || Array.isArray(tiles[0])) {
            this.tiles = Level.numberArrayToTileArray(w, h, tiles.slice());
        }
        else {
            this.tiles = tiles.slice();
        }
    }
    Level.numberArrayToTileArray = function (w, h, nums) {
        var tiles = new Array(nums.length);
        for (var i = 0; i < w * h; i++) {
            tiles[i] = Level.getNewDefaultTile(nums[i], i % w, Math.floor(i / w));
            if (tiles[i] === null) {
                switch (nums[i][0]) {
                    case ID.BLANK:
                        console.error("Blank tiles shouldn't be saved using arrays (index: " + i + ")");
                        tiles[i] = new BlankTile(i % w, Math.floor(i / w));
                        break;
                    case ID.MIRROR:
                        tiles[i] = new MirrorTile(i % w, Math.floor(i / w), nums[i][1]);
                        break;
                    case ID.POINTER:
                        tiles[i] = new PointerTile(i % w, Math.floor(i / w), nums[i][1], nums[i][2], nums[i][3]);
                        break;
                    case ID.RECEPTOR:
                        tiles[i] = new ReceptorTile(i % w, Math.floor(i / w), nums[i][1], nums[i][2]);
                        break;
                    default:
                        console.error("Invalid tile property: " + nums[i] + " at index " + i);
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
                return new PointerTile(x, y, DIRECTION.NORTH, false, COLOUR.RED);
            case ID.RECEPTOR:
                return new ReceptorTile(x, y, DIRECTION.NORTH, "RXBX");
        }
        return null;
    };
    Level.prototype.clear = function () {
        for (var i = 0; i < this.w * this.h; i++) {
            this.tiles[i] = new BlankTile(i % this.w, Math.floor(i / this.w));
        }
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
    };
    Level.prototype.getTile = function (x, y) {
        if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
            return this.tiles[x + y * this.w];
        }
        return null;
    };
    Level.prototype.render = function () {
        var context = get('gamecanvas').getContext('2d');
        context.fillStyle = '#0a0a0a';
        context.fillRect(0, 0, this.w * Game.tileSize, this.h * Game.tileSize);
        context.strokeStyle = '#444444';
        for (var i = 0; i < this.w * this.h; i++) {
            if (Game.debug === true)
                context.strokeRect((i % this.w) * Game.tileSize, Math.floor(i / this.w) * Game.tileSize, Game.tileSize, Game.tileSize);
            this.tiles[i].render(context, (i % this.w) * Game.tileSize + Game.tileSize / 2, Math.floor(i / this.w) * Game.tileSize + Game.tileSize / 2);
        }
    };
    Level.prototype.click = function (event, down) {
        var x = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).x / Game.tileSize);
        var y = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).y / Game.tileSize);
        this.tiles[y * this.w + x].click(event, down);
        if (GameState.levelEditMode && clickType(event) === "left") {
            this.tiles[y * this.w + x] = Level.getNewDefaultTile(Game.selectedTile, x, y);
        }
    };
    Level.prototype.hover = function (event, into) {
        var x = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).x / Game.tileSize);
        var y = Math.floor(getRelativeCoordinates(event, get('gamecanvas')).y / Game.tileSize);
        this.tiles[y * this.w + x].hover(into);
    };
    Level.loadLevelFromMemory = function (levelNum) {
        var data, storage, tiles, i, w, h;
        if (typeof (Storage) === "undefined") {
            alert("Failed to load data. You must update your browser if you want to play this game.");
            return null;
        }
        storage = window.localStorage.getItem(Game.saveLocation + ' lvl: ' + levelNum);
        if (storage !== null)
            data = decodeURI(storage).split('|').filter(function (n) {
                return n !== '';
            });
        if (data === undefined) {
            return null;
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
        return new Level(w, h, levelNum, tiles);
    };
    Level.prototype.saveLevelString = function () {
        var str = '', i, j, tile, receptors;
        if (typeof (Storage) === "undefined") {
            console.error("Failed to save data. Please update your browser.");
            return;
        }
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
    Level.prototype.saveLevelArray = function () {
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
                    if (tile.dir === DIRECTION.NORTH && tile.on === false && tile.colour === COLOUR.RED)
                        lvl[2][i] = ID.POINTER;
                    else
                        lvl[2][i] = [ID.POINTER, tile.dir, getBoolShorthand(tile.on), tile.colour];
                    break;
                case ID.RECEPTOR:
                    receptors = 'XXXX';
                    for (j = 0; j < 4; j++) {
                        if (tile.receptors[j] !== null)
                            receptors = receptors.substring(0, j) + getColourShorthand(tile.receptors[j].colour) + receptors.substring(j + 1);
                    }
                    lvl[2][i] = [ID.RECEPTOR, tile.dir, receptors];
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
    Level.prototype.copy = function () {
        return new Level(this.w, this.h, this.levelNum, this.tiles);
    };
    return Level;
})();
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
                break;
            case "about":
                return new AboutState(this);
                break;
            case "levelselect":
                return new LevelSelectState(this);
                break;
            case "game":
                return new GameState(this, levelNum);
                break;
        }
        return null;
    };
    StateManager.prototype.enterPreviousState = function () {
        if (this.states.length > 1) {
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
var Game = (function () {
    function Game() {
    }
    Game.init = function () {
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
        Game.stats = Stats();
        Game.stats.setMode(0);
        Game.stats.domElement.style.position = 'absolute';
        Game.stats.domElement.style.left = '0px';
        Game.stats.domElement.style.top = '0px';
        document.body.appendChild(Game.stats.domElement);
        Game.sm = new StateManager();
        Game.completedLevels = new Array(Game.defaultLevels.length);
        Game.defaultPrefs();
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
    Game.defaultPrefs = function () {
        setDebug(Game.releaseStage === Game.releaseStages.DEVELOPMENT);
        setLevelEditMode(false);
        Game.preferences.warn = !Game.debug;
    };
    Game.update = function () {
        Game.ticks += 1;
        if (Game.keysdown[Game.KEYBOARD.ESC]) {
            this.sm.enterPreviousState();
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
    Game.version = 0.041;
    Game.releaseStages = { DEVELOPMENT: "development", PRODUCTION: "production" };
    Game.releaseStage = Game.releaseStages.DEVELOPMENT;
    Game.images = [];
    Game.debug = true;
    Game.preferences = { 'warn': Game.debug };
    Game.tileSize = 64;
    Game.selectedTile = ID.BLANK;
    Game.saveLocation = "Mirrors";
    Game.defaultLevels = [
        [10, 8,
            [1, [1, 1], 0, 1, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 1]],
        [10, 8,
            [[2, 3, 1, 2], 0, 0, 0, 0, 0, 0, 0, 0, 2,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    ];
    Game.keysdown = [];
    Game.offset = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    Game.ticks = 0;
    Game.fps = 60;
    Game.lvlselectButtonSpeed = 6;
    Game.lvlselectButtonDirection = 0;
    Game.KEYBOARD = {
        BACKSPACE: 8,
        TAB: 9,
        RETURN: 13,
        ESC: 27,
        SPACE: 32,
        PAGEUP: 33,
        PAGEDOWN: 34,
        END: 35,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        INSERT: 45,
        DELETE: 46,
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        TILDE: 192,
        SHIFT: 999
    };
    return Game;
})();
function getBoolShorthand(bool) {
    return bool === true ? 1 : 0;
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
    return value === "1" || value.toLowerCase() === "true";
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
        Game.sm.currentState().level.saveLevelString();
        console.log(Game.sm.currentState().level.saveLevelArray());
    }
    else if (id === 887) {
        Game.sm.currentState().level.clear();
    }
    else if (down) {
        Game.selectedTile = id;
    }
}
function toggleLevelEditMode() {
    setLevelEditMode(!GameState.levelEditMode);
}
function setLevelEditMode(levelEditMode) {
    GameState.levelEditMode = levelEditMode;
    if (GameState.levelEditMode) {
        setDebug(true);
        get('lvlEditInfo').style.backgroundColor = "#134304";
        if (Game.sm.currentState().id === STATE.GAME) {
            get('lvledittilesarea').style.display = "block";
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
        Game.stats.domElement.style.display = "block";
    else
        Game.stats.domElement.style.display = "none";
    if (Game.debug) {
        get('infoarea').style.display = "block";
        get('debugInfo').style.backgroundColor = "#134304";
    }
    else {
        get('infoarea').style.display = "none";
        get('debugInfo').style.backgroundColor = "initial";
    }
}
function clockwise(dir) {
    dir += 1;
    if (dir > 3) {
        dir = 0;
    }
    return dir;
}
function anticlockwise(dir) {
    dir -= 1;
    if (dir < 0) {
        dir = 3;
    }
    return dir;
}
function add(dir1, dir2) {
    return (dir1 + dir2) % 4;
}
function sub(dir1, dir2) {
    var result = dir1 - dir2;
    if (result < 0) {
        dir1 = (4 + result) % 4;
    }
    else {
        dir1 = result;
    }
    return dir1;
}
function opposite(dir) {
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
}
function keyPressed(event, down) {
    if (Game.keysdown) {
        var keycode = event.keyCode ? event.keyCode : event.which;
        Game.keysdown[keycode] = down;
        if (Game.keysdown[Game.KEYBOARD.ONE])
            Game.selectedTile = 0;
        if (Game.keysdown[Game.KEYBOARD.TWO])
            Game.selectedTile = 1;
        if (Game.keysdown[Game.KEYBOARD.THREE])
            Game.selectedTile = 2;
        if (Game.keysdown[Game.KEYBOARD.FOUR])
            Game.selectedTile = 3;
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
window.onbeforeunload = function (event) {
    if (Game.debug === false) {
        if (typeof event == 'undefined')
            event = window.event;
        if (event)
            event.returnValue = 'Are you sure you want to close Mirrors?';
    }
};
window.onload = function () {
    Game.init();
    Game.loop();
};