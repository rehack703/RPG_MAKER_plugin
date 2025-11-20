//=============================================================================
// SpeechToText.js (Groq Whisper API 버전)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Groq Whisper API를 사용하여 음성을 텍스트로 변환합니다.
 * @author YourName
 * @url https://github.com/yourusername/SpeechToText
 *
 * @help SpeechToText.js
 *
 * 이 플러그인은 Groq Whisper API를 사용하여 음성을 텍스트로 변환합니다.
 *
 * ============================================================================
 * 설정 방법
 * ============================================================================
 *
 * 1. js/config.js 파일에 Groq API 키를 입력하세요
 * 2. 플러그인 매니저에서 이 플러그인을 활성화합니다
 * 3. 토글 키(기본값: V)를 눌러 녹음 시작/종료
 *
 * ============================================================================
 * 플러그인 커맨드
 * ============================================================================
 *
 * startRecognition - 음성 녹음을 시작합니다
 * stopRecognition - 음성 녹음을 중지하고 인식을 실행합니다
 * showRecognizedText - 인식된 텍스트를 메시지 창에 표시합니다
 *
 * ============================================================================
 * 사용 방법
 * ============================================================================
 *
 * 1. V 키를 눌러 녹음 시작
 * 2. 말하기
 * 3. V 키를 다시 눌러 녹음 종료 및 텍스트 변환
 * 4. 인식된 텍스트는 게임 변수에 자동 저장
 *
 * ============================================================================
 * 주요 기능
 * ============================================================================
 *
 * - Groq Whisper API 기반 고정밀 음성 인식
 * - 오프라인 환경에서도 작동 (file:// 프로토콜 지원)
 * - 키보드 단축키로 녹음 ON/OFF
 * - 실시간 녹음 상태 화면 표시
 * - 인식된 텍스트 자동 저장
 *
 * @param variableId
 * @text 저장할 변수 ID
 * @desc 인식된 텍스트를 저장할 게임 변수 ID
 * @type variable
 * @default 1
 *
 * @param language
 * @text 인식 언어
 * @desc 음성 인식 언어 (ko: 한국어, en: 영어, ja: 일본어 등)
 * @type string
 * @default ko
 *
 * @param showWindow
 * @text 인식 창 표시
 * @desc 음성 녹음 중 화면에 창을 표시할지 여부
 * @type boolean
 * @default true
 *
 * @param toggleKey
 * @text 토글 키
 * @desc 음성 녹음을 시작/종료할 키 (예: R, T, V 등)
 * @type string
 * @default V
 *
 * @command startRecognition
 * @text 음성 녹음 시작
 * @desc 음성 녹음을 시작합니다.
 *
 * @command stopRecognition
 * @text 음성 녹음 중지
 * @desc 음성 녹음을 중지하고 텍스트로 변환합니다.
 *
 * @command showRecognizedText
 * @text 인식된 텍스트 표시
 * @desc 인식된 텍스트를 메시지 창에 표시합니다.
 */

(() => {
    'use strict';

    const pluginName = 'SpeechToText';
    const parameters = PluginManager.parameters(pluginName);
    const variableId = Number(parameters['variableId'] || 1);
    const language = String(parameters['language'] || 'ko').split('-')[0]; // ko-KR → ko 자동 변환
    const showWindow = parameters['showWindow'] === 'true';
    const toggleKey = String(parameters['toggleKey'] || 'V').toUpperCase();
    const recordingInterval = 2000; // 실시간 모드 녹음 간격 (밀리초)

    let mediaRecorder = null;
    let audioChunks = [];
    let recognizedText = '';
    let isRecording = false;
    let isRealtimeMode = false; // 실시간 자막 모드
    let realtimeTimer = null; // 자동 녹음 타이머
    let accumulatedText = ''; // 누적 텍스트

    //=============================================================================
    // 키보드 매핑 설정
    //=============================================================================
    const keyCode = toggleKey.charCodeAt(0);
    Input.keyMapper[keyCode] = 'stt_toggle';

    //=============================================================================
    // Groq API 설정 로드
    //=============================================================================
    function getApiConfig() {
        if (typeof API_CONFIG !== 'undefined') {
            return API_CONFIG;
        }
        console.error('config.js 파일을 찾을 수 없거나 API_CONFIG가 정의되지 않았습니다.');
        console.error('js/config.js 파일에 API 키를 설정해주세요.');
        return null;
    }

    //=============================================================================
    // 실시간 모드 시작
    //=============================================================================
    function startRealtimeMode() {
        if (isRealtimeMode) {
            console.log('이미 실시간 모드입니다.');
            return;
        }

        isRealtimeMode = true;
        accumulatedText = '';
        console.log('실시간 자막 모드 시작');

        if (showWindow && SceneManager._scene instanceof Scene_Map) {
            SceneManager._scene.showSTTWindow('실시간 자막 모드 (V키로 종료)');
        }

        // 첫 녹음 시작
        startRecording();
    }

    //=============================================================================
    // 실시간 모드 종료
    //=============================================================================
    function stopRealtimeMode() {
        if (!isRealtimeMode) {
            return;
        }

        isRealtimeMode = false;

        // 타이머 정리
        if (realtimeTimer) {
            clearTimeout(realtimeTimer);
            realtimeTimer = null;
        }

        // 녹음 중이면 중지
        if (isRecording && mediaRecorder) {
            mediaRecorder.stop();
            isRecording = false;
        }

        console.log('실시간 자막 모드 종료');

        if (showWindow && SceneManager._scene instanceof Scene_Map) {
            SceneManager._scene.hideSTTWindow();
        }
    }

    //=============================================================================
    // 마이크 녹음 시작
    //=============================================================================
    async function startRecording() {
        if (isRecording) {
            console.log('이미 녹음 중입니다.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // 지원되는 오디오 타입 확인
            let options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/mp4' };
            }

            mediaRecorder = new MediaRecorder(stream, options);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunks, { type: mimeType });
                await sendToGroqAPI(audioBlob, mimeType);

                // 스트림 정리
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            isRecording = true;
            console.log('녹음이 시작되었습니다.');

            // 실시간 모드면 자동으로 일정 시간 후 종료
            if (isRealtimeMode) {
                realtimeTimer = setTimeout(() => {
                    stopRecording();
                }, recordingInterval);
            } else {
                if (showWindow && SceneManager._scene instanceof Scene_Map) {
                    SceneManager._scene.showSTTWindow('녹음 중... (V 키로 종료)');
                }
            }

        } catch (error) {
            console.error('마이크 접근 오류:', error);
            isRecording = false;

            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('마이크 접근 실패: ' + error.message);
                setTimeout(() => {
                    SceneManager._scene.hideSTTWindow();
                }, 3000);
            }
        }
    }

    //=============================================================================
    // 녹음 중지
    //=============================================================================
    function stopRecording() {
        if (!isRecording || !mediaRecorder) {
            console.log('녹음 중이 아닙니다.');
            return;
        }

        mediaRecorder.stop();
        isRecording = false;
        console.log('녹음이 종료되었습니다. 변환 중...');

        if (!isRealtimeMode && showWindow && SceneManager._scene instanceof Scene_Map) {
            SceneManager._scene.updateSTTWindow('음성을 텍스트로 변환 중...');
        }
    }

    //=============================================================================
    // Groq API로 오디오 전송
    //=============================================================================
    async function sendToGroqAPI(audioBlob, mimeType) {
        const config = getApiConfig();

        // 오디오 크기 확인
        if (!audioBlob || audioBlob.size === 0) {
            console.error('녹음된 오디오가 없습니다.');
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('녹음 실패: 오디오가 비어있습니다');
                setTimeout(() => {
                    SceneManager._scene.hideSTTWindow();
                }, 3000);
            }
            return;
        }

        if (audioBlob.size < 1000) {
            console.error('녹음 시간이 너무 짧습니다.');
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('녹음 시간이 너무 짧습니다 (최소 1초)');
                setTimeout(() => {
                    SceneManager._scene.hideSTTWindow();
                }, 3000);
            }
            return;
        }

        if (!config || !config.GROQ_API_KEY) {
            console.error('API 키가 설정되지 않았습니다.');
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('API 키 오류: config.js를 확인하세요');
                setTimeout(() => {
                    SceneManager._scene.hideSTTWindow();
                }, 3000);
            }
            return;
        }

        if (config.GROQ_API_KEY === "여기에_당신의_Groq_API_키_입력") {
            console.error('config.js에 실제 API 키를 입력해주세요.');
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('API 키를 입력해주세요');
                setTimeout(() => {
                    SceneManager._scene.hideSTTWindow();
                }, 3000);
            }
            return;
        }

        try {
            // MIME 타입에 따라 파일 확장자 결정
            const extension = mimeType.includes('webm') ? 'webm' :
                            mimeType.includes('mp4') ? 'mp4' : 'webm';

            const formData = new FormData();
            formData.append('file', audioBlob, `audio.${extension}`);
            formData.append('model', config.GROQ_MODEL);
            formData.append('language', language);
            formData.append('response_format', 'json');

            console.log('전송 중:', `audio.${extension}`, 'MIME:', mimeType, 'Size:', audioBlob.size);

            const response = await fetch(config.GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.GROQ_API_KEY}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API 오류 (${response.status}): ${errorText}`);
            }

            const result = await response.json();
            recognizedText = result.text || '';

            if (recognizedText) {
                // 실시간 모드면 텍스트 누적
                if (isRealtimeMode) {
                    accumulatedText += (accumulatedText ? ' ' : '') + recognizedText;
                    $gameVariables.setValue(variableId, accumulatedText);
                    console.log('인식 결과:', recognizedText);
                    console.log('누적 텍스트:', accumulatedText);

                    if (showWindow && SceneManager._scene instanceof Scene_Map) {
                        SceneManager._scene.updateSTTWindow(accumulatedText);
                    }

                    // 다시 녹음 시작
                    setTimeout(() => {
                        if (isRealtimeMode) {
                            startRecording();
                        }
                    }, 100);

                } else {
                    // 일반 모드
                    $gameVariables.setValue(variableId, recognizedText);
                    console.log('인식 결과:', recognizedText);

                    if (showWindow && SceneManager._scene instanceof Scene_Map) {
                        SceneManager._scene.updateSTTWindow('인식 완료: ' + recognizedText);
                        setTimeout(() => {
                            SceneManager._scene.hideSTTWindow();
                        }, 3000);
                    }
                }
            } else {
                console.log('인식된 텍스트가 없습니다.');

                if (isRealtimeMode) {
                    // 실시간 모드는 계속 녹음
                    setTimeout(() => {
                        if (isRealtimeMode) {
                            startRecording();
                        }
                    }, 100);
                } else {
                    if (showWindow && SceneManager._scene instanceof Scene_Map) {
                        SceneManager._scene.updateSTTWindow('음성을 인식하지 못했습니다.');
                        setTimeout(() => {
                            SceneManager._scene.hideSTTWindow();
                        }, 3000);
                    }
                }
            }

        } catch (error) {
            console.error('Groq API 오류:', error);

            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('API 오류: ' + error.message);
                setTimeout(() => {
                    SceneManager._scene.hideSTTWindow();
                }, 3000);
            }
        }
    }

    //=============================================================================
    // 녹음 토글
    //=============================================================================
    function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    //=============================================================================
    // 플러그인 커맨드
    //=============================================================================
    PluginManager.registerCommand(pluginName, 'startRecognition', args => {
        startRecording();
    });

    PluginManager.registerCommand(pluginName, 'stopRecognition', args => {
        stopRecording();
    });

    PluginManager.registerCommand(pluginName, 'showRecognizedText', args => {
        if (recognizedText) {
            $gameMessage.add(recognizedText);
        }
    });

    //=============================================================================
    // Window_STT - 음성 인식 텍스트 표시 창
    //=============================================================================
    class Window_STT extends Window_Base {
        initialize(rect) {
            super.initialize(rect);
            this._text = '음성 인식 중...';
            this.refresh();
        }

        setText(text) {
            if (this._text !== text) {
                this._text = text;
                this.refresh();
            }
        }

        refresh() {
            this.contents.clear();
            const rect = this.baseTextRect();
            this.drawTextEx(this._text, rect.x, rect.y, rect.width);
        }
    }

    window.Window_STT = Window_STT;

    //=============================================================================
    // Scene_Map - STT 창 표시 및 키 입력 처리
    //=============================================================================
    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.createSTTWindow();
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        this.updateSTTToggle();
    };

    Scene_Map.prototype.updateSTTToggle = function() {
        if (Input.isTriggered('stt_toggle')) {
            toggleRecording();
        }
    };

    Scene_Map.prototype.createSTTWindow = function() {
        const rect = this.sttWindowRect();
        this._sttWindow = new Window_STT(rect);
        this._sttWindow.hide();
        this.addWindow(this._sttWindow);
    };

    Scene_Map.prototype.sttWindowRect = function() {
        const ww = Graphics.boxWidth - 100;
        const wh = this.calcWindowHeight(2, false);
        const wx = 50;
        const wy = Graphics.boxHeight - wh - 50;
        return new Rectangle(wx, wy, ww, wh);
    };

    Scene_Map.prototype.showSTTWindow = function(text) {
        if (this._sttWindow) {
            this._sttWindow.show();
            this._sttWindow.setText(text || '음성 인식 중...');
        }
    };

    Scene_Map.prototype.updateSTTWindow = function(text) {
        if (this._sttWindow) {
            this._sttWindow.setText(text || '음성 인식 중...');
        }
    };

    Scene_Map.prototype.hideSTTWindow = function() {
        if (this._sttWindow) {
            this._sttWindow.hide();
        }
    };

})();
