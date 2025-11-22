//=============================================================================
// SpeechToText.js (통합 버전)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Groq API 또는 브라우저 내장 API를 사용하여 음성을 텍스트로 변환합니다.
 * @author YourName
 * @url https://github.com/yourusername/SpeechToText
 *
 * @help SpeechToText.js
 *
 * 이 플러그인은 음성을 텍스트로 변환하는 두 가지 방법을 제공합니다.
 * 1. Groq Whisper API: 고품질의 인식이 필요할 때 사용 (API 키 필요)
 * 2. 브라우저 내장 API: 별도 설정 없이 간편하게 사용 (인식 품질은 브라우저에 따라 다름)
 *
 * ============================================================================
 * 설정 방법
 * ============================================================================
 *
 * 1. 플러그인 매니저에서 `apiProvider`를 선택합니다.
 *    - 'Groq' 선택 시: 프로젝트 루트의 `config.js` 파일에 Groq API 키를 입력해야 합니다.
 *    - 'Browser' 선택 시: 별도 설정이 필요 없습니다.
 * 2. 플러그인을 활성화합니다.
 * 3. 토글 키(기본값: V)를 눌러 녹음 시작/종료.
 *
 * ============================================================================
 * 플러그인 커맨드
 * ============================================================================
 *
 * startRecognition - 음성 녹음/인식을 시작합니다.
 * stopRecognition - 음성 녹음/인식을 중지합니다. (Groq 모드 전용)
 * showRecognizedText - 마지막으로 인식된 텍스트를 메시지 창에 표시합니다.
 *
 * ============================================================================
 * 주요 기능
 * ============================================================================
 *
 * - Groq Whisper API 또는 브라우저 내장 음성 인식 엔진 선택 가능
 * - 키보드 단축키로 녹음 ON/OFF
 * - 실시간 녹음 상태 화면 표시
 * - 인식된 텍스트 자동 저장
 *
 * @param apiProvider
 * @text API Provider
 * @desc 사용할 음성 인식 API (Groq 또는 Browser)
 * @type select
 * @option Groq API (고품질)
 * @value Groq
 * @option Browser API (간편)
 * @value Browser
 * @default Groq
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
 * @desc 음성 녹음/인식을 시작합니다.
 *
 * @command stopRecognition
 * @text 음성 녹음 중지
 * @desc 음성 녹음을 중지하고 텍스트로 변환합니다. (Groq 모드에서 유효)
 *
 * @command showRecognizedText
 * @text 인식된 텍스트 표시
 * @desc 인식된 텍스트를 메시지 창에 표시합니다.
 */

