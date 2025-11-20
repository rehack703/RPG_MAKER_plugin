//=============================================================================
// RPG Maker MZ - Time System
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 게임 내 시간 시스템 - 시계 표시, 상호작용 시간 경과, 낮/밤 전환
 * @author YourName
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
 * @text 대화 소요 시간 (분)
 * @desc NPC와 대화 시 경과 시간
 * @type number
 * @default 60
 *
 * @param doorTime
 * @text 문 열기 소요 시간 (분)
 * @desc 문을 열거나 닫을 때 경과 시간
 * @type number
 * @default 10
 *
 * @param searchTime
 * @text 조사 소요 시간 (분)
 * @desc 사물을 조사할 때 경과 시간
 * @type number
 * @default 5
 *
 * @param switchTime
 * @text 스위치 조작 소요 시간 (분)
 * @desc 스위치/레버를 조작할 때 경과 시간
 * @type number
 * @default 5
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
 * @param innSwitchId
 * @text 여관 숙박 스위치 ID
 * @desc 이 스위치가 ON이 되면 자동으로 다음날 오전 7시로 시간 변경 (0 = 비활성화)
 * @type switch
 * @default 10
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
 * @desc 여관에서 숙박합니다. 다음날 오전 7시로 시간이 설정됩니다.
 *
 * @arg skipFade
 * @text 페이드 효과 생략
 * @desc true로 설정하면 화면 페이드 효과를 생략합니다
 * @type boolean
 * @default false
 *
 * @help TimeSystem.js
 *
 * ============================================================================
 * 게임 내 시간 시스템
 * ============================================================================
 *
 * 이 플러그인은 게임 내에서 시간이 흐르는 시스템을 제공합니다.
 *
 * == 기본 사용법 ==
 *
 * 1. 이벤트 커맨드에서 플러그인 커맨드 "시간 추가"를 사용하여
 *    상호작용 시 시간을 경과시킬 수 있습니다.
 *
 * 2. 스크립트에서 직접 제어:
 *    $gameTime.addMinutes(30);  // 30분 추가
 *    $gameTime.getHour();       // 현재 시각 가져오기
 *    $gameTime.getMinute();     // 현재 분 가져오기
 *
 * 3. 조건 분기에서 시간 확인:
 *    - 변수 제어로 $gameTime.getHour() 사용
 *
 * == 자동 시간 경과 ==
 *
 * 노트 태그를 이벤트에 추가하여 자동으로 시간 경과:
 *   <timeAction:60>   # 이 이벤트 실행 시 60분 경과
 *   <timeTalk:30>     # 대화 시 30분 경과
 *
 * == 시간대별 색조 ==
 *
 * 새벽 (4-6시): 어두운 파란색
 * 아침 (6-9시): 밝아짐
 * 낮 (9-17시): 기본 밝기
 * 저녁 (17-19시): 주황빛
 * 밤 (19-4시): 어두운 파란색
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
    const CLOCK_WIDTH = Number(parameters['clockWidth'] || 180);
    const CLOCK_HEIGHT = Number(parameters['clockHeight'] || 60);
    const TALK_TIME = Number(parameters['talkTime'] || 60);
    const DOOR_TIME = Number(parameters['doorTime'] || 10);
    const SEARCH_TIME = Number(parameters['searchTime'] || 5);
    const SWITCH_TIME = Number(parameters['switchTime'] || 5);
    const ENABLE_DAY_NIGHT = parameters['enableDayNight'] === 'true';
    const TRANSITION_SPEED = Number(parameters['transitionSpeed'] || 60);
    const AUTO_TIME_FLOW = parameters['autoTimeFlow'] !== 'false'; // 기본값 true
    const TIME_FLOW_SPEED = Number(parameters['timeFlowSpeed'] || 2);
    const INN_SWITCH_ID = Number(parameters['innSwitchId'] || 10);

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

        // 분 추가
        addMinutes(minutes) {
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

        // 시각 설정
        setTime(hour, minute) {
            this._hour = hour % 24;
            this._minute = minute % 60;
            this.updateDayNightTone();
        }

        // 현재 시각 가져오기
        getHour() {
            return this._hour;
        }

        getMinute() {
            return this._minute;
        }

        getDay() {
            return this._day;
        }

        // 시각 문자열 (예: "07:30")
        getTimeString() {
            const h = String(this._hour).padStart(2, '0');
            const m = String(this._minute).padStart(2, '0');
            return h + ':' + m;
        }

        // 시간대 가져오기
        getTimeOfDay() {
            const h = this._hour;
            if (h >= 4 && h < 6) return 'dawn';      // 새벽
            if (h >= 6 && h < 9) return 'morning';   // 아침
            if (h >= 9 && h < 17) return 'day';      // 낮
            if (h >= 17 && h < 19) return 'evening'; // 저녁
            return 'night';                           // 밤
        }

        // 낮/밤 색조 업데이트
        updateDayNightTone() {
            if (!ENABLE_DAY_NIGHT) return;
            if (!$gameMap) return;

            const timeOfDay = this.getTimeOfDay();
            let tone = [0, 0, 0, 0]; // [R, G, B, Gray]

            switch (timeOfDay) {
                case 'dawn':
                    tone = [-34, -17, 34, 68];  // 어두운 파란색
                    break;
                case 'morning':
                    tone = [17, 0, -17, 0];     // 약간 따뜻한 색
                    break;
                case 'day':
                    tone = [0, 0, 0, 0];        // 기본
                    break;
                case 'evening':
                    tone = [68, -17, -34, 0];   // 주황빛
                    break;
                case 'night':
                    tone = [-68, -68, 0, 68];   // 어두운 파란색
                    break;
            }

            $gameScreen.startTint(tone, TRANSITION_SPEED);
        }

        // 시계 표시 상태
        showClock() {
            this._clockVisible = true;
        }

        hideClock() {
            this._clockVisible = false;
        }

        isClockVisible() {
            return this._clockVisible;
        }

        // 자동 시간 경과 활성화/비활성화
        enableAutoTime() {
            this._autoTimeEnabled = true;
        }

        disableAutoTime() {
            this._autoTimeEnabled = false;
        }

        isAutoTimeEnabled() {
            return this._autoTimeEnabled;
        }

        // 프레임마다 호출되는 업데이트
        update() {
            if (!this._autoTimeEnabled) return;

            // 60프레임 = 1초, TIME_FLOW_SPEED초마다 1분 경과
            const framesPerMinute = 60 * TIME_FLOW_SPEED;
            this._timeCounter++;

            if (this._timeCounter >= framesPerMinute) {
                this._timeCounter = 0;
                this.addMinutes(1);
            }
        }
    }

    // 전역 변수로 등록
    window.Game_Time = Game_Time;
    window.$gameTime = null; // 초기화

    //===========================================================================
    // DataManager
    // 저장/로드 지원
    //===========================================================================

    const _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        if (!$gameTime) {
            $gameTime = new Game_Time();
        }
    };

    const _DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        const contents = _DataManager_makeSaveContents.call(this);
        if ($gameTime) {
            contents.gameTime = {
                hour: $gameTime._hour,
                minute: $gameTime._minute,
                day: $gameTime._day,
                clockVisible: $gameTime._clockVisible,
                autoTimeEnabled: $gameTime._autoTimeEnabled,
                timeCounter: $gameTime._timeCounter
            };
        }
        return contents;
    };

    const _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _DataManager_extractSaveContents.call(this, contents);
        if (contents.gameTime && $gameTime) {
            $gameTime._hour = contents.gameTime.hour;
            $gameTime._minute = contents.gameTime.minute;
            $gameTime._day = contents.gameTime.day;
            $gameTime._clockVisible = contents.gameTime.clockVisible;
            $gameTime._autoTimeEnabled = contents.gameTime.autoTimeEnabled !== false;
            $gameTime._timeCounter = contents.gameTime.timeCounter || 0;
            $gameTime.updateDayNightTone();
        }
    };

    //===========================================================================
    // Window_Clock
    // 시계 윈도우
    //===========================================================================

    class Window_Clock extends Window_Base {
        initialize() {
            const x = CLOCK_X; // 왼쪽 정렬
            const y = CLOCK_Y;
            const rect = new Rectangle(x, y, CLOCK_WIDTH, CLOCK_HEIGHT);
            super.initialize(rect);
            this.opacity = 200;
            this._lastTime = '';
            this.refresh();
        }

        update() {
            super.update();
            if ($gameTime) {
                this.visible = $gameTime.isClockVisible();
                // 시간이 변경되었을 때만 refresh
                const currentTime = $gameTime.getTimeString();
                if (this._lastTime !== currentTime) {
                    this._lastTime = currentTime;
                    this.refresh();
                }
            } else {
                this.visible = false;
            }
        }

        refresh() {
            if (!$gameTime) return;

            this.contents.clear();

            // 날짜와 시각을 한 줄에 표시
            this.contents.fontSize = 22;
            const dayText = 'Day ' + $gameTime.getDay();
            const timeText = $gameTime.getTimeString();
            const fullText = dayText + '  ' + timeText;

            this.drawText(fullText, 8, 6, this.contents.width - 16, 'left');

            // 폰트 크기 복원
            this.resetFontSettings();
        }
    }

    //===========================================================================
    // Scene_Map
    // 맵 씬에 시계 추가
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
        if ($gameTime) {
            $gameTime.updateDayNightTone();
        }
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if ($gameTime) {
            $gameTime.update();
        }
    };

    //===========================================================================
    // Game_Interpreter
    // 이벤트 실행 시 자동 시간 경과
    //===========================================================================

    // 대화 시작 시 시간 경과 (메시지 표시)
    const _Game_Interpreter_command101 = Game_Interpreter.prototype.command101;
    Game_Interpreter.prototype.command101 = function(params) {
        if (!$gameTime) {
            return _Game_Interpreter_command101.call(this, params);
        }

        // 이벤트 노트에서 시간 설정 확인
        const event = $gameMap.event(this._eventId);
        if (event && event.event().note) {
            const note = event.event().note;
            const match = note.match(/<timeTalk:(\d+)>/i);
            if (match) {
                const minutes = Number(match[1]);
                $gameTime.addMinutes(minutes);
            } else {
                // 기본 대화 시간
                $gameTime.addMinutes(TALK_TIME);
            }
        } else {
            $gameTime.addMinutes(TALK_TIME);
        }

        return _Game_Interpreter_command101.call(this, params);
    };

    // 스위치 조작 시 시간 경과 (Control Switches)
    const _Game_Interpreter_command121 = Game_Interpreter.prototype.command121;
    Game_Interpreter.prototype.command121 = function(params) {
        if ($gameTime) {
            // 이벤트 노트에서 시간 설정 확인
            const event = $gameMap.event(this._eventId);
            if (event && event.event().note) {
                const note = event.event().note;
                const match = note.match(/<timeSwitch:(\d+)>/i);
                if (match) {
                    const minutes = Number(match[1]);
                    $gameTime.addMinutes(minutes);
                } else {
                    // 기본 스위치 조작 시간
                    $gameTime.addMinutes(SWITCH_TIME);
                }
            } else {
                $gameTime.addMinutes(SWITCH_TIME);
            }
        }

        return _Game_Interpreter_command121.call(this, params);
    };

    //===========================================================================
    // Game_Switches
    // 여관 스위치 감지
    //===========================================================================

    const _Game_Switches_setValue = Game_Switches.prototype.setValue;
    Game_Switches.prototype.setValue = function(switchId, value) {
        // 기존 setValue 호출
        _Game_Switches_setValue.call(this, switchId, value);

        // 여관 스위치가 ON이 되었을 때
        if (switchId === INN_SWITCH_ID && value === true && INN_SWITCH_ID > 0) {
            if ($gameTime) {
                const currentHour = $gameTime.getHour();

                // 07시 이전이면 같은 날 07:00, 07시 이후면 다음날 07:00
                if (currentHour < 7) {
                    $gameTime.setTime(7, 0);
                } else {
                    $gameTime._day++;
                    $gameTime.setTime(7, 0);
                }

                // 파티 전체 HP/MP 회복
                $gameParty.members().forEach(actor => {
                    actor.recoverAll();
                });
            }

            // 스위치를 다시 OFF로
            _Game_Switches_setValue.call(this, switchId, false);
        }
    };

    //===========================================================================
    // 플러그인 커맨드
    //===========================================================================

    // 시간 추가
    PluginManager.registerCommand(pluginName, 'addTime', args => {
        if (!$gameTime) return;
        const minutes = Number(args.minutes || 10);
        $gameTime.addMinutes(minutes);
    });

    // 시각 설정
    PluginManager.registerCommand(pluginName, 'setTime', args => {
        if (!$gameTime) return;
        const hour = Number(args.hour || 12);
        const minute = Number(args.minute || 0);
        $gameTime.setTime(hour, minute);
    });

    // 시계 표시
    PluginManager.registerCommand(pluginName, 'showClock', () => {
        if (!$gameTime) return;
        $gameTime.showClock();
    });

    // 시계 숨기기
    PluginManager.registerCommand(pluginName, 'hideClock', () => {
        if (!$gameTime) return;
        $gameTime.hideClock();
    });

    // 자동 시간 경과 켜기
    PluginManager.registerCommand(pluginName, 'enableAutoTime', () => {
        if (!$gameTime) return;
        $gameTime.enableAutoTime();
    });

    // 자동 시간 경과 끄기
    PluginManager.registerCommand(pluginName, 'disableAutoTime', () => {
        if (!$gameTime) return;
        $gameTime.disableAutoTime();
    });

    // 여관 숙박
    PluginManager.registerCommand(pluginName, 'stayAtInn', function(args) {
        if (!$gameTime) return;

        const skipFade = args.skipFade === 'true';

        // 페이드 아웃
        if (!skipFade) {
            $gameScreen.startFadeOut(30);
            this.wait(30);
        }

        // 현재 시간 확인
        const currentHour = $gameTime.getHour();

        // 07시 이전이면 같은 날 07:00로, 07시 이후면 다음날 07:00로
        if (currentHour < 7) {
            // 같은 날 07:00
            $gameTime.setTime(7, 0);
        } else {
            // 다음날 07:00
            $gameTime._day++;
            $gameTime.setTime(7, 0);
        }

        // 파티 전체 HP/MP 회복
        $gameParty.members().forEach(actor => {
            actor.recoverAll();
        });

        // 메시지 표시
        $gameMessage.add('편히 쉬었습니다.');
        $gameMessage.add('상쾌한 아침입니다!');

        // 페이드 인
        if (!skipFade) {
            this.wait(30);
            $gameScreen.startFadeIn(30);
            this.wait(30);
        }
    });

})();
