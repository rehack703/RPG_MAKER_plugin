//=============================================================================
// RPG Maker MZ - Time System (Upgraded)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 게임 내 시간 시스템 - 시계 표시, 상호작용 시간 경과, 낮/밤 전환
 * @author YourName
 * @version 1.1.0
 *
 * @param initialHour
 * @text 시작 시각 (시)
 * @desc 게임 시작 시각 (0-23)
 * @type number
 * @min 0
 * @max 23
 * @default 7
 *
 * @param initialMinute
 * @text 시작 시각 (분)
 * @desc 게임 시작 분 (0-59)
 * @type number
 * @min 0
 * @max 59
 * @default 0
 *
 * @param clockX
 * @text 시계 X 위치
 * @desc 화면 왼쪽 기준 오프셋
 * @type number
 * @default 10
 *
 * @param clockY
 * @text 시계 Y 위치
 * @desc 화면 상단 기준 오프셋
 * @type number
 * @default 10
 *
 * @param clockWidth
 * @text 시계 너비
 * @type number
 * @default 200
 *
 * @param clockHeight
 * @text 시계 높이
 * @type number
 * @default 50
 *
 * @param talkTime
 * @text [기본] 대화 소요 시간 (분)
 * @desc NPC와 대화 시 기본 경과 시간
 * @type number
 * @default 10
 *
 * @param doorTime
 * @text [기본] 문 사용 소요 시간 (분)
 * @desc 문을 열거나 닫을 때 기본 경과 시간
 * @type number
 * @default 1
 *
 * @param searchTime
 * @text [기본] 조사 소요 시간 (분)
 * @desc 사물을 조사할 때 기본 경과 시간
 * @type number
 * @default 5
 *
 * @param switchTime
 * @text [기본] 스위치 조작 소요 시간 (분)
 * @desc 스위치/레버를 조작할 때 기본 경과 시간
 * @type number
 * @default 2
 *
 * @param chestTime
 * @text [기본] 보물상자 소요 시간 (분)
 * @desc 보물상자를 열 때 기본 경과 시간
 * @type number
 * @default 3
 *
 * @param readTime
 * @text [기본] 읽기 소요 시간 (분)
 * @desc 책이나 간판을 읽을 때 기본 경과 시간
 * @type number
 * @default 10
 *
 * @param enableDayNight
 * @text 낮/밤 효과 활성화
 * @desc 시간에 따라 화면 색조 변경
 * @type boolean
 * @default true
 *
 * @param transitionSpeed
 * @text 색조 전환 속도
 * @desc 낮/밤 전환 속도 (프레임)
 * @type number
 * @default 60
 *
 * @param autoTimeFlow
 * @text 자동 시간 경과
 * @desc 아무것도 안 해도 시간이 자동으로 흐릅니다
 * @type boolean
 * @default true
 *
 * @param timeFlowSpeed
 * @text 시간 경과 속도 (초)
 * @desc 실시간 몇 초마다 게임 내 1분 경과 (기본: 2초 = 1분)
 * @type number
 * @min 1
 * @max 60
 * @default 2
 *
 * @command addTime
 * @text 시간 추가
 * @desc 지정한 시간만큼 경과시킵니다
 *
 * @arg minutes
 * @text 분
 * @desc 경과시킬 시간 (분)
 * @type number
 * @default 10
 *
 * @command setTime
 * @text 시각 설정
 * @desc 특정 시각으로 설정합니다
 *
 * @arg hour
 * @text 시
 * @type number
 * @min 0
 * @max 23
 * @default 12
 *
 * @arg minute
 * @text 분
 * @type number
 * @min 0
 * @max 59
 * @default 0
 *
 * @command showClock
 * @text 시계 표시
 * @desc 시계를 화면에 표시합니다
 *
 * @command hideClock
 * @text 시계 숨기기
 * @desc 시계를 화면에서 숨깁니다
 *
 * @command enableAutoTime
 * @text 자동 시간 경과 활성화
 * @desc 자동으로 시간이 흐르도록 설정합니다
 *
 * @command disableAutoTime
 * @text 자동 시간 경과 비활성화
 * @desc 자동 시간 경과를 중지합니다
 *
 * @command stayAtInn
 * @text 여관 숙박
 * @desc 여관에서 숙박합니다. 다음날 오전 7시로 시간이 설정되고 파티를 회복합니다.
 *
 * @arg skipFade
 * @text 페이드 효과 생략
 * @desc true로 설정하면 화면 페이드 효과를 생략합니다
 * @type boolean
 * @default false
 *
 * @help TimeSystem.js (v1.1.0)
 *
 * =============================================================================
 * 게임 내 시간 시스템
 * ============================================================================
 *
 * 이 플러그인은 게임 내에서 시간이 흐르는 시스템을 제공합니다.
 *
 * == 시간 경과 노트 태그 사용법 ==
 *
 * 이벤트의 노트(Note) 란에 아래 태그를 추가하여,
 * 해당 이벤트를 실행할 때 자동으로 시간이 흐르게 할 수 있습니다.
 *
 * 태그를 추가하지 않으면 플러그인 설정의 기본값이 적용됩니다.
 * 시간을 흐르지 않게 하려면 0을 입력하세요. (예: <timeTalk:0>)
 *
 *   <timeTalk> 또는 <timeTalk:20>
 *   - 설명: 대화 시 시간 경과 (기본값 또는 20분)
 *   - 적용 시점: '문장 표시(Show Text)' 커맨드 실행 시
 *
 *   <timeSearch> 또는 <timeSearch:10>
 *   - 설명: 조사 시 시간 경과 (기본값 또는 10분)
 *   - 적용 시점: '문장 표시(Show Text)' 커맨드 실행 시
 *
 *   <timeRead> 또는 <timeRead:15>
 *   - 설명: 책/간판 읽을 시 시간 경과 (기본값 또는 15분)
 *   - 적용 시점: '문장 표시(Show Text)' 커맨드 실행 시
 *
 *   <timeDoor> 또는 <timeDoor:5>
 *   - 설명: 문 사용 시 시간 경과 (기본값 또는 5분)
 *   - 적용 시점: '장소 이동(Transfer Player)' 커맨드 실행 시
 *
 *   <timeSwitch> 또는 <timeSwitch:3>
 *   - 설명: 스위치 조작 시 시간 경과 (기본값 또는 3분)
 *   - 적용 시점: '스위치 조작(Control Switches)' 커맨드 실행 시
 *
 *   <timeChest> 또는 <timeChest:5>
 *   - 설명: 보물상자 열 때 시간 경과 (기본값 또는 5분)
 *   - 적용 시점: '아이템 증감(Change Items)' 커맨드 실행 시
 *
 * == 여관 기능 사용법 ==
 *
 * 1. 여관 주인 NPC 이벤트를 만듭니다.
 * 2. 대화 선택지에서 "숙박한다"를 선택했을 때,
 *    플러그인 커맨드 'stayAtInn'을 실행하도록 설정합니다.
 *
 * == 시간대별 색조 (v1.1.0) ==
 *
 * 새벽 (4-6시)
 * 아침 (6-9시)
 * 정오 (12-14시)
 * 오후 (14-17시)
 * 저녁 (17-19시)
 * 밤 (19-4시)
 *
 */

