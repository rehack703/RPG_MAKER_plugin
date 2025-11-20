/*:
 * @target MZ
 * @plugindesc [Gemini API] Gemini API를 호출하여 텍스트를 생성하고 NPC 자동 대화를 지원합니다.
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
 * @desc NPC의 고유 ID (1, 2, 3...)
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
 * @command npcChat
 * @text NPC 대화
 * @desc 두 NPC 간의 대화를 생성합니다
 *
 * @arg npc1Id
 * @text NPC 1 ID
 * @desc 첫 번째 NPC ID
 * @type number
 * @min 1
 * @default 1
 *
 * @arg npc2Id
 * @text NPC 2 ID
 * @desc 두 번째 NPC ID
 * @type number
 * @min 1
 * @default 2
 *
 * @arg turnOwner
 * @text 차례
 * @desc 누구의 차례인지 (1 = NPC1, 2 = NPC2)
 * @type select
 * @option NPC 1
 * @value 1
 * @option NPC 2
 * @value 2
 * @default 1
 *
 * @arg resultVar
 * @text 결과 변수
 * @desc 대화 결과를 저장할 변수
 * @type variable
 * @default 10
 *
 * @arg distanceCheck
 * @text 거리 체크
 * @desc 플레이어와의 거리를 체크할지 여부
 * @type boolean
 * @default true
 *
 * @arg maxDistance
 * @text 최대 거리
 * @desc 플레이어와의 최대 거리 (타일)
 * @type number
 * @min 1
 * @default 7
 *
 * @arg autoDisplay
 * @text 자동 말풍선 표시
 * @desc 대화 결과를 자동으로 말풍선으로 표시
 * @type boolean
 * @default true
 *
 * @arg pictureId
 * @text 픽처 번호
 * @desc 말풍선에 사용할 픽처 번호 (NPC마다 다른 번호 사용)
 * @type number
 * @min 1
 * @max 100
 * @default 1
 *
 * @arg displayDuration
 * @text 표시 시간
 * @desc 말풍선 표시 시간 (프레임, 60=1초)
 * @type number
 * @min 1
 * @default 180
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
 * Gemini API Plugin - NPC 자동 대화 시스템
 * ============================================================================
 *
 * == 기본 사용법 ==
 *   플러그인 커맨드: Gemini 호출
 *     - 프롬프트: "재밌는 농담 해줘"
 *     - 변수: 1
 *     - 스위치: 0
 *
 * == 음성 -> 텍스트 변환 ==
 *   플러그인 커맨드: 음성 -> 텍스트 변환
 *     - 변수: 1
 *   이후, 마이크에 대고 말하면 변환된 텍스트가 지정된 변수에 저장됩니다.
 *
 * == NPC 자동 대화 시스템 ==
 * 1. NPC 등록:
 *    플러그인 커맨드: NPC 등록
 *      - NPC ID: 1
 *      - 이름: 상인
 *      - 성격: 친절하고 말이 많음
 *      - 배경: 마을에서 30년간 가게 운영
 *
 * 2. NPC 대화 생성:
 *    플러그인 커맨드: NPC 대화
 *      - NPC 1 ID: 1
 *      - NPC 2 ID: 2
 *      - 차례: NPC 1
 *      - 결과 변수: 10
 *      - 거리 체크: true
 *      - 최대 거리: 7
 *
 * 3. 대화 표시 (GabeMZ_MessagePlus 사용):
 *    메시지: <balloon: 1>
 *            <name: 상인>
 *            \V[10]
 *
 * 자세한 설정 방법은 SETUP_GUIDE.md를 참고하세요.
 */

