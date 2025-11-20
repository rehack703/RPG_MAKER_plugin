// API 설정 파일 예제
// 사용법: 이 파일을 config.js로 복사하고 실제 API 키를 입력하세요

const API_CONFIG = {
    GROQ_API_KEY: "gsk_your_groq_api_key_here",
    GROQ_API_URL: "https://api.groq.com/openai/v1/audio/transcriptions",
    GROQ_MODEL: "whisper-large-v3"
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
