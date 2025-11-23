//=============================================================================
// RPG Maker MZ - Time System (Upgraded)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 게임 내 시간 시스템 - 계절, 시계(Digital/Analog/Drawn), 시간 경과, 낮/밤 전환
 * @author YourName
 * @version 1.3.0
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
 * @param --- Seasons ---
 *
 * @param daysPerSeason
 * @text 계절당 일수
 * @desc 한 계절이 지속되는 일수입니다.
 * @type number
 * @min 1
 * @default 10
 *
 * @param --- Clock Style ---
 *
 * @param clockType
 * @text 시계 타입
 * @desc 표시할 시계의 타입을 선택합니다.
 * @type select
 * @option Digital
 * @value digital
 * @option Analog (Image-based)
 * @value analog
 * @option Drawn Analog (No Images)
 * @value drawn
 * @default digital
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
 * @param --- Digital Clock ---
 *
 * @param clockWidth
 * @text [Digital] 시계 너비
 * @type number
 * @default 240
 *
 * @param clockHeight
 * @text [Digital] 시계 높이
 * @type number
 * @default 50
 *
 * @param --- Analog Clock (Image) ---
 *
 * @param analogClockBg
 * @text [Analog] 시계 배경 이미지
 * @desc 아날로그 시계의 배경 이미지 파일
 * @type file
 * @dir img/pictures/
 * @default analog_clock_bg
 *
 * @param hourHandImage
 * @text [Analog] 시침 이미지
 * @desc 아날로그 시계의 시침 이미지 파일
 * @type file
 * @dir img/pictures/
 * @default analog_clock_hour_hand
 *
 * @param minuteHandImage
 * @text [Analog] 분침 이미지
 * @desc 아날로그 시계의 분침 이미지 파일
 * @type file
 * @dir img/pictures/
 * @default analog_clock_minute_hand
 *
 * @param --- Drawn Analog Clock ---
 *
 * @param drawnClockRadius
 * @text [Drawn] 시계 반지름
 * @desc 그려지는 아날로그 시계의 반지름 (크기)
 * @type number
 * @min 10
 * @default 40
 *
 * @param drawnClockFaceColor
 * @text [Drawn] 시계 배경색
 * @desc 시계 배경 색상 (CSS format, e.g., rgba(0,0,0,0.5))
 * @default rgba(0, 0, 0, 0.5)
 *
 * @param drawnClockFrameColor
 * @text [Drawn] 시계 테두리색
 * @desc 시계 테두리 색상
 * @default white
 *
 * @param drawnClockTickColor
 * @text [Drawn] 시계 눈금색
 * @desc 시계 눈금 색상
 * @default white
 *
 * @param drawnClockHourHandColor
 * @text [Drawn] 시침 색상
 * @desc 시침 색상
 * @default white
 *
 * @param drawnClockMinuteHandColor
 * @text [Drawn] 분침 색상
 * @desc 분침 색상
 * @default white
 *
 * @param --- Time Passage ---
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
 * @param --- Effects ---
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
 * @command getSeason
 * @text 현재 계절 가져오기
 * @desc 현재 계절 이름을 지정된 변수에 저장합니다.
 *
 * @arg variableId
 * @text 변수 ID
 * @desc 계절 이름을 저장할 게임 변수의 ID
 * @type variable
 * @default 1
 *
 * @help TimeSystem.js (v1.3.0)
 *
 * =============================================================================
 * 게임 내 시간 및 계절 시스템
 * ============================================================================
 *
 * 이 플러그인은 게임 내에서 시간이 흐르고 계절이 변화하는 시스템을 제공합니다.
 *
 * == 주요 기능 ==
 * - 일, 시, 분 단위의 시간 흐름 및 계절 변화 (봄, 여름, 가을, 겨울)
 * - 자동 시간 경과 및 플레이어 행동에 따른 시간 소모
 * - 시간과 계절에 따른 화면 색조(틴트) 변화
 * - 3가지 타입의 시계 표시 (디지털, 이미지 기반 아날로그, 코드 기반 아날로그)
 *
 * == 시계 타입 상세 ==
 *
 * 1. Digital: [Day 1 (Spring) 07:00] 형식의 텍스트로 시간을 표시합니다.
 *
 * 2. Analog (Image-based): 이미지 파일을 사용해 아날로그 시계를 표시합니다.
 *    'img/pictures/' 폴더 안에 시계 배경, 시침, 분침 이미지가 필요합니다.
 *
 * 3. Drawn Analog (No Images): 이미지 파일 없이 코드로 직접 그린 아날로그
 *    시계를 표시합니다. 플러그인 설정에서 시계의 크기와 모든 부위의 색상을
 *    자유롭게 커스터마이징할 수 있습니다.
 *
 * == 계절 시스템 ==
 *
 * 'daysPerSeason' 파라미터에 설정된 일수마다 계절이 바뀝니다.
 * 플러그인 커맨드 'getSeason'을 사용하면 현재 계절의 이름("Spring", "Summer",
 * "Autumn", "Winter")을 지정한 게임 변수에 저장할 수 있습니다.
 *
 * == 시간 경과 노트 태그 ==
 *
 * 이벤트 노트란에 태그를 추가하여 이벤트 실행 시 시간이 흐르게 할 수 있습니다.
 * 예: <timeTalk:10> (대화 시 10분 경과)
 *
 *   - <timeTalk:분>
 *   - <timeSearch:분>
 *   - <timeRead:분>
 *   - <timeDoor:분>
 *   - <timeSwitch:분>
 *   - <timeChest:분>
 *
 */

