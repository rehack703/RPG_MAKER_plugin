/*:
 * @target MZ
 * @plugindesc [Gemini API] Gemini API를 호출하여 텍스트를 생성하고 NPC 자동 대화 및 1:1 채팅을 지원합니다.
 * @author Your Name
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
 * @arg waitSwitchId
 * @text 대기 스위치 (선택)
 * @desc 이 스위치를 지정하면 응답 받을 때까지 ON, 완료되면 OFF
 * @type switch
 * @default 0
 *
 * @command registerNPC
 * @text NPC 등록
 * @desc NPC 정보를 등록합니다 (자동 대화 시스템용)
 *
 * @arg npcId
 * @text NPC ID
 * @desc NPC의 고유 ID (이벤트 ID와 동일하게 설정 권장)
 * @type number
 * @min 1
 * @default 1
 *
 * @arg name
 * @text 이름
 * @desc NPC의 이름
 * @type string
 * @default NPC
 *
 * @arg personality
 * @text 성격
 * @desc NPC의 성격 (예: 친절한, 무뚝뚝한, 수다스러운)
 * @type string
 * @default 평범한
 *
 * @arg background
 * @text 배경 설정
 * @desc NPC의 배경 설정 (예: 마을 상인, 베테랑 기사)
 * @type string
 * @default 일반인
 *
 * @command startChatWithNpc
 * @text NPC와 1:1 대화 시작
 * @desc 지정된 NPC와 1:1 대화를 시작하고 채팅 UI를 엽니다.
 *
 * @arg npcId
 * @text NPC ID
 * @desc 대화할 NPC의 ID (등록된 ID)
 * @type number
 * @min 1
 * @default 1
 *
 * @command endChatWithNpc
 * @text NPC와 1:1 대화 종료
 * @desc 현재 진행중인 1:1 대화를 종료합니다.
 *
 * @command speechToText
 * @text 음성 -> 텍스트 변환
 * @desc 마이크 입력을 텍스트로 변환하여 변수에 저장합니다.
 *
 * @arg variableId
 * @text 결과 저장 변수
 * @desc 변환된 텍스트를 저장할 변수 번호
 * @type variable
 * @default 1
 *
 * @help
 * ============================================================================
 * Gemini API Plugin - NPC 자동 대화 및 1:1 채팅
 * ============================================================================
 *
 * == 1:1 채팅 사용법 ==
 * 1. NPC 등록:
 *    이벤트 편집기에서 'NPC 등록' 플러그인 커맨드를 사용해 NPC 정보를 설정합니다.
 *    - NPC ID: 1, 이름: 촌장, 성격: 현명하고 말이 느림 등
 *
 * 2. 대화 시작:
 *    NPC와 대화하는 이벤트(예: 플레이어 접촉 시)에 'NPC와 1:1 대화 시작' 커맨드를 넣습니다.
 *    - NPC ID: 1 (등록한 NPC의 ID)
 *
 * 3. 대화 진행:
 *    게임 화면에 채팅창이 나타나면 텍스트를 입력하여 대화할 수 있습니다.
 *    'Escape' 키를 누르면 대화가 종료됩니다.
 *
 * 4. 대화 종료 (선택):
 *    'NPC와 1:1 대화 종료' 커맨드를 사용하여 이벤트를 통해 대화를 강제로 끝낼 수도 있습니다.
 *
 * == 기존 기능 ==
 * - Gemini 호출: 범용 Gemini API 호출
 * - NPC 등록: 자동 대화 또는 1:1 채팅에 사용할 NPC 정보 등록
 * - 음성 -> 텍스트 변환: 마이크 입력을 텍스트로 변환
 *
 * 자세한 설정 방법은 문서를 참고하세요.
 */

