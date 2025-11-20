//=============================================================================
// RPG Maker MZ - Daily Life System
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 일상 생활 시스템 - 수면, 씻기, 식사
 * @author YourName
 * @orderAfter TimeSystem
 *
 * @param sleepWakeHour
 * @text 기상 시각 (시)
 * @desc 밤에 잘 때 일어나는 시각
 * @type number
 * @min 0
 * @max 23
 * @default 7
 *
 * @param sleepWakeMinute
 * @text 기상 시각 (분)
 * @desc 밤에 잘 때 일어나는 분
 * @type number
 * @min 0
 * @max 59
 * @default 0
 *
 * @param napDuration
 * @text 낮잠 시간 (분)
 * @desc 낮에 잘 때 자는 시간
 * @type number
 * @default 120
 *
 * @param nightTimeStart
 * @text 밤 시작 시각
 * @desc 이 시각 이후는 밤으로 간주 (저녁 수면)
 * @type number
 * @min 0
 * @max 23
 * @default 20
 *
 * @param nightTimeEnd
 * @text 밤 종료 시각
 * @desc 이 시각 이전은 밤으로 간주 (저녁 수면)
 * @type number
 * @min 0
 * @max 23
 * @default 6
 *
 * @param showerDuration
 * @text 샤워 시간 (분)
 * @desc 샤워/목욕 소요 시간
 * @type number
 * @default 30
 *
 * @param mealDuration
 * @text 식사 시간 (분)
 * @desc 식사 소요 시간
 * @type number
 * @default 45
 *
 * @param sleepHpRecovery
 * @text 수면 HP 회복률 (%)
 * @desc 밤 수면 시 HP 회복 비율
 * @type number
 * @min 0
 * @max 100
 * @default 100
 *
 * @param sleepMpRecovery
 * @text 수면 MP 회복률 (%)
 * @desc 밤 수면 시 MP 회복 비율
 * @type number
 * @min 0
 * @max 100
 * @default 100
 *
 * @param napHpRecovery
 * @text 낮잠 HP 회복률 (%)
 * @desc 낮잠 시 HP 회복 비율
 * @type number
 * @min 0
 * @max 100
 * @default 30
 *
 * @param napMpRecovery
 * @text 낮잠 MP 회복률 (%)
 * @desc 낮잠 시 MP 회복 비율
 * @type number
 * @min 0
 * @max 100
 * @default 30
 *
 * @param showerHpRecovery
 * @text 샤워 HP 회복 (고정값)
 * @desc 샤워 시 HP 회복량
 * @type number
 * @default 50
 *
 * @param mealHpRecovery
 * @text 식사 HP 회복 (고정값)
 * @desc 식사 시 HP 회복량
 * @type number
 * @default 100
 *
 * @param mealMpRecovery
 * @text 식사 MP 회복 (고정값)
 * @desc 식사 시 MP 회복량
 * @type number
 * @default 50
 *
 * @command sleep
 * @text 수면
 * @desc 침대에서 잔다 (저녁: 아침까지, 낮: 낮잠)
 *
 * @arg skipFade
 * @text 페이드 효과 생략
 * @desc true면 페이드 효과를 생략합니다
 * @type boolean
 * @default false
 *
 * @command nap
 * @text 낮잠 (강제)
 * @desc 시간대 상관없이 낮잠만 잔다
 *
 * @arg duration
 * @text 낮잠 시간 (분)
 * @desc 낮잠 시간 (미지정 시 기본값)
 * @type number
 * @default 120
 *
 * @command shower
 * @text 샤워/목욕
 * @desc 샤워나 목욕을 한다
 *
 * @arg duration
 * @text 소요 시간 (분)
 * @desc 샤워 시간 (미지정 시 기본값)
 * @type number
 * @default 30
 *
 * @command meal
 * @text 식사
 * @desc 식사를 한다
 *
 * @arg duration
 * @text 소요 시간 (분)
 * @desc 식사 시간 (미지정 시 기본값)
 * @type number
 * @default 45
 *
 * @arg mealType
 * @text 식사 종류
 * @desc 식사 종류 (메시지용)
 * @type string
 * @default 식사
 *
 * @help DailyLife.js
 *
 * ============================================================================
 * 일상 생활 시스템
 * ============================================================================
 *
 * 수면, 샤워, 식사 등 일상적인 활동을 처리합니다.
 * TimeSystem 플러그인과 함께 사용하면 시간이 자동으로 흐릅니다.
 *
 * == 수면 시스템 ==
 *
 * 1. 저녁 수면 (20시~6시):
 *    - 다음날 아침 7시에 기상
 *    - HP/MP 100% 회복
 *    - 모든 상태이상 해제
 *
 * 2. 낮잠 (6시~20시):
 *    - 2시간 수면
 *    - HP/MP 30% 회복
 *
 * == 사용 예시 ==
 *
 * 침대 이벤트:
 *   ◆ 문장: 침대에서 자시겠습니까?
 *   ◆ 선택지: 잔다, 안 잔다
 *     : [잔다]
 *       ◆ 플러그인 커맨드: DailyLife → 수면
 *
 * 샤워실 이벤트:
 *   ◆ 플러그인 커맨드: DailyLife → 샤워/목욕
 *
 * 식탁 이벤트:
 *   ◆ 플러그인 커맨드: DailyLife → 식사
 *     └ 식사 종류: 아침식사
 *
 * == 스크립트로 직접 제어 ==
 *
 * $dailyLife.sleep();        // 수면
 * $dailyLife.nap(120);       // 120분 낮잠
 * $dailyLife.shower(30);     // 30분 샤워
 * $dailyLife.meal(45, "점심");  // 45분 점심식사
 *
 */