(() => {
    'use strict';

    const pluginName = 'TimeSystem';
    const parameters = PluginManager.parameters(pluginName);

    // 파라미터 읽기
    const INITIAL_HOUR = Number(parameters['initialHour'] || 7);
    const INITIAL_MINUTE = Number(parameters['initialMinute'] || 0);

    const DAYS_PER_SEASON = Number(parameters['daysPerSeason'] || 10);

    const CLOCK_TYPE = parameters['clockType'] || 'digital';
    const CLOCK_X = Number(parameters['clockX'] || 10);
    const CLOCK_Y = Number(parameters['clockY'] || 10);
    // Digital
    const CLOCK_WIDTH = Number(parameters['clockWidth'] || 240);
    const CLOCK_HEIGHT = Number(parameters['clockHeight'] || 50);
    // Analog (Image)
    const ANALOG_CLOCK_BG = parameters['analogClockBg'] || 'analog_clock_bg';
    const HOUR_HAND_IMAGE = parameters['hourHandImage'] || 'analog_clock_hour_hand';
    const MINUTE_HAND_IMAGE = parameters['minuteHandImage'] || 'analog_clock_minute_hand';
    // Drawn Analog
    const DRAWN_CLOCK_RADIUS = Number(parameters['drawnClockRadius'] || 40);
    const DRAWN_CLOCK_FACE_COLOR = parameters['drawnClockFaceColor'] || 'rgba(0, 0, 0, 0.5)';
    const DRAWN_CLOCK_FRAME_COLOR = parameters['drawnClockFrameColor'] || 'white';
    const DRAWN_CLOCK_TICK_COLOR = parameters['drawnClockTickColor'] || 'white';
    const DRAWN_CLOCK_HOUR_HAND_COLOR = parameters['drawnClockHourHandColor'] || 'white';
    const DRAWN_CLOCK_MINUTE_HAND_COLOR = parameters['drawnClockMinuteHandColor'] || 'white';

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

    const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter'];
    const SEASONAL_TONES = {
        // Spring (0)
        0: {
            dawn: [-17, -17, 17, 34],      // 약간 분홍빛 새벽
            morning: [0, 0, 0, 0],         // 상쾌한 아침
            day: [0, 0, 0, 0],
            noon: [10, 10, 0, 0],        // 따스한 정오
            afternoon: [0, 0, 0, 0],
            evening: [34, -10, -10, 0],    // 주황빛 저녁
            night: [-68, -68, 0, 68]
        },
        // Summer (1)
        1: {
            dawn: [-10, -10, 0, 20],      // 밝은 새벽
            morning: [17, 17, 0, 0],       // 쨍한 아침
            day: [10, 10, 0, 0],
            noon: [25, 25, 10, 0],       // 뜨거운 정오
            afternoon: [10, 10, 0, 0],
            evening: [50, -10, -30, 0],    // 붉은 저녁
            night: [-60, -60, -10, 68]
        },
        // Autumn (2)
        2: {
            dawn: [-34, -25, 34, 50],      // 서늘한 새벽
            morning: [17, 0, -17, 0],
            day: [17, 0, -17, 0],
            noon: [25, 10, -10, 0],      // 부드러운 정오
            afternoon: [17, 0, -17, 0],
            evening: [68, -17, -34, 0],    // 운치있는 저녁
            night: [-75, -75, 0, 68]
        },
        // Winter (3)
        3: {
            dawn: [-50, -50, 0, 68],      // 차가운 새벽
            morning: [-17, -17, 0, 0],     // 창백한 아침
            day: [-10, -10, 0, 0],
            noon: [0, 0, 0, 0],
            afternoon: [-10, -10, 0, 0],
            evening: [0, -30, -30, 0],     // 푸른 저녁
            night: [-85, -85, 0, 85]     // 깊은 밤
        }
    };


    //===========================================================================
    // Game_Time
    // 시간 및 계절 관리 클래스
    //===========================================================================

    class Game_Time {
        constructor() {
            this.initialize();
        }

        initialize() {
            this._hour = INITIAL_HOUR;
            this._minute = INITIAL_MINUTE;
            this._day = 1;
            this._season = 0;
            this._clockVisible = true;
            this._autoTimeEnabled = AUTO_TIME_FLOW;
            this._timeCounter = 0; // 프레임 카운터
            this.updateSeason(false);
        }

        addMinutes(minutes) {
            if (minutes <= 0) return;
            this._minute += minutes;
            let dayChanged = false;
            while (this._minute >= 60) {
                this._minute -= 60;
                this._hour++;
                while (this._hour >= 24) {
                    this._hour -= 24;
                    this._day++;
                    dayChanged = true;
                }
            }
            if (dayChanged) {
                this.updateSeason(true);
            }
            this.updateDayNightTone();
        }

        setTime(hour, minute) {
            this._hour = hour % 24;
            this._minute = minute % 60;
            this.updateSeason(false);
            this.updateDayNightTone();
        }

        updateSeason(dayChanged) {
            const oldSeason = this._season;
            this._season = Math.floor((this._day - 1) / DAYS_PER_SEASON) % 4;
            if (dayChanged && oldSeason !== this._season) {
                this.onSeasonChange();
            }
        }

        onSeasonChange() {
            // 계절 변경 시 특별한 효과를 넣을 수 있는 훅(hook)
            // 예: 날씨 패턴 변경 등
        }

        getHour() { return this._hour; }
        getMinute() { return this._minute; }
        getDay() { return this._day; }
        getSeason() { return this._season; }
        getSeasonName() { return SEASON_NAMES[this._season]; }

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
            const season = this.getSeason();
            const tone = SEASONAL_TONES[season][timeOfDay] || [0, 0, 0, 0];

            $gameScreen.startTint(tone, TRANSITION_SPEED);
        }

        showClock() { this._clockVisible = true; }
        hideClock() { this._clockVisible = false; }
        isClockVisible() { return this._clockVisible; }
        enableAutoTime() { this._autoTimeEnabled = true; }
        disableAutoTime() { this._autoTimeEnabled = false; }
        isAutoTimeEnabled() { return this._autoTimeEnabled; }

        update() {
            if (!this.isAutoTimeEnabled() || !SceneManager.isSceneStarted()) return;
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
        if (contents.gameTime) {
            $gameTime = contents.gameTime;
            // v1.2 호환성: _season 속성이 없으면 추가
            if (typeof $gameTime._season === 'undefined') {
                Object.assign($gameTime, Game_Time.prototype);
                $gameTime.updateSeason(false);
            }
        } else {
            $gameTime = new Game_Time();
        }
    };

    //===========================================================================
    // Window_Clock (Digital)
    //===========================================================================

    class Window_Clock extends Window_Base {
        initialize() {
            const rect = new Rectangle(CLOCK_X, CLOCK_Y, CLOCK_WIDTH, CLOCK_HEIGHT);
            super.initialize(rect);
            this.opacity = 200;
            this._lastTime = '';
            this._lastSeason = -1;
            this.refresh();
        }

        update() {
            super.update();
            if (!$gameTime) return;
            this.visible = $gameTime.isClockVisible();
            const currentTime = $gameTime.getTimeString();
            const currentSeason = $gameTime.getSeason();
            if (this._lastTime !== currentTime || this._lastSeason !== currentSeason) {
                this._lastTime = currentTime;
                this._lastSeason = currentSeason;
                this.refresh();
            }
        }

        refresh() {
            if (!$gameTime) return;
            this.contents.clear();
            this.contents.fontSize = 22;
            const dayText = 'Day ' + $gameTime.getDay();
            const seasonText = $gameTime.getSeasonName();
            const timeText = $gameTime.getTimeString();
            const fullText = `${dayText} (${seasonText})  ${timeText}`;
            this.drawText(fullText, 0, 0, this.contents.width, 'center');
            this.resetFontSettings();
        }
    }

    //===========================================================================
    // Sprite_AnalogClock (Image-based)
    //===========================================================================

    class Sprite_AnalogClock extends Sprite {
        initialize() {
            super.initialize();
            this.x = CLOCK_X;
            this.y = CLOCK_Y;
            this.createSprites();
            this.update();
        }

        createSprites() {
            this._bgSprite = new Sprite(ImageManager.loadPicture(ANALOG_CLOCK_BG));
            this.addChild(this._bgSprite);

            this._hourHand = new Sprite(ImageManager.loadPicture(HOUR_HAND_IMAGE));
            this._hourHand.anchor.x = 0.5;
            this._hourHand.anchor.y = 1;
            this.addChild(this._hourHand);

            this._minuteHand = new Sprite(ImageManager.loadPicture(MINUTE_HAND_IMAGE));
            this._minuteHand.anchor.x = 0.5;
            this._minuteHand.anchor.y = 1;
            this.addChild(this._minuteHand);
        }

        update() {
            super.update();
            if (!$gameTime) return;
            this.visible = $gameTime.isClockVisible();
            if (this.visible) {
                this.updateHands();
            }
        }

        updateHands() {
            const hour = $gameTime.getHour();
            const minute = $gameTime.getMinute();
            const bgBitmap = this._bgSprite.bitmap;

            if (bgBitmap && bgBitmap.isReady()) {
                const centerX = bgBitmap.width / 2;
                const centerY = bgBitmap.height / 2;
                this._hourHand.x = centerX;
                this._hourHand.y = centerY;
                this._minuteHand.x = centerX;
                this._minuteHand.y = centerY;
            }

            this._hourHand.rotation = (hour % 12 + minute / 60) / 12 * 2 * Math.PI;
            this._minuteHand.rotation = (minute / 60) * 2 * Math.PI;
        }
    }

    //===========================================================================
    // Sprite_DrawnAnalogClock (No Images)
    //===========================================================================
    class Sprite_DrawnAnalogClock extends Sprite {
        initialize() {
            super.initialize();
            this.x = CLOCK_X;
            this.y = CLOCK_Y;
            const size = DRAWN_CLOCK_RADIUS * 2 + 4;
            this._faceBitmap = new Bitmap(size, size);
            this._handsBitmap = new Bitmap(size, size);
            this.addChild(new Sprite(this._faceBitmap));
            this.addChild(new Sprite(this._handsBitmap));
            this._lastMinute = -1;
            this.drawClockFace();
            this.update();
        }

        drawClockFace() {
            const r = DRAWN_CLOCK_RADIUS;
            const c = r + 2; // center
            const ctx = this._faceBitmap.context;
            ctx.clearRect(0, 0, c * 2, c * 2);
            // Face
            ctx.beginPath();
            ctx.fillStyle = DRAWN_CLOCK_FACE_COLOR;
            ctx.arc(c, c, r, 0, 2 * Math.PI);
            ctx.fill();
            // Frame
            ctx.beginPath();
            ctx.strokeStyle = DRAWN_CLOCK_FRAME_COLOR;
            ctx.lineWidth = 2;
            ctx.arc(c, c, r, 0, 2 * Math.PI);
            ctx.stroke();
            // Ticks
            for (let i = 0; i < 12; i++) {
                const angle = (i / 6) * Math.PI;
                const isMajor = i % 3 === 0;
                const startR = r - (isMajor ? 8 : 4);
                const endR = r;
                ctx.beginPath();
                ctx.strokeStyle = DRAWN_CLOCK_TICK_COLOR;
                ctx.lineWidth = isMajor ? 3 : 1;
                ctx.moveTo(c + Math.cos(angle) * startR, c + Math.sin(angle) * startR);
                ctx.lineTo(c + Math.cos(angle) * endR, c + Math.sin(angle) * endR);
                ctx.stroke();
            }
            this._faceBitmap.baseTexture.update();
        }

        update() {
            super.update();
            if (!$gameTime) return;
            this.visible = $gameTime.isClockVisible();
            if (this.visible && this._lastMinute !== $gameTime.getMinute()) {
                this._lastMinute = $gameTime.getMinute();
                this.updateHands();
            }
        }

        updateHands() {
            const r = DRAWN_CLOCK_RADIUS;
            const c = r + 2; // center
            const h = $gameTime.getHour();
            const m = $gameTime.getMinute();
            this._handsBitmap.clear();
            // Hour Hand
            const hAngle = (h % 12 + m / 60) / 6 * Math.PI - Math.PI / 2;
            const hLength = r * 0.6;
            this._handsBitmap.drawLine(c, c, c + Math.cos(hAngle) * hLength, c + Math.sin(hAngle) * hLength, DRAWN_CLOCK_HOUR_HAND_COLOR, 4);
            // Minute Hand
            const mAngle = (m / 30) * Math.PI - Math.PI / 2;
            const mLength = r * 0.9;
            this._handsBitmap.drawLine(c, c, c + Math.cos(mAngle) * mLength, c + Math.sin(mAngle) * mLength, DRAWN_CLOCK_MINUTE_HAND_COLOR, 2);
             // Center dot
            this._handsBitmap.drawCircle(c, c, 3, DRAWN_CLOCK_FRAME_COLOR);
        }
    }


    //===========================================================================
    // Scene_Map
    //===========================================================================

    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.createTimeDisplay();
    };

    Scene_Map.prototype.createTimeDisplay = function() {
        if (CLOCK_TYPE === 'analog') {
            this._timeDisplay = new Sprite_AnalogClock();
        } else if (CLOCK_TYPE === 'drawn') {
            this._timeDisplay = new Sprite_DrawnAnalogClock();
        } else {
            this._timeDisplay = new Window_Clock();
        }
        this.addChild(this._timeDisplay);
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        if ($gameTime) $gameTime.updateDayNightTone();
    };

    /*
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if ($gameTime) $gameTime.update();
    };
    */

    //===========================================================================
    // Game_Interpreter
    //===========================================================================

    const _GInt_command101 = Game_Interpreter.prototype.command101;
    Game_Interpreter.prototype.command101 = function(params) {
        if ($gameTime) {
            const event = $gameMap.event(this.eventId());
            if (event && event.event().note) {
                const note = event.event().note;
                let minutes = 0;
                let match;
                if ((match = note.match(/<timeRead(?::(\d+))?>/i))) {
                    minutes = match[1] ? Number(match[1]) : READ_TIME;
                } else if ((match = note.match(/<timeSearch(?::(\d+))?>/i))) {
                    minutes = match[1] ? Number(match[1]) : SEARCH_TIME;
                } else if ((match = note.match(/<timeTalk(?::(\d+))?>/i))) {
                    minutes = match[1] ? Number(match[1]) : TALK_TIME;
                }
                if(minutes > 0) $gameTime.addMinutes(minutes);
            }
        }
        return _GInt_command101.call(this, params);
    };

    const _GInt_command121 = Game_Interpreter.prototype.command121;
    Game_Interpreter.prototype.command121 = function(params) {
        if ($gameTime) {
             const event = $gameMap.event(this.eventId());
            if (event && event.event().note) {
                const match = event.event().note.match(/<timeSwitch(?::(\d+))?>/i);
                if (match) {
                    const minutes = match[1] ? Number(match[1]) : SWITCH_TIME;
                    if(minutes > 0) $gameTime.addMinutes(minutes);
                }
            }
        }
        return _GInt_command121.call(this, params);
    };

    const _GInt_command126 = Game_Interpreter.prototype.command126;
    Game_Interpreter.prototype.command126 = function(params) {
        if ($gameTime) {
             const event = $gameMap.event(this.eventId());
            if (event && event.event().note) {
                const match = event.event().note.match(/<timeChest(?::(\d+))?>/i);
                if (match && params[1] === 0 && params[2] > 0) { // 아이템 증가 시
                    const minutes = match[1] ? Number(match[1]) : CHEST_TIME;
                    if(minutes > 0) $gameTime.addMinutes(minutes);
                }
            }
        }
        return _GInt_command126.call(this, params);
    };

    const _GInt_command201 = Game_Interpreter.prototype.command201;
    Game_Interpreter.prototype.command201 = function(params) {
        if ($gameTime) {
            const event = $gameMap.event(this.eventId());
            if (event && event.event().note) {
                const match = event.event().note.match(/<timeDoor(?::(\d+))?>/i);
                if (match) {
                    const minutes = match[1] ? Number(match[1]) : DOOR_TIME;
                    if(minutes > 0) $gameTime.addMinutes(minutes);
                }
            }
        }
        return _GInt_command201.call(this, params);
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

    PluginManager.registerCommand(pluginName, 'getSeason', args => {
        if (!$gameTime) return;
        const varId = Number(args.variableId);
        if (varId > 0) {
            $gameVariables.setValue(varId, $gameTime.getSeasonName());
        }
    });



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
            $gameTime.updateSeason(true);
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