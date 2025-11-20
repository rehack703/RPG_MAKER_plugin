//=============================================================================
// RPG Maker MZ - Simple Timer
//=============================================================================

/*:
 * @target MZ
 * @plugindesc A simple timer that causes a game over when it runs out.
 * @author Gemini
 *
 * @param initialTime
 * @text Initial Time (seconds)
 * @desc The starting time in seconds.
 * @type number
 * @default 300
 *
 * @param timerX
 * @text Timer X Position
 * @desc The X coordinate for the timer display.
 * @type number
 * @default 600
 *
 * @param timerY
 * @text Timer Y Position
 * @desc The Y coordinate for the timer display.
 * @type number
 * @default 10
 *
 * @command decreaseTime
 * @text Decrease Time
 * @desc Decreases the timer by a specified amount.
 *
 * @arg seconds
 * @text Seconds
 * @desc The number of seconds to decrease the timer by.
 * @type number
 * @default 10
 *
 * @command increaseTime
 * @text Increase Time
 * @desc Increases the timer by a specified amount.
 *
 * @arg seconds
 * @text Seconds
 * @desc The number of seconds to increase the timer by.
 * @type number
 * @default 10
 *
 * @help SimpleTimer.js
 *
 * This plugin provides a simple countdown timer. When the timer reaches
 * zero, the game is over.
 *
 * Use the plugin command "Decrease Time" in an event to reduce the
 * timer's value. This is useful for when the player performs an action
 * that costs time.
 */

/*:ja
 * @target MZ
 * @plugindesc 時間がなくなるとゲームオーバーになるシンプルなタイマーです。
 * @author Gemini
 *
 * @param initialTime
 * @text 初期時間 (秒)
 * @desc 開始時間（秒）。
 * @type number
 * @default 300
 *
 * @param timerX
 * @text タイマーX座標
 * @desc タイマー表示のX座標。
 * @type number
 * @default 600
 *
 * @param timerY
 * @text タイマーY座標
 * @desc タイマー表示のY座標。
 * @type number
 * @default 10
 *
 * @command decreaseTime
 * @text 時間を減らす
 * @desc タイマーを指定した量だけ減らします。
 *
 * @arg seconds
 * @text 秒
 * @desc タイマーを減らす秒数。
 * @type number
 * @default 10
 *
 * @command increaseTime
 * @text 時間を増やす
 * @desc タイマーを指定した量だけ増やします。
 *
 * @arg seconds
 * @text 秒
 * @desc タイマーを増やす秒数。
 * @type number
 * @default 10
 *
 * @help SimpleTimer.js
 *
 * このプラグインは、シンプルなカウントダウンタイマーを提供します。タイマーが
 * ゼロになるとゲームオーバーになります。
 *
 * イベントでプラグインコマンド「時間を減らす」を使用して、タイマーの値を
 * 減らします。これは、プレイヤーが時間を消費するアクションを実行した
 * ときに便利です。
 */

(() => {
    const pluginName = 'SimpleTimer';
    const parameters = PluginManager.parameters(pluginName);
    const INITIAL_TIME = Number(parameters['initialTime'] || 300);
    const TIMER_X = Number(parameters['timerX'] || 600);
    const TIMER_Y = Number(parameters['timerY'] || 10);

    //=============================================================================
    // Game_Timer
    // Overwriting the default Game_Timer to prevent it from counting down on its own.
    // We will manage the countdown manually.
    //=============================================================================
    const _Game_Timer_initialize = Game_Timer.prototype.initialize;
    Game_Timer.prototype.initialize = function() {
        _Game_Timer_initialize.call(this);
        this._frames = INITIAL_TIME * 60;
        this._working = true;
    };

    // We are intentionally overwriting the update method to stop the default
    // frame-by-frame countdown. Time will only be managed via plugin commands.
    Game_Timer.prototype.update = function(sceneActive) {
        if (this._working && this._frames === 0) {
            this.onExpire();
        }
    };

    Game_Timer.prototype.decrease = function(seconds) {
        this._frames -= seconds * 60;
        if (this._frames < 0) {
            this._frames = 0;
        }
        // Check for expiration immediately after decreasing
        if (this._frames === 0 && this._working) {
            this.onExpire();
        }
    };
    
    Game_Timer.prototype.increase = function(seconds) {
        this._frames += seconds * 60;
    };

    const _Game_Timer_onExpire = Game_Timer.prototype.onExpire;
    Game_Timer.prototype.onExpire = function() {
        _Game_Timer_onExpire.call(this);
        SceneManager.goto(Scene_Gameover);
    };

    //=============================================================================
    // Plugin Commands
    //=============================================================================
    PluginManager.registerCommand(pluginName, 'decreaseTime', args => {
        const seconds = Number(args.seconds || 10);
        $gameTimer.decrease(seconds);
    });
    
    PluginManager.registerCommand(pluginName, 'increaseTime', args => {
        const seconds = Number(args.seconds || 10);
        $gameTimer.increase(seconds);
    });

    //=============================================================================
    // Spriteset_Map
    // Create and display the timer sprite.
    //=============================================================================
    const _Spriteset_Map_createTimer = Spriteset_Map.prototype.createTimer;
    Spriteset_Map.prototype.createTimer = function() {
        _Spriteset_Map_createTimer.call(this);
        this._timerSprite.x = TIMER_X;
        this._timerSprite.y = TIMER_Y;
    };

})();