(function () {
  // ⚠️ 보안 경고: 실제 키를 여기에 넣지 마세요. 테스트 목적으로만 사용하세요.
  const GEMINI_API_KEY = "";

  // NPC 데이터 저장소
  const npcData = {};

  // 대화 히스토리 저장소 (최근 5개 유지)
  const conversationHistory = {};
  const MAX_HISTORY = 5;

  //===========================================================================
  // 음성 인식 (Speech-to-Text)
  //===========================================================================
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;

  function initializeSpeechRecognition() {
    if (!SpeechRecognition) {
      console.error("[Gemini] 이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR'; // 한국어 설정
    recognition.interimResults = false; // 중간 결과는 받지 않음
    recognition.maxAlternatives = 1; // 가장 가능성 높은 결과 하나만 받음

    recognition.onstart = () => {
      console.log("[Gemini] 음성 인식 시작...");
      $gameMessage.add("음성 인식 시작...");
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      console.log(`[Gemini] 인식된 텍스트: ${text}`);
      const variableId = recognition.variableId;
      if (variableId) {
        $gameVariables.setValue(variableId, text);
        $gameMessage.add(`인식된 텍스트: ${text}`);
      }
    };

    recognition.onspeechend = () => {
      recognition.stop();
      console.log("[Gemini] 음성 인식 종료.");
      $gameMessage.add("음성 인식 종료.");
    };

    recognition.onerror = (event) => {
      console.error(`[Gemini] 음성 인식 오류: ${event.error}`);
      $gameMessage.add(`음성 인식 오류: ${event.error}`);
    };
  }

  // 플러그인 로드 시 음성 인식 초기화
  initializeSpeechRecognition();

  //===========================================================================
  // 유틸리티 함수
  //===========================================================================

  // 플레이어와 이벤트 간 거리 계산
  function getDistanceToPlayer(eventId) {
    const event = $gameMap.event(eventId);
    if (!event) return 999;
    const playerX = $gamePlayer.x;
    const playerY = $gamePlayer.y;
    const eventX = event.x;
    const eventY = event.y;
    return Math.abs(playerX - eventX) + Math.abs(playerY - eventY);
  }

  // 대화 히스토리 키 생성
  function getHistoryKey(npc1Id, npc2Id) {
    const ids = [npc1Id, npc2Id].sort((a, b) => a - b);
    return `${ids[0]}-${ids[1]}`;
  }

  // 히스토리에 대화 추가
  function addToHistory(npc1Id, npc2Id, speaker, text) {
    const key = getHistoryKey(npc1Id, npc2Id);
    if (!conversationHistory[key]) {
      conversationHistory[key] = [];
    }
    conversationHistory[key].push({ speaker, text });

    // 최근 5개만 유지
    if (conversationHistory[key].length > MAX_HISTORY) {
      conversationHistory[key].shift();
    }
  }

  // 히스토리 가져오기
  function getHistory(npc1Id, npc2Id) {
    const key = getHistoryKey(npc1Id, npc2Id);
    return conversationHistory[key] || [];
  }

  // NPC 대화 프롬프트 생성
  function buildNPCPrompt(currentNpcId, otherNpcId) {
    const current = npcData[currentNpcId];
    const other = npcData[otherNpcId];

    if (!current || !other) {
      return "대화를 생성할 수 없습니다.";
    }

    const history = getHistory(currentNpcId, otherNpcId);
    const historyText = history.length > 0
      ? history.map(h => `${h.speaker}: ${h.text}`).join('\n')
      : "(대화 시작)";

    return `당신은 ${current.name}입니다.
성격: ${current.personality}
배경: ${current.background}

대화 상대: ${other.name} (${other.personality})

지금까지의 대화:
${historyText}

${current.name}으로서 ${other.name}에게 자연스럽게 한 문장으로 대답하세요.
답변만 출력하세요 (이름이나 다른 설명 없이).`;
  }

  // NPC 위에 말풍선 표시
  function showNPCBalloon(eventId, text, pictureId, duration) {
    const event = $gameMap.event(eventId);
    if (!event) {
      console.error(`[Gemini] 이벤트 ${eventId}를 찾을 수 없습니다`);
      return;
    }

    // TextPicture 플러그인 호출
    if (typeof PluginManager._commands !== 'undefined') {
      // TextPicture 설정
      const textPictureCommand = PluginManager._commands.find(
        cmd => cmd[0] === 'TextPicture' && cmd[1] === 'set'
      );
      if (textPictureCommand) {
        PluginManager.callCommand(this, 'TextPicture', 'set', { text: text });
      }
    }

    // 이벤트 화면 좌표 계산
    const screenX = event.screenX();
    const screenY = event.screenY() - 48 - 24; // 이벤트 위 + 여유

    // 픽처 표시
    $gameScreen.showPicture(
      pictureId,
      "",  // 이미지 없음 (TextPicture 사용)
      1,   // 원점: 중앙
      screenX,
      screenY,
      100, // 크기 X
      100, // 크기 Y
      255, // 불투명도
      0    // 블렌드 모드
    );

    console.log(`[Gemini] 말풍선 표시: 이벤트${eventId}, 픽처${pictureId}, "${text.substring(0, 20)}..."`);

    // 일정 시간 후 자동 삭제
    setTimeout(() => {
      $gameScreen.erasePicture(pictureId);
      console.log(`[Gemini] 말풍선 삭제: 픽처${pictureId}`);
    }, duration * 1000 / 60); // 프레임을 밀리초로 변환
  }

  //===========================================================================
  // 플러그인 커맨드
  //===========================================================================

  // 음성 -> 텍스트 변환
  PluginManager.registerCommand("Gemini_API_Plugin", "speechToText", (args) => {
    if (!recognition) {
      $gameMessage.add("음성 인식이 지원되지 않는 환경입니다.");
      return;
    }
    const variableId = Number(args.variableId);
    recognition.variableId = variableId; // 결과를 저장할 변수 ID 저장
    try {
      recognition.start();
    } catch (e) {
      console.error("[Gemini] 음성 인식 시작 오류:", e);
      if (e.name === 'InvalidStateError') {
        // 이미 인식 중일 때 발생하는 오류. 무시하거나 사용자에게 알림.
        $gameMessage.add("이미 음성 인식이 진행 중입니다.");
      }
    }
  });

  // NPC 등록
  PluginManager.registerCommand("Gemini_API_Plugin", "registerNPC", (args) => {
    const npcId = Number(args.npcId);
    npcData[npcId] = {
      name: String(args.name),
      personality: String(args.personality),
      background: String(args.background)
    };
    console.log(`[Gemini] NPC 등록: ID=${npcId}, 이름=${args.name}`);
  });

  // NPC 대화
  PluginManager.registerCommand("Gemini_API_Plugin", "npcChat", (args) => {
    const npc1Id = Number(args.npc1Id);
    const npc2Id = Number(args.npc2Id);
    const turnOwner = Number(args.turnOwner);
    const resultVar = Number(args.resultVar);
    const distanceCheck = args.distanceCheck === "true";
    const maxDistance = Number(args.maxDistance);
    const autoDisplay = args.autoDisplay === "true";
    const pictureId = Number(args.pictureId);
    const displayDuration = Number(args.displayDuration);

    const currentNpcId = turnOwner === 1 ? npc1Id : npc2Id;
    const otherNpcId = turnOwner === 1 ? npc2Id : npc1Id;

    console.log(`[Gemini] NPC 대화 시작: ${currentNpcId} -> ${otherNpcId}`);

    // 거리 체크
    if (distanceCheck) {
      const distance = getDistanceToPlayer(currentNpcId);
      if (distance > maxDistance) {
        console.log(`[Gemini] 거리 체크 실패: ${distance} > ${maxDistance}`);
        $gameVariables.setValue(resultVar, "");
        return;
      }
    }

    // NPC 데이터 확인
    if (!npcData[currentNpcId] || !npcData[otherNpcId]) {
      console.error(`[Gemini] NPC 데이터 없음: ${currentNpcId} 또는 ${otherNpcId}`);
      $gameVariables.setValue(resultVar, "오류: NPC 미등록");
      return;
    }

    // 로딩 표시
    $gameVariables.setValue(resultVar, "...");

    // 프롬프트 생성
    const prompt = buildNPCPrompt(currentNpcId, otherNpcId);
    console.log(`[Gemini] 프롬프트:\n${prompt}`);

    // API 호출
    const MODEL_NAME = "gemini-2.5-flash";
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP ${response.status}: ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      const text = data.candidates[0].content.parts[0].text.trim();

      // 히스토리에 추가
      addToHistory(npc1Id, npc2Id, npcData[currentNpcId].name, text);

      // 변수에 저장
      $gameVariables.setValue(resultVar, text);

      // 자동 말풍선 표시
      if (autoDisplay) {
        showNPCBalloon(currentNpcId, text, pictureId, displayDuration);
      }

      console.log(`[Gemini] NPC 대화 완료: ${text}`);
    })
    .catch((error) => {
      console.error("[Gemini] NPC 대화 오류:", error);
      $gameVariables.setValue(resultVar, "...");
    });
  });

  // 기본 Gemini 호출
  PluginManager.registerCommand("Gemini_API_Plugin", "callGemini", (args) => {
    const variableId = Number(args.variableId);
    const waitSwitchId = Number(args.waitSwitchId);

    console.log("[Gemini] 호출 시작:", args.prompt);

    // 로딩 중 표시
    $gameVariables.setValue(variableId, "...");

    // 대기 스위치 ON (응답 받을 때까지 이벤트 진행 막기)
    if (waitSwitchId > 0) {
      $gameSwitches.setValue(waitSwitchId, true);
      console.log("[Gemini] 대기 스위치 ON:", waitSwitchId);
    }

    // API 호출
    const MODEL_NAME = "gemini-2.5-flash";
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    console.log("[Gemini] API 요청 URL:", API_URL);

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: args.prompt }] }]
      })
    })
    .then((response) => {
      console.log("[Gemini] 응답 상태:", response.status);
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP ${response.status}: ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("[Gemini] 응답 데이터:", data);
      const text = data.candidates[0].content.parts[0].text;
      $gameVariables.setValue(variableId, text);

      // 대기 스위치가 없을 때만 메시지 자동 표시
      if (waitSwitchId === 0) {
        $gameMessage.add(text);
      }

      console.log("[Gemini] 성공! 텍스트:", text.substring(0, 50) + "...");
    })
    .catch((error) => {
      console.error("[Gemini] 오류:", error);
      const errorMsg = "오류: " + error.message;
      $gameVariables.setValue(variableId, errorMsg);

      if (waitSwitchId === 0) {
        $gameMessage.add(errorMsg);
      }
    })
    .finally(() => {
      // 완료되면 대기 스위치 OFF
      if (waitSwitchId > 0) {
        $gameSwitches.setValue(waitSwitchId, false);
        console.log("[Gemini] 대기 스위치 OFF");
      }
      console.log("[Gemini] 완료");
    });
  });
})();