(function () {
  // NPC 데이터 저장소
  const npcData = {};

  // 1:1 채팅 대화 히스토리 (플레이어-NPC)
  const playerChatHistory = {};
  const MAX_PLAYER_CHAT_HISTORY = 10; // 플레이어와의 대화는 더 길게 기억

  //===========================================================================
  // 1:1 채팅 UI 및 로직
  //===========================================================================
  let chatState = {
    isActive: false,
    currentNpcId: null,
    uiElements: null,
    escapeListener: null
  };

  function createChatUI() {
    if (chatState.uiElements) return chatState.uiElements;

    const style = document.createElement('style');
    style.id = 'gemini-chat-style';
    style.innerHTML = `
      #gemini-chat-container {
        position: absolute;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        max-width: 800px;
        height: 300px;
        background-color: rgba(0, 0, 0, 0.7);
        border: 2px solid #fff;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        z-index: 100;
      }
      #gemini-chat-log {
        flex-grow: 1;
        overflow-y: auto;
        padding: 10px;
        font-family: 'GameFont', sans-serif;
        font-size: 18px;
        color: #fff;
        line-height: 1.5;
      }
      .chat-message { margin-bottom: 8px; }
      .chat-player { color: #87CEEB; } /* SkyBlue */
      .chat-npc { color: #FFD700; } /* Gold */
      #gemini-chat-input {
        border: none;
        border-top: 2px solid #fff;
        background-color: #000;
        color: #fff;
        padding: 10px;
        font-family: 'GameFont', sans-serif;
        font-size: 20px;
        outline: none;
      }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'gemini-chat-container';

    const log = document.createElement('div');
    log.id = 'gemini-chat-log';

    const input = document.createElement('input');
    input.id = 'gemini-chat-input';
    input.type = 'text';
    input.placeholder = '메시지를 입력하고 Enter를 누르세요...';
    input.onkeydown = handleChatInput;

    container.appendChild(log);
    container.appendChild(input);
    document.body.appendChild(container);

    // 게임 컨트롤 비활성화
    Input.clear();
    $gameSystem.disableMenu();
    $gameSystem.disableSave();


    chatState.uiElements = { container, log, input, style };
    return chatState.uiElements;
  }

  function destroyChatUI() {
    if (!chatState.uiElements) return;

    document.body.removeChild(chatState.uiElements.container);
    document.head.removeChild(chatState.uiElements.style);
    chatState.uiElements = null;
    chatState.isActive = false;

    // 게임 컨트롤 활성화
    $gameSystem.enableMenu();
    $gameSystem.enableSave();
  }

  function addMessageToLog(sender, text, senderType) {
    if (!chatState.uiElements) return;
    const { log } = chatState.uiElements;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', `chat-${senderType}`);
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    log.appendChild(messageDiv);
    log.scrollTop = log.scrollHeight;
  }

  function handleChatInput(event) {
    if (event.key === 'Enter') {
      const input = event.target;
      const message = input.value.trim();
      if (message && chatState.currentNpcId) {
        addMessageToLog('나', message, 'player');
        sendChatMessage(message, chatState.currentNpcId);
        input.value = '';
      }
      event.stopPropagation(); // 게임 엔진으로 이벤트 전파 방지
    }
  }

  function buildPlayerChatPrompt(npcId, playerMessage) {
    const npc = npcData[npcId];
    if (!npc) return "오류: NPC 정보를 찾을 수 없습니다.";

    const history = getPlayerChatHistory(npcId);
    const historyText = history.length > 0
      ? history.map(h => `${h.speaker}: ${h.text}`).join('\n')
      : "(대화 시작)";

    return `당신은 TRPG 게임의 NPC인 '${npc.name}'입니다.
당신의 정보는 다음과 같습니다:
- 성격: ${npc.personality}
- 배경: ${npc.background}

당신은 지금 플레이어와 대화하고 있습니다.
플레이어에게 자연스럽게 응답하세요.

--- 이전 대화 ---
${historyText}
---

플레이어의 마지막 말: "${playerMessage}"

이제 '${npc.name}'으로서 당신의 차례입니다. 한두 문장의 짧은 대답만 생성하세요.
(다른 설명이나 이름 없이 오직 대사만 출력하세요.)`;
  }

  function sendChatMessage(message, npcId) {
    const npc = npcData[npcId];
    if (!npc) return;

    // 히스토리에 플레이어 메시지 추가
    addPlayerChatHistory(npcId, '플레이어', message);
    addMessageToLog(npc.name, '...', 'npc'); // 로딩 표시

    const prompt = buildPlayerChatPrompt(npcId, message);

    const MODEL_NAME = "gemini-2.5-flash";
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GeminiConfig.API_KEY}`;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.text()))
    .then(data => {
      const npcResponse = data.candidates[0].content.parts[0].text.trim();
      // 히스토리에 NPC 응답 추가
      addPlayerChatHistory(npcId, npc.name, npcResponse);

      // '...' 메시지 업데이트
      const lastMsg = chatState.uiElements.log.lastChild;
      if (lastMsg.innerText.includes('...')) {
        lastMsg.innerHTML = `<strong>${npc.name}:</strong> ${npcResponse}`;
      } else { // 혹시 모르니 안전장치
        addMessageToLog(npc.name, npcResponse, 'npc');
      }
    })
    .catch(error => {
      console.error("[Gemini] 1:1 채팅 오류:", error);
      const lastMsg = chatState.uiElements.log.lastChild;
      if (lastMsg.innerText.includes('...')) {
        lastMsg.innerHTML = `<strong>${npc.name}:</strong> (오류가 발생했습니다.)`;
      }
    });
  }

  function getPlayerChatHistory(npcId) {
    return playerChatHistory[npcId] || [];
  }

  function addPlayerChatHistory(npcId, speaker, text) {
    if (!playerChatHistory[npcId]) {
      playerChatHistory[npcId] = [];
    }
    const history = playerChatHistory[npcId];
    history.push({ speaker, text });
    if (history.length > MAX_PLAYER_CHAT_HISTORY) {
      history.shift();
    }
  }

  function endChat() {
      if (!chatState.isActive) return;
      console.log('[Gemini] 1:1 채팅 종료');
      destroyChatUI();
      chatState.isActive = false;
      chatState.currentNpcId = null;
      if (chatState.escapeListener) {
          document.removeEventListener('keydown', chatState.escapeListener);
          chatState.escapeListener = null;
      }
  }


  //===========================================================================
  // 음성 인식 (기존 코드)
  //===========================================================================
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;

  function initializeSpeechRecognition() {
    if (!SpeechRecognition) {
      console.error("[Gemini] 이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      const variableId = recognition.variableId;
      if (variableId) {
        $gameVariables.setValue(variableId, text);
      }
    };
    recognition.onerror = (event) => console.error(`[Gemini] 음성 인식 오류: ${event.error}`);
  }
  initializeSpeechRecognition();


  //===========================================================================
  // 플러그인 커맨드
  //===========================================================================
  PluginManager.registerCommand("Gemini_API_Plugin", "registerNPC", (args) => {
    const npcId = Number(args.npcId);
    npcData[npcId] = {
      name: String(args.name),
      personality: String(args.personality),
      background: String(args.background)
    };
    console.log(`[Gemini] NPC 등록: ID=${npcId}, 이름=${args.name}`);
  });

  PluginManager.registerCommand("Gemini_API_Plugin", "startChatWithNpc", (args) => {
    const npcId = Number(args.npcId);
    if (!npcData[npcId]) {
      console.error(`[Gemini] 채팅 시작 오류: NPC ID ${npcId}가 등록되지 않았습니다.`);
      return;
    }
    if (chatState.isActive) {
        endChat(); // 기존 채팅이 있다면 종료
    }

    console.log(`[Gemini] ${npcData[npcId].name}(와)과 1:1 채팅 시작`);
    chatState.isActive = true;
    chatState.currentNpcId = npcId;
    const ui = createChatUI();
    ui.input.focus();

    // 초기 인사말
    const initialMessage = `안녕하세요! 저는 ${npcData[npcId].name}입니다. 무엇을 도와드릴까요?`;
    addMessageToLog(npcData[npcId].name, initialMessage, 'npc');
    addPlayerChatHistory(npcId, npcData[npcId].name, initialMessage);

    // Escape 키로 종료하는 리스너 추가
    chatState.escapeListener = (e) => {
        if (e.key === 'Escape') {
            endChat();
            e.preventDefault();
        }
    };
    document.addEventListener('keydown', chatState.escapeListener, true); // true로 캡처링 단계에서 처리
  });

  PluginManager.registerCommand("Gemini_API_Plugin", "endChatWithNpc", (args) => {
      endChat();
  });


  PluginManager.registerCommand("Gemini_API_Plugin", "speechToText", (args) => {
    if (!recognition) {
      $gameMessage.add("음성 인식이 지원되지 않는 환경입니다.");
      return;
    }
    recognition.variableId = Number(args.variableId);
    try {
      recognition.start();
    } catch (e) {
      console.error("[Gemini] 음성 인식 시작 오류:", e);
    }
  });

  PluginManager.registerCommand("Gemini_API_Plugin", "callGemini", (args) => {
    const variableId = Number(args.variableId);
    const waitSwitchId = Number(args.waitSwitchId);
    if (waitSwitchId > 0) $gameSwitches.setValue(waitSwitchId, true);

    const MODEL_NAME = "gemini-2.5-flash";
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GeminiConfig.API_KEY}`;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: args.prompt }] }] })
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.text()))
    .then(data => {
      const text = data.candidates[0].content.parts[0].text;
      $gameVariables.setValue(variableId, text);
    })
    .catch(error => {
      console.error("[Gemini] API 호출 오류:", error);
      $gameVariables.setValue(variableId, "API 호출 중 오류 발생");
    })
    .finally(() => {
      if (waitSwitchId > 0) $gameSwitches.setValue(waitSwitchId, false);
    });
  });

})();
