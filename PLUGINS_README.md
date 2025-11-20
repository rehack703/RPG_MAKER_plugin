# RPG Maker MZ 플러그인 목록

## 기본 플러그인

### AltMenuScreen
RPG Maker MZ 기본 제공 플러그인. 대체 메뉴 화면 레이아웃.

### AltSaveScreen
RPG Maker MZ 기본 제공 플러그인. 대체 세이브 화면 레이아웃.

### ButtonPicture
RPG Maker MZ 기본 제공 플러그인. 화면에 버튼 그림 표시.

### TextPicture
RPG Maker MZ 기본 제공 플러그인. 화면에 텍스트 그림 표시.

---

## 커스텀 플러그인

### SimpleTimer
시간 제한 시스템. 타이머가 0이 되면 게임 오버.

**사용법:**
```javascript
// 플러그인 커맨드
- Decrease Time: 시간 감소
- Increase Time: 시간 증가
```

**설정:**
- 초기 시간: 300초 (기본값)
- 화면 위치: X=600, Y=10

---

### TimeSystem
게임 내 시간 시스템. 시계 표시, 시간 경과, 낮/밤 전환.

**주요 기능:**
- 자동 시간 경과 (2초 = 게임 내 1분)
- 시계 UI 표시
- 시간대별 화면 색조 변경
- 이벤트 상호작용 시 자동 시간 소모

**사용법:**
```javascript
// 스크립트
$gameTime.addMinutes(30);    // 30분 추가
$gameTime.setTime(7, 0);     // 7시 0분으로 설정
$gameTime.getHour();         // 현재 시각
$gameTime.showClock();       // 시계 표시
$gameTime.hideClock();       // 시계 숨기기
```

**플러그인 커맨드:**
- 시간 추가
- 시각 설정
- 시계 표시/숨기기
- 자동 시간 경과 활성화/비활성화
- 여관 숙박

**이벤트 노트 태그:**
```
<timeTalk:60>     # 대화 시 60분 경과
<timeSwitch:5>    # 스위치 조작 시 5분 경과
```

---

### DailyLife
일상 생활 시스템. 수면, 샤워, 식사.

**주요 기능:**
1. **수면**
   - 저녁(20~6시): 다음날 아침 7시, HP/MP 100% 회복
   - 낮(6~20시): 2시간 낮잠, HP/MP 30% 회복

2. **샤워**: 30분 소요, HP 50 회복

3. **식사**: 45분 소요, HP 100, MP 50 회복

**사용법:**
```javascript
// 스크립트
$dailyLife.sleep();           // 수면
$dailyLife.nap(120);          // 120분 낮잠
$dailyLife.shower(30);        // 30분 샤워
$dailyLife.meal(45, "점심");  // 점심식사
```

**플러그인 커맨드:**
- 수면
- 낮잠 (강제)
- 샤워/목욕
- 식사

**의존성:** TimeSystem (선택적)

---

### Gemini_API_Plugin
Gemini API 연동. NPC 자동 대화 생성.

**주요 기능:**
1. **Gemini API 호출**: 텍스트 생성
2. **NPC 대화 시스템**: AI 기반 NPC 간 대화
3. **음성 인식**: 마이크 입력 → 텍스트

**사용법:**
```javascript
// 1. NPC 등록
플러그인 커맨드: NPC 등록
  - NPC ID: 1
  - 이름: 상인
  - 성격: 친절하고 말이 많음
  - 배경: 마을에서 30년간 가게 운영

// 2. NPC 대화 생성
플러그인 커맨드: NPC 대화
  - NPC 1 ID: 1
  - NPC 2 ID: 2
  - 차례: NPC 1
  - 결과 변수: 10

// 3. 결과 표시
메시지: \V[10]
```

**설정:**
- API 키를 코드에 입력 필요 (라인 177)

**플러그인 커맨드:**
- Gemini 호출
- NPC 등록
- NPC 대화
- 음성 → 텍스트 변환

---

### SpeechToText
Groq Whisper API 음성 인식. 마이크 입력 → 텍스트 변환.

**주요 기능:**
- Groq Whisper API 기반 음성 인식
- 키보드 토글 (기본값: V)
- 실시간 녹음 상태 표시
- 게임 변수에 자동 저장

**사용법:**
1. `V` 키 눌러 녹음 시작
2. 말하기
3. `V` 키 다시 눌러 녹음 종료
4. 인식된 텍스트가 변수에 저장됨

**설정:**
- `js/config.js`에 Groq API 키 입력 필요
- 저장 변수 ID: 1 (기본값)
- 언어: ko (한국어)
- 토글 키: V

**플러그인 커맨드:**
- 음성 녹음 시작
- 음성 녹음 중지
- 인식된 텍스트 표시

---

## 초기 설정

### API 키 설정

Gemini_API_Plugin, SpeechToText 사용 시:

1. `js/config.example.js`를 `js/config.js`로 복사
2. `js/config.js` 열어서 실제 API 키 입력

```javascript
// js/config.js
const API_CONFIG = {
  GEMINI_API_KEY: "여기에_실제_Gemini_API_키",
  GROQ_API_KEY: "여기에_실제_Groq_API_키",
  // ...
};
```

**참고:** `config.js`는 `.gitignore`에 포함되어 있어 GitHub에 올라가지 않습니다.

---

## 플러그인 로드 순서

권장 순서:
1. 기본 플러그인 (AltMenuScreen, AltSaveScreen, ButtonPicture, TextPicture)
2. TimeSystem
3. DailyLife
4. SimpleTimer
5. Gemini_API_Plugin
6. SpeechToText

## 주의사항

- **API 키 필요**: Gemini_API_Plugin, SpeechToText
- **의존성**: DailyLife는 TimeSystem과 함께 사용 권장
- **브라우저 환경**: 음성 인식은 마이크 권한 필요