(() => {
    'use strict';

    const pluginName = 'SpeechToText';
    const parameters = PluginManager.parameters(pluginName);
    const apiProvider = String(parameters['apiProvider'] || 'Groq');
    const variableId = Number(parameters['variableId'] || 1);
    const language = String(parameters['language'] || 'ko'); // ko-KR 형식 유지
    const showWindow = parameters['showWindow'] === 'true';
    const toggleKey = String(parameters['toggleKey'] || 'V').toUpperCase();
    const recordingInterval = 2000;

    let isRecording = false;
    let recognizedText = '';
    
    // Groq API 관련 변수
    let mediaRecorder = null;
    let audioChunks = [];
    let isRealtimeMode = false;
    let realtimeTimer = null;
    let accumulatedText = '';

    // Browser API 관련 변수
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let browserRecognition = null;

    //=============================================================================
    // 초기화
    //=============================================================================
    function initialize() {
        if (apiProvider === 'Browser') {
            initializeBrowserRecognition();
        }
        const keyCode = toggleKey.charCodeAt(0);
        Input.keyMapper[keyCode] = 'stt_toggle';
    }

    //=============================================================================
    // API 설정 로드 (Groq 전용)
    //=============================================================================
    function getApiConfig() {
        if (typeof GroqConfig !== 'undefined') {
            return GroqConfig;
        }
        console.error('[SpeechToText-Groq] GroqConfig를 찾을 수 없습니다. 프로젝트 루트의 config.js 파일을 확인하세요.');
        console.error('[SpeechToText-Groq] config.js 파일에 GroqConfig.GROQ_API_KEY를 설정해주세요.');
        return null;
    }

    //=============================================================================
    // 브라우저 내장 음성 인식 초기화
    //=============================================================================
    function initializeBrowserRecognition() {
        if (!SpeechRecognition) {
            console.error("[SpeechToText] 이 브라우저는 음성 인식을 지원하지 않습니다.");
            return;
        }
        browserRecognition = new SpeechRecognition();
        browserRecognition.lang = language;
        browserRecognition.interimResults = false;
        browserRecognition.maxAlternatives = 1;

        browserRecognition.onstart = () => {
            isRecording = true;
            console.log('[SpeechToText-Browser] 인식 시작.');
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.showSTTWindow('음성 인식 중...');
            }
        };

        browserRecognition.onend = () => {
            isRecording = false;
            console.log('[SpeechToText-Browser] 인식 종료.');
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                // 약간의 딜레이 후 창을 숨겨 메시지를 확인할 시간을 줌
                setTimeout(() => SceneManager._scene.hideSTTWindow(), 2000);
            }
        };

        browserRecognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            recognizedText = text;
            $gameVariables.setValue(variableId, text);
            console.log('[SpeechToText-Browser] 인식 결과:', text);
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('인식 완료: ' + text);
            }
        };

        browserRecognition.onerror = (event) => {
            console.error(`[SpeechToText-Browser] 음성 인식 오류: ${event.error}`);
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow(`오류: ${event.error}`);
            }
        };
    }

    //=============================================================================
    // 음성 인식 시작 (통합)
    //=============================================================================
    function startRecognition() {
        if (isRecording) {
            console.log('이미 인식/녹음 중입니다.');
            return;
        }
        if (apiProvider === 'Groq') {
            startGroqRecording();
        } else if (apiProvider === 'Browser') {
            startBrowserRecognition();
        }
    }

    //=============================================================================
    // 음성 인식 중지 (통합)
    //=============================================================================
    function stopRecognition() {
        if (!isRecording) {
            console.log('인식/녹음 중이 아닙니다.');
            return;
        }
        if (apiProvider === 'Groq') {
            stopGroqRecording();
        } else if (apiProvider === 'Browser') {
            stopBrowserRecognition();
        }
    }

    //=============================================================================
    // 토글 핸들러
    //=============================================================================
    function toggleRecording() {
        if (isRecording) {
            // Browser API는 자동 종료되므로 stop 호출은 주로 Groq을 위함
            if (apiProvider === 'Groq') {
                stopRecognition();
            }
        } else {
            startRecognition();
        }
    }
    
    //=============================================================================
    // 브라우저 API 호출
    //=============================================================================
    function startBrowserRecognition() {
        if (!browserRecognition) {
             $gameMessage.add("음성 인식이 지원되지 않는 환경입니다.");
            console.error('[SpeechToText-Browser] 음성 인식이 초기화되지 않았습니다.');
            return;
        }
        try {
            browserRecognition.start();
        } catch (e) {
            // NotAllowedError는 사용자가 권한을 거부했을 때 발생.
            // InvalidStateError는 이미 실행 중일 때 발생.
            if (e.name === 'InvalidStateError') {
                 console.log('[SpeechToText-Browser] 이미 인식이 진행 중입니다.');
            } else {
                 console.error("[SpeechToText-Browser] 음성 인식 시작 오류:", e);
                 isRecording = false; // 상태 동기화
            }
        }
    }

    function stopBrowserRecognition() {
        if (browserRecognition) {
            browserRecognition.stop();
        }
    }

    //=============================================================================
    // Groq API 용 녹음 시작 (기존 startRecording)
    //=============================================================================
    async function startGroqRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            let options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported('audio/webm')) options = { mimeType: 'audio/mp4' };

            mediaRecorder = new MediaRecorder(stream, options);
            audioChunks = [];
            mediaRecorder.ondataavailable = e => e.data.size > 0 && audioChunks.push(e.data);
            mediaRecorder.onstop = async () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunks, { type: mimeType });
                stream.getTracks().forEach(track => track.stop());
                await sendToGroqAPI(audioBlob, mimeType);
            };

            mediaRecorder.start();
            isRecording = true;
            console.log('[SpeechToText-Groq] 녹음 시작.');
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.showSTTWindow('녹음 중... (V 키로 종료)');
            }
        } catch (error) {
            console.error('[SpeechToText-Groq] 마이크 접근 오류:', error);
            isRecording = false;
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('마이크 접근 실패: ' + error.message);
                setTimeout(() => SceneManager._scene.hideSTTWindow(), 3000);
            }
        }
    }

    //=============================================================================
    // Groq API 용 녹음 중지 (기존 stopRecording)
    //=============================================================================
    function stopGroqRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            isRecording = false;
            console.log('[SpeechToText-Groq] 녹음 종료. 변환 중...');
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('음성을 텍스트로 변환 중...');
            }
        }
    }

    //=============================================================================
    // Groq API로 오디오 전송 (기존과 거의 동일)
    //=============================================================================
    async function sendToGroqAPI(audioBlob, mimeType) {
        const config = getApiConfig();
        if (!config || !config.GROQ_API_KEY || config.GROQ_API_KEY === "YOUR_GROQ_API_KEY") {
            console.error('[SpeechToText-Groq] Groq API 키 (GroqConfig.GROQ_API_KEY)가 설정되지 않았습니다.');
            if (showWindow) SceneManager._scene.updateSTTWindow('API 키 오류: config.js를 확인하세요');
            return;
        }
        if (audioBlob.size < 1000) {
            console.warn('녹음 시간이 너무 짧습니다.');
            if (showWindow) SceneManager._scene.updateSTTWindow('녹음 시간이 너무 짧습니다');
            return;
        }

        try {
            const extension = mimeType.includes('webm') ? 'webm' : 'mp4';
            const formData = new FormData();
            formData.append('file', audioBlob, `audio.${extension}`);
            formData.append('model', config.GROQ_MODEL);
            formData.append('language', language.split('-')[0]); // Groq는 'ko' 형식 사용
            formData.append('response_format', 'json');
            
            const response = await fetch(config.GROQ_API_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${config.GROQ_API_KEY}` },
                body: formData
            });

            if (!response.ok) throw new Error(`API 오류 (${response.status}): ${await response.text()}`);

            const result = await response.json();
            recognizedText = result.text || '';
            $gameVariables.setValue(variableId, recognizedText);
            console.log('[SpeechToText-Groq] 인식 결과:', recognizedText);

            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('인식 완료: ' + recognizedText);
                setTimeout(() => SceneManager._scene.hideSTTWindow(), 3000);
            }
        } catch (error) {
            console.error('[SpeechToText-Groq] API 오류:', error);
            if (showWindow && SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.updateSTTWindow('API 오류: ' + error.message);
                setTimeout(() => SceneManager._scene.hideSTTWindow(), 3000);
            }
        }
    }
    
    //=============================================================================
    // 플러그인 커맨드
    //=============================================================================
    PluginManager.registerCommand(pluginName, 'startRecognition', () => startRecognition());
    PluginManager.registerCommand(pluginName, 'stopRecognition', () => stopRecognition());
    PluginManager.registerCommand(pluginName, 'showRecognizedText', () => {
        if (recognizedText) {
            $gameMessage.add(recognizedText);
        }
    });

    //=============================================================================
    // Window_STT (기존과 동일)
    //=============================================================================
    class Window_STT extends Window_Base {
        initialize(rect) {
            super.initialize(rect);
            this._text = '...';
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
    // Scene_Map - STT 창 및 키 입력 처리 (수정됨)
    //=============================================================================
    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        if (showWindow) this.createSTTWindow();
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
        if (!showWindow || !this._sttWindow) return;
        this._sttWindow.show();
        this._sttWindow.setText(text || '...');
    };

    Scene_Map.prototype.updateSTTWindow = function(text) {
        if (!showWindow || !this._sttWindow) return;
        this._sttWindow.setText(text || '...');
    };

    Scene_Map.prototype.hideSTTWindow = function() {
        if (!showWindow || !this._sttWindow) return;
        this._sttWindow.hide();
    };
    
    // 플러그인 초기화 실행
    initialize();

})();