(() => {
    'use strict';

    const pluginName = 'DailyLife';
    const parameters = PluginManager.parameters(pluginName);

    // 파라미터 읽기
    const SLEEP_WAKE_HOUR = Number(parameters['sleepWakeHour'] || 7);
    const SLEEP_WAKE_MINUTE = Number(parameters['sleepWakeMinute'] || 0);
    const NAP_DURATION = Number(parameters['napDuration'] || 120);
    const NIGHT_TIME_START = Number(parameters['nightTimeStart'] || 20);
    const NIGHT_TIME_END = Number(parameters['nightTimeEnd'] || 6);
    const SHOWER_DURATION = Number(parameters['showerDuration'] || 30);
    const MEAL_DURATION = Number(parameters['mealDuration'] || 45);
    const SLEEP_HP_RECOVERY = Number(parameters['sleepHpRecovery'] || 100);
    const SLEEP_MP_RECOVERY = Number(parameters['sleepMpRecovery'] || 100);
    const NAP_HP_RECOVERY = Number(parameters['napHpRecovery'] || 30);
    const NAP_MP_RECOVERY = Number(parameters['napMpRecovery'] || 30);
    const SHOWER_HP_RECOVERY = Number(parameters['showerHpRecovery'] || 50);
    const MEAL_HP_RECOVERY = Number(parameters['mealHpRecovery'] || 100);
    const MEAL_MP_RECOVERY = Number(parameters['mealMpRecovery'] || 50);

    //===========================================================================
    // DailyLife
    // 일상 생활 관리 클래스
    //===========================================================================

    class DailyLife {
        // 밤 시간대인지 확인
        isNightTime() {
            if (!$gameTime) return false;
            const hour = $gameTime.getHour();

            if (NIGHT_TIME_START > NIGHT_TIME_END) {
                // 예: 20시 ~ 6시
                return hour >= NIGHT_TIME_START || hour < NIGHT_TIME_END;
            } else {
                // 예: 22시 ~ 23시 (특수 케이스)
                return hour >= NIGHT_TIME_START && hour < NIGHT_TIME_END;
            }
        }

        // 수면 (자동 판단: 밤이면 아침까지, 낮이면 낮잠)
        sleep(skipFade = false) {
            const isNight = this.isNightTime();

            if (!skipFade) {
                $gameScreen.startFadeOut(30);
                this.wait(30);
            }

            if (isNight) {
                // 저녁 수면: 아침까지
                this.nightSleep();
            } else {
                // 낮잠
                this.nap(NAP_DURATION);
            }

            if (!skipFade) {
                this.wait(30);
                $gameScreen.startFadeIn(30);
                this.wait(30);
            }
        }

        // 저녁 수면
        nightSleep() {
            // 시각을 아침으로 설정
            if ($gameTime) {
                $gameTime.setTime(SLEEP_WAKE_HOUR, SLEEP_WAKE_MINUTE);
            }

            // 완전 회복
            this.recoverParty(SLEEP_HP_RECOVERY, SLEEP_MP_RECOVERY, true);

            // 메시지
            $gameMessage.add('푹 잤다!');
            $gameMessage.add('상쾌한 아침이다!');
        }

        // 낮잠
        nap(duration = NAP_DURATION) {
            // 시간 경과
            if ($gameTime) {
                $gameTime.addMinutes(duration);
            }

            // 부분 회복
            this.recoverParty(NAP_HP_RECOVERY, NAP_MP_RECOVERY, false);

            // 메시지
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            let timeText = '';
            if (hours > 0) timeText += hours + '시간 ';
            if (minutes > 0) timeText += minutes + '분';

            $gameMessage.add(timeText + ' 동안 낮잠을 잤다.');
            $gameMessage.add('조금 개운해졌다.');
        }

        // 샤워/목욕
        shower(duration = SHOWER_DURATION) {
            $gameScreen.startFadeOut(20);
            this.wait(20);

            // 시간 경과
            if ($gameTime) {
                $gameTime.addMinutes(duration);
            }

            // HP 회복
            $gameParty.members().forEach(actor => {
                actor.gainHp(SHOWER_HP_RECOVERY);
            });

            this.wait(30);
            $gameScreen.startFadeIn(20);
            this.wait(20);

            // 메시지
            $gameMessage.add('깨끗이 씻었다!');
            $gameMessage.add('기분이 상쾌해졌다.');
        }

        // 식사
        meal(duration = MEAL_DURATION, mealType = '식사') {
            // 시간 경과
            if ($gameTime) {
                $gameTime.addMinutes(duration);
            }

            // HP/MP 회복
            $gameParty.members().forEach(actor => {
                actor.gainHp(MEAL_HP_RECOVERY);
                actor.gainMp(MEAL_MP_RECOVERY);
            });

            // 메시지
            $gameMessage.add(mealType + '를 먹었다!');
            $gameMessage.add('배가 든든해졌다.');
        }

        // 파티 회복
        recoverParty(hpPercent, mpPercent, removeStates) {
            $gameParty.members().forEach(actor => {
                if (hpPercent > 0) {
                    const hpRecovery = Math.floor(actor.mhp * hpPercent / 100);
                    actor.gainHp(hpRecovery);
                }
                if (mpPercent > 0) {
                    const mpRecovery = Math.floor(actor.mmp * mpPercent / 100);
                    actor.gainMp(mpRecovery);
                }
                if (removeStates) {
                    actor.clearStates();
                }
            });
        }

        // 대기
        wait(duration) {
            // 인터프리터 대기는 이벤트 커맨드에서 처리
        }
    }

    // 전역 객체 생성
    window.DailyLife = DailyLife;
    window.$dailyLife = new DailyLife();

    //===========================================================================
    // 플러그인 커맨드
    //===========================================================================

    // 수면
    PluginManager.registerCommand(pluginName, 'sleep', function(args) {
        const skipFade = args.skipFade === 'true';

        if (!skipFade) {
            $gameScreen.startFadeOut(30);
            this.wait(30);
        }

        const isNight = $dailyLife.isNightTime();

        if (isNight) {
            // 저녁 수면
            if ($gameTime) {
                $gameTime.setTime(SLEEP_WAKE_HOUR, SLEEP_WAKE_MINUTE);
            }
            $dailyLife.recoverParty(SLEEP_HP_RECOVERY, SLEEP_MP_RECOVERY, true);
            $gameMessage.add('푹 잤다!');
            $gameMessage.add('상쾌한 아침이다!');
        } else {
            // 낮잠
            if ($gameTime) {
                $gameTime.addMinutes(NAP_DURATION);
            }
            $dailyLife.recoverParty(NAP_HP_RECOVERY, NAP_MP_RECOVERY, false);

            const hours = Math.floor(NAP_DURATION / 60);
            const minutes = NAP_DURATION % 60;
            let timeText = '';
            if (hours > 0) timeText += hours + '시간 ';
            if (minutes > 0) timeText += minutes + '분';

            $gameMessage.add(timeText + ' 동안 낮잠을 잤다.');
            $gameMessage.add('조금 개운해졌다.');
        }

        if (!skipFade) {
            this.wait(30);
            $gameScreen.startFadeIn(30);
            this.wait(30);
        }
    });

    // 낮잠 (강제)
    PluginManager.registerCommand(pluginName, 'nap', function(args) {
        const duration = Number(args.duration || NAP_DURATION);

        $gameScreen.startFadeOut(20);
        this.wait(20);

        if ($gameTime) {
            $gameTime.addMinutes(duration);
        }

        $dailyLife.recoverParty(NAP_HP_RECOVERY, NAP_MP_RECOVERY, false);

        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        let timeText = '';
        if (hours > 0) timeText += hours + '시간 ';
        if (minutes > 0) timeText += minutes + '분';

        this.wait(30);
        $gameScreen.startFadeIn(20);
        this.wait(20);

        $gameMessage.add(timeText + ' 동안 낮잠을 잤다.');
        $gameMessage.add('조금 개운해졌다.');
    });

    // 샤워
    PluginManager.registerCommand(pluginName, 'shower', function(args) {
        const duration = Number(args.duration || SHOWER_DURATION);

        $gameScreen.startFadeOut(20);
        this.wait(20);

        if ($gameTime) {
            $gameTime.addMinutes(duration);
        }

        $gameParty.members().forEach(actor => {
            actor.gainHp(SHOWER_HP_RECOVERY);
        });

        this.wait(30);
        $gameScreen.startFadeIn(20);
        this.wait(20);

        $gameMessage.add('깨끗이 씻었다!');
        $gameMessage.add('기분이 상쾌해졌다.');
    });

    // 식사
    PluginManager.registerCommand(pluginName, 'meal', function(args) {
        const duration = Number(args.duration || MEAL_DURATION);
        const mealType = String(args.mealType || '식사');

        if ($gameTime) {
            $gameTime.addMinutes(duration);
        }

        $gameParty.members().forEach(actor => {
            actor.gainHp(MEAL_HP_RECOVERY);
            actor.gainMp(MEAL_MP_RECOVERY);
        });

        $gameMessage.add(mealType + '를 먹었다!');
        $gameMessage.add('배가 든든해졌다.');
    });

})();