(() => {
    'use strict';

    const pluginName = 'TimeSystem';
    const parameters = PluginManager.parameters(pluginName);

    // 파라미터 읽기
    const INITIAL_HOUR = Number(parameters['initialHour'] || 7);
    const INITIAL_MINUTE = Number(parameters['initialMinute'] || 0);
    const CLOCK_X = Number(parameters['clockX'] || 10);
    const CLOCK_Y = Number(parameters['clockY'] || 10);
    const CLOCK_WIDTH = Number(parameters['clockWidth'] || 200);
    const CLOCK_HEIGHT = Number(parameters['clockHeight'] || 50);
    const TALK_TIME = Number(parameters['talkTime'] || 10);
    const DOOR_TIME = Number(parameters['doorTime'] || 1);
    const SEARCH_TIME = Number(parameters['searchTime'] || 5);
    const SWITCH_TIME = Number(parameters['switchTime'] || 2);
    const CHEST_TIME = Number(parameters['chestTime'] || 3);
    const READ_TIME = Number(parameters['readTime'] || 10);
    const ENABLE_DAY_NIGHT = parameters['enableDayNight'] === 'true';
    const TRANSITION_SPEED = Number(parameters['transitionSpeed'] || 60);
    const AUTO_TIME_FLOW = parameters['autoTimeFlow'] !== 'false';
    const TIME_FLOW_SPEED = Number(parameters['timeFlowSpeed'] || 2);

    //===========================================================================
    // Game_Time
    // 시간 관리 클래스
    //===========================================================================

    class Game_Time {
        constructor() {
            this.initialize();
        }

        initialize() {
            this._hour = INITIAL_HOUR;
            this._minute = INITIAL_MINUTE;
            this._day = 1;
            this._clockVisible = true;
            this._autoTimeEnabled = AUTO_TIME_FLOW;
            this._timeCounter = 0; // 프레임 카운터
        }

        addMinutes(minutes) {
            if (minutes <= 0) return;
            this._minute += minutes;
            while (this._minute >= 60) {
                this._minute -= 60;
                this._hour++;
            }
            while (this._hour >= 24) {
                this._hour -= 24;
                this._day++;
            }
            this.updateDayNightTone();
        }

        setTime(hour, minute) {
            this._hour = hour % 24;
            this._minute = minute % 60;
            this.updateDayNightTone();
        }

        getHour() {
            return this._hour;
        }

        getMinute() {
            return this._minute;
        }

        getDay() {
            return this._day;
        }

        getTimeString() {
            const h = String(this._hour).padStart(2, '0');
            const m = String(this._minute).padStart(2, '0');
            return h + ':' + m;
        }

        getTimeOfDay() {
            const h = this._hour;
            if (h >= 4 && h < 6) return 'dawn';
            if (h >= 6 && h < 9) return 'morning';
            if (h >= 9 && h < 12) return 'day';
            if (h >= 12 && h < 14) return 'noon';
            if (h >= 14 && h < 17) return 'afternoon';
            if (h >= 17 && h < 19) return 'evening';
            return 'night';
        }

        updateDayNightTone() {
            if (!ENABLE_DAY_NIGHT || !$gameMap) return;

            const timeOfDay = this.getTimeOfDay();
            let tone;

            switch (timeOfDay) {
                case 'dawn':
                    tone = [-34, -17, 34, 68]; break;
                case 'morning':
                    tone = [17, 0, -17, 0]; break;
                case 'day':
                    tone = [0, 0, 0, 0]; break;
                case 'noon':
                    tone = [17, 17, 0, 0]; break; // 정오: 약간 밝고 노란 톤
                case 'afternoon':
                    tone = [0, 0, 0, 0]; break; // 오후: 기본 톤
                case 'evening':
                    tone = [68, -17, -34, 0]; break;
                case 'night':
                    tone = [-68, -68, 0, 68]; break;
                default:
                    tone = [0, 0, 0, 0]; break;
            }
            $gameScreen.startTint(tone, TRANSITION_SPEED);
        }

        showClock() { this._clockVisible = true; }
        hideClock() { this._clockVisible = false; }
        isClockVisible() { return this._clockVisible; }
        enableAutoTime() { this._autoTimeEnabled = true; }
        disableAutoTime() { this._autoTimeEnabled = false; }
        isAutoTimeEnabled() { return this._autoTimeEnabled; }

        update() {
            if (!this.isAutoTimeEnabled()) return;
            const framesPerMinute = 60 * TIME_FLOW_SPEED;
            this._timeCounter++;
            if (this._timeCounter >= framesPerMinute) {
                this._timeCounter = 0;
                this.addMinutes(1);
            }
        }
    }

    window.Game_Time = Game_Time;
    window.$gameTime = null;

    //===========================================================================
    // DataManager
    //===========================================================================

    const _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        $gameTime = new Game_Time();
    };

    const _DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        const contents = _DataManager_makeSaveContents.call(this);
        contents.gameTime = $gameTime;
        return contents;
    };

    const _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _DataManager_extractSaveContents.call(this, contents);
        $gameTime = contents.gameTime;
        // 이전 버전과의 호환성을 위해
        if (!$gameTime.updateDayNightTone) {
            Object.assign($gameTime, Game_Time.prototype);
        }
    };

    //===========================================================================
    // Window_Clock
    //===========================================================================

    class Window_Clock extends Window_Base {
        initialize() {
            const rect = new Rectangle(CLOCK_X, CLOCK_Y, CLOCK_WIDTH, CLOCK_HEIGHT);
            super.initialize(rect);
            this.opacity = 200;
            this._lastTime = '';
            this.refresh();
        }

        update() {
            super.update();
            if (!$gameTime) return;
            this.visible = $gameTime.isClockVisible();
            const currentTime = $gameTime.getTimeString();
            if (this._lastTime !== currentTime) {
                this._lastTime = currentTime;
                this.refresh();
            }
        }

        refresh() {
            if (!$gameTime) return;
            this.contents.clear();
            this.contents.fontSize = 22;
            const dayText = 'Day ' + $gameTime.getDay();
            const timeText = $gameTime.getTimeString();
            const fullText = `${dayText}  ${timeText}`;
            this.drawText(fullText, 8, 6, this.contents.width - 16, 'left');
            this.resetFontSettings();
        }
    }

    //===========================================================================
    // Scene_Map
    //===========================================================================

    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.createClockWindow();
    };

    Scene_Map.prototype.createClockWindow = function() {
        this._clockWindow = new Window_Clock();
        this.addChild(this._clockWindow);
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        if ($gameTime) $gameTime.updateDayNightTone();
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if ($gameTime) $gameTime.update();
    };

    //===========================================================================
    // Game_Interpreter
    //===========================================================================

    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === pluginName) {
            this.processTimeSystemCommands(args[0], args.slice(1));
        }
    };

    // 노트 태그로 시간 경과를 처리하는 헬퍼 함수
    function applyTimeCostFromNoteTag(interpreter) {
        const event = $gameMap.event(interpreter.eventId());
        if (!event || !event.event().note) return;

        const note = event.event().note;
        const tags = {
            timeTalk: TALK_TIME,
            timeSearch: SEARCH_TIME,
            timeRead: READ_TIME,
            timeDoor: DOOR_TIME,
            timeSwitch: SWITCH_TIME,
            timeChest: CHEST_TIME
        };

        for (const tag in tags) {
            const regex = new RegExp(`<${tag}(?::(\d+))?>`, 'i');
            const match = note.match(regex);
            if (match) {
                const minutes = match[1] ? Number(match[1]) : tags[tag];
                $gameTime.addMinutes(minutes);
                return; // 첫 번째로 일치하는 태그만 적용
            }
        }
    }

    // 문장 표시 (대화, 조사, 읽기)
    const _Game_Interpreter_command101 = Game_Interpreter.prototype.command101;
    Game_Interpreter.prototype.command101 = function(params) {
        if ($gameTime) applyTimeCostFromNoteTag(this);
        return _Game_Interpreter_command101.call(this, params);
    };

    // 스위치 조작
    const _Game_Interpreter_command121 = Game_Interpreter.prototype.command121;
    Game_Interpreter.prototype.command121 = function(params) {
        if ($gameTime) applyTimeCostFromNoteTag(this);
        return _Game_Interpreter_command121.call(this, params);
    };

    // 아이템 증감 (보물상자)
    const _Game_Interpreter_command126 = Game_Interpreter.prototype.command126;
    Game_Interpreter.prototype.command126 = function(params) {
        if ($gameTime) applyTimeCostFromNoteTag(this);
        return _Game_Interpreter_command126.call(this, params);
    };

    // 장소 이동 (문)
    const _Game_Interpreter_command201 = Game_Interpreter.prototype.command201;
    Game_Interpreter.prototype.command201 = function(params) {
        if ($gameTime) applyTimeCostFromNoteTag(this);
        return _Game_Interpreter_command201.call(this, params);
    };

    //===========================================================================
    // 플러그인 커맨드
    //===========================================================================

    PluginManager.registerCommand(pluginName, 'addTime', args => {
        if (!$gameTime) return;
        $gameTime.addMinutes(Number(args.minutes || 10));
    });

    PluginManager.registerCommand(pluginName, 'setTime', args => {
        if (!$gameTime) return;
        $gameTime.setTime(Number(args.hour || 12), Number(args.minute || 0));
    });

    PluginManager.registerCommand(pluginName, 'showClock', () => $gameTime?.showClock());
    PluginManager.registerCommand(pluginName, 'hideClock', () => $gameTime?.hideClock());
    PluginManager.registerCommand(pluginName, 'enableAutoTime', () => $gameTime?.enableAutoTime());
    PluginManager.registerCommand(pluginName, 'disableAutoTime', () => $gameTime?.disableAutoTime());

    PluginManager.registerCommand(pluginName, 'stayAtInn', function(args) {
        if (!$gameTime) return;
        const skipFade = args.skipFade === 'true';

        if (!skipFade) {
            this.wait(30);
            $gameScreen.startFadeOut(30);
            this.wait(30);
        }

        const currentHour = $gameTime.getHour();
        if (currentHour >= 7) {
            $gameTime._day++;
        }
        $gameTime.setTime(7, 0);

        $gameParty.members().forEach(actor => actor.recoverAll());
        $gameMessage.add('편히 쉬었습니다.');

        if (!skipFade) {
            $gameScreen.startFadeIn(30);
            this.wait(30);
        }
    });

})();