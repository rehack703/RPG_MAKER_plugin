/*:
 * @target MZ
 * @plugindesc [Gemini API] Gemini API를 호출하여 텍스트를 생성하고 NPC 자동 대화 및 1:1 채팅을 지원합니다.
 * @author Your Name
 *
 * @help
 * ============================================================================
 * Gemini API Plugin - NPC 자동 대화 및 1:1 채팅
 * ============================================================================
 *
 * 이 플러그인은 Gemini API를 사용하여 다양한 기능을 제공합니다.
 * API 키는 프로젝트 루트의 config.js 파일에 설정해야 합니다.
 *
 * == config.js 설정 예시 ==
 * var GeminiConfig = {
 *   API_KEY: "YOUR_GEMINI_API_KEY"
 * };
 *
 * == 1:1 채팅 사용법 ==
 * 1. NPC 등록: 'NPC 등록' 플러그인 커맨드를 사용해 NPC 정보를 설정합니다.
 * 2. 대화 시작: 'NPC와 1:1 대화 시작' 커맨드를 사용합니다.
 * 3. 대화 진행: 채팅창에 텍스트를 입력하여 대화합니다. 'Escape' 키로 종료합니다.
 *
 * == 기능 ==
 * - Gemini 호출: 범용 Gemini API 호출
 * - NPC 등록: 자동 대화 또는 1:1 채팅에 사용할 NPC 정보 등록
 * - 1:1 채팅: NPC와 실시간으로 대화
 *
 * @command callGemini
 * @text Gemini 호출
 * @desc Gemini API를 호출하고 결과를 변수에 저장합니다.
 *
 * @arg prompt
 * @text 프롬프트
 * @desc Gemini에게 보낼 질문/요청
 * @type string
 *
 * @arg variableId
 * @text 결과 저장 변수
 * @desc 결과를 저장할 변수 번호
 * @type variable
 * @default 1
 *
 * @command registerNPC
 * @text NPC 등록
 * @desc NPC 정보를 등록합니다 (자동 대화 시스템용)
 * @arg npcId @text NPC ID @type number @min 1 @default 1
 * @arg name @text 이름 @type string @default NPC
 * @arg personality @text 성격 @type string @default 평범한
 * @arg background @text 배경 설정 @type string @default 일반인
 *
 * @command startChatWithNpc
 * @text NPC와 1:1 대화 시작
 * @desc 지정된 NPC와 1:1 대화를 시작하고 채팅 UI를 엽니다.
 * @arg npcId @text NPC ID @type number @min 1 @default 1
 *
 * @command endChatWithNpc
 * @text NPC와 1:1 대화 종료
 * @desc 현재 진행중인 1:1 대화를 종료합니다.
 */

const pluginName = "Gemini_API_Plugin";

(() => {
    'use strict';

    //===========================================================================
    // GeminiAPI: API 호출 및 키 관리
    //===========================================================================
    const GeminiAPI = {
        getApiKey() {
            if (typeof GeminiConfig !== 'undefined' && GeminiConfig.API_KEY) {
                return GeminiConfig.API_KEY;
            }
            console.error('[Gemini] API 키를 찾을 수 없습니다. 프로젝트 루트의 config.js 파일을 확인하세요.');
            $gameMessage.add('Gemini API 키 (GeminiConfig.API_KEY)가 설정되지 않았습니다.');
            return null;
        },

        async call(prompt) {
            const API_KEY = this.getApiKey();
            if (!API_KEY) return Promise.reject("API Key not found");

            const MODEL_NAME = "gemini-1.5-flash";
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API 오류 (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text.trim();
        }
    };

    //===========================================================================
    // GeminiChatUI: 채팅 UI 생성, 제거 및 조작
    //===========================================================================
    class GeminiChatUI {
        constructor() {
            this._elements = null;
            this._inputHandler = null;
            this._closeHandler = null;
        }

        create() {
            if (this._elements) return;

            this._createStyles();
            this._createContainer();
            this._createBlocker();

            Input.clear();
            $gameSystem.disableMenu();
            $gameSystem.disableSave();
        }

        destroy() {
            if (!this._elements) return;
            Object.values(this._elements).forEach(el => el.remove());
            this._elements = null;

            if (this._closeHandler) {
                document.removeEventListener('keydown', this._closeHandler, true);
            }

            $gameSystem.enableMenu();
            $gameSystem.enableSave();
        }
        
        addMessage(sender, text, senderType) {
            if (!this._elements) return null;
            const { log } = this._elements;
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message', `chat-${senderType}`);
            messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
            log.appendChild(messageDiv);
            log.scrollTop = log.scrollHeight;
            return messageDiv;
        }

        updateMessage(element, sender, text) {
             if (element) {
                element.innerHTML = `<strong>${sender}:</strong> ${text}`;
             }
        }
        
        setInputHandler(handler) {
            this._inputHandler = handler;
        }

        setCloseHandler(handler) {
            this._closeHandler = handler;
            document.addEventListener('keydown', this._closeHandler, true);
        }

        focusInput() {
            this._elements?.input.focus();
        }

        _createStyles() {
            const style = document.createElement('style');
            style.id = 'gemini-chat-style';
            style.innerHTML = `
              #gemini-chat-container {
                position: absolute; bottom: 50px; left: 50%;
                transform: translateX(-50%); width: 80%; max-width: 800px; height: 300px;
                background-color: rgba(0, 0, 0, 0.7); border: 2px solid #fff;
                border-radius: 10px; display: flex; flex-direction: column; z-index: 100;
              }
              #gemini-chat-log {
                flex-grow: 1; overflow-y: auto; padding: 10px;
                font-family: 'GameFont', sans-serif; font-size: 18px;
                color: #fff; line-height: 1.5;
              }
              .chat-message { margin-bottom: 8px; }
              .chat-player { color: #87CEEB; }
              .chat-npc { color: #FFD700; }
              #gemini-chat-input {
                border: none; border-top: 2px solid #fff; background-color: #000;
                color: #fff; padding: 10px; font-family: 'GameFont', sans-serif;
                font-size: 20px; outline: none;
              }
            `;
            document.head.appendChild(style);
            this._elements = { style };
        }

        _createContainer() {
            const container = document.createElement('div');
            container.id = 'gemini-chat-container';
            const log = document.createElement('div');
            log.id = 'gemini-chat-log';
            const input = document.createElement('input');
            input.id = 'gemini-chat-input';
            input.type = 'text';
            input.placeholder = '메시지를 입력하고 Enter를 누르세요...';
            input.onkeydown = (e) => {
                if (e.key === 'Enter' && this._inputHandler) {
                    this._inputHandler(input.value);
                    input.value = '';
                    e.stopPropagation();
                }
            };
            container.append(log, input);
            document.body.appendChild(container);
            Object.assign(this._elements, { container, log, input });
        }

        _createBlocker() {
            const blocker = document.createElement('div');
            blocker.id = 'gemini-chat-blocker';
            blocker.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 99;';
            document.body.appendChild(blocker);
            this._elements.blocker = blocker;
        }
    }

    //===========================================================================
    // GeminiChatSession: 단일 채팅 세션의 로직 관리
    //===========================================================================
    class GeminiChatSession {
        constructor(npcId, manager) {
            this._npcId = npcId;
            this._manager = manager;
            this._ui = new GeminiChatUI();
        }

        start() {
            const npc = this._manager.getNpc(this._npcId);
            console.log(`[Gemini] ${npc.name}(와)과 1:1 채팅 시작`);

            this._ui.create();
            this._ui.setInputHandler((message) => this.sendMessage(message));
            this._ui.setCloseHandler((e) => {
                if (e.key === 'Escape') {
                    this._manager.end();
                    e.preventDefault();
                }
            });
            this._ui.focusInput();
            
            const initialMessage = `안녕하세요! 저는 ${npc.name}입니다. 무엇을 도와드릴까요?`;
            this._ui.addMessage(npc.name, initialMessage, 'npc');
            this._manager.addHistory(this._npcId, npc.name, initialMessage);
        }

        end() {
            console.log('[Gemini] 1:1 채팅 종료');
            this._ui.destroy();
        }

        async sendMessage(playerMessage) {
            const message = playerMessage.trim();
            if (!message) return;

            const npc = this._manager.getNpc(this._npcId);
            
            this._ui.addMessage('나', message, 'player');
            this._manager.addHistory(this._npcId, '플레이어', message);

            const loadingMessage = this._ui.addMessage(npc.name, '...', 'npc');

            try {
                const prompt = this._buildPrompt(playerMessage);
                const npcResponse = await GeminiAPI.call(prompt);
                this._manager.addHistory(this._npcId, npc.name, npcResponse);
                this._ui.updateMessage(loadingMessage, npc.name, npcResponse);
            } catch (error) {
                console.error("[Gemini] 1:1 채팅 오류:", error);
                this._ui.updateMessage(loadingMessage, npc.name, '(오류가 발생했습니다. 콘솔을 확인하세요.)');
            }
        }

        _buildPrompt(playerMessage) {
            const npc = this._manager.getNpc(this._npcId);
            const history = this._manager.getHistory(this._npcId);
            const historyText = history.length > 0
                ? history.map(h => `${h.speaker}: ${h.text}`).join('\n')
                : "(대화 시작)";

            return `당신은 TRPG 게임의 NPC인 '${npc.name}'입니다.
당신의 정보: 성격: ${npc.personality}, 배경: ${npc.background}.
자연스럽게 응답하세요.
--- 이전 대화 ---
${historyText}
---
플레이어의 마지막 말: "${playerMessage}"
이제 '${npc.name}'으로서 당신의 차례입니다. 한두 문장의 짧은 대답만 생성하세요. (이름 없이 대사만 출력)`;
        }
    }

    //===========================================================================
    // GeminiChatManager: 채팅 상태 및 세션 전역 관리
    //===========================================================================
    const GeminiChatManager = {
        _npcData: {},
        _chatHistory: {},
        _currentSession: null,
        MAX_HISTORY: 10,

        registerNpc(npc) {
            this._npcData[npc.id] = npc;
            console.log(`[Gemini] NPC 등록: ID=${npc.id}, 이름=${npc.name}`);
        },

        getNpc(npcId) {
            return this._npcData[npcId];
        },
        
        getHistory(npcId) {
            return this._chatHistory[npcId] || [];
        },
        
        addHistory(npcId, speaker, text) {
            if (!this._chatHistory[npcId]) this._chatHistory[npcId] = [];
            const history = this._chatHistory[npcId];
            history.push({ speaker, text });
            if (history.length > this.MAX_HISTORY) history.shift();
        },

        start(npcId) {
            if (!this._npcData[npcId]) {
                console.error(`[Gemini] 채팅 시작 오류: NPC ID ${npcId}가 등록되지 않았습니다.`);
                return;
            }
            if (this._currentSession) {
                this.end();
            }
            this._currentSession = new GeminiChatSession(npcId, this);
            this._currentSession.start();
        },

        end() {
            if (this._currentSession) {
                this._currentSession.end();
                this._currentSession = null;
            }
        }
    };

    //===========================================================================
    // 플러그인 커맨드
    //===========================================================================
    PluginManager.registerCommand(pluginName, "registerNPC", (args) => {
        GeminiChatManager.registerNpc({
            id: Number(args.npcId),
            name: String(args.name),
            personality: String(args.personality),
            background: String(args.background)
        });
    });

    PluginManager.registerCommand(pluginName, "startChatWithNpc", (args) => {
        GeminiChatManager.start(Number(args.npcId));
    });

    PluginManager.registerCommand(pluginName, "endChatWithNpc", () => {
        GeminiChatManager.end();
    });

    PluginManager.registerCommand(pluginName, "callGemini", async (args) => {
        const variableId = Number(args.variableId);
        try {
            const result = await GeminiAPI.call(args.prompt);
            $gameVariables.setValue(variableId, result);
        } catch (error) {
            console.error("[Gemini] API 호출 오류:", error);
            $gameVariables.setValue(variableId, "API 호출 중 오류 발생");
        }
    });

})();
