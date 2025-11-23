/*:
 * @target MZ MV
 * @plugindesc [v1.0] Audio Physics Engine with Gemini AI Integration.
 * @author Gemini AI Generator
 *
 * @param apiKey
 * @text Gemini API Key
 * @desc API Key from Google AI Studio.
 * @default YOUR_API_KEY_HERE
 *
 * @param minVolume
 * @text Minimum Volume (0-100)
 * @desc Audio below this volume is ignored (background noise filter).
 * @default 10
 *
 * @param distFactor
 * @text Distance Factor
 * @desc How much harder it is to hear per tile. Higher = harder.
 * @default 2.5
 *
 * @param varVolume
 * @text Variable: Current Volume
 * @desc Game Variable ID to store real-time mic volume (0-100).
 * @default 1
 *
 * @help
 * ============================================================================
 * 📢 Proximity Voice AI - Audio Physics Engine
 * ============================================================================
 * This plugin replaces the "Z Key" interaction with a real-time voice system.
 * 
 * 1. SETUP:
 *    - Use Chrome or a browser/engine that supports Web Audio API.
 *    - Ensure your microphone is active.
 * 
 * 2. HOW TO MAKE AN NPC LISTEN:
 *    Put the following tag in the Event's "Note" box:
 *    
 *    <VoiceListener: X>
 *    
 *    Where X is the "Hearing Sensitivity" (0.5 = Deaf, 1.0 = Normal, 2.0 = Sharp).
 *    Example: <VoiceListener: 1.0>
 * 
 * 3. SYSTEM LOGIC:
 *    The plugin constantly calculates:
 *    RequiredVolume = (Distance * DistanceFactor) / NPCSensitivity
 *    
 *    If (YourVolume > RequiredVolume) {
 *       The NPC hears you and triggers the Gemini AI response.
 *    }
 *
 * 4. PLUGIN COMMANDS:
 *    - StartListening: Turn on the mic.
 *    - StopListening: Turn off the mic.
 */

(() => {
    const parameters = PluginManager.parameters('ProximityVoiceAI');
    const API_KEY = parameters['apiKey'] || ''; //api 넣는곳 
    const MIN_VOLUME_THRESHOLD = Number(parameters['minVolume'] || 10);
    const DISTANCE_PENALTY = Number(parameters['distFactor'] || 2.5);
    const VAR_ID_VOLUME = Number(parameters['varVolume'] || 1);

    // --- AUDIO MANAGER (The Ear) ---
    class AudioInputManager {
        constructor() {
            this.audioContext = null;
            this.analyser = null;
            this.microphone = null;
            this.dataArray = null;
            this.isListening = false;
            this.currentVolume = 0;
            this.recognition = null;
            this.transcriptBuffer = "";
            
            this.setupSpeechRecognition();
        }

        async start() {
            if (this.isListening) return;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.analyser = this.audioContext.createAnalyser();
                this.microphone = this.audioContext.createMediaStreamSource(stream);
                this.microphone.connect(this.analyser);
                this.analyser.fftSize = 256;
                this.analyser.smoothingTimeConstant = 0.2; // Make volume more responsive
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.isListening = true;
                
                if (this.recognition) this.recognition.start();
                console.log("🎤 Audio Physics Engine Started");
            } catch (err) {
                console.error("Microphone access denied or not available:", err);
            }
        }

        setupSpeechRecognition() {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ko-KR';

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        const finalSentence = event.results[i][0].transcript;
                        console.log(`[ProximityAI] Final sentence recognized: "${finalSentence}", Volume: ${this.currentVolume}`);
                        // Trigger the physics check with the final sentence and PEAK volume of that duration
                        DialogueManager.processSpeech(finalSentence.trim(), this.currentVolume);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
            };
            
            this.recognition.onend = () => {
                if (this.isListening) this.recognition.start();
            };
        }

        update() {
            if (!this.isListening || !this.analyser) return;
            
            // Handle suspended AudioContext state due to browser autoplay policies
            if (this.audioContext && this.audioContext.state === 'suspended') {
                // A user gesture (click/tap) is required to resume the audio context.
                // We check for any input here, but only need to do it once.
                if (TouchInput.isPressed() || TouchInput.isTriggered() || TouchInput.isLongPressed()) {
                    this.audioContext.resume().then(() => {
                        console.log('[ProximityAI] AudioContext resumed successfully after user gesture.');
                    });
                }
                // Don't process volume until context is running
                this.currentVolume = 0;
                if ($gameVariables && VAR_ID_VOLUME > 0) {
                    $gameVariables.setValue(VAR_ID_VOLUME, 0);
                }
                return;
            }

            this.analyser.getByteFrequencyData(this.dataArray);
            let sum = 0;
            for (let i = 0; i < this.dataArray.length; i++) {
                sum += this.dataArray[i];
            }
            const average = sum / this.dataArray.length;
            // Normalize 0-255 to roughly 0-100 linear scale for RPG Maker
            this.currentVolume = Math.min(100, Math.round((average / 128) * 100)); 
            
            // Update RPG Maker Variable
            if ($gameVariables && VAR_ID_VOLUME > 0) {
                $gameVariables.setValue(VAR_ID_VOLUME, this.currentVolume);
            }
        }
    }

    const audioManager = new AudioInputManager();

    // --- DIALOGUE MANAGER (The Physics Engine) ---
    class DialogueManagerSystem {
        processSpeech(text, volume) {
            console.log(`[ProximityAI] Processing speech. Text: "${text}", Volume: ${volume}`);
            if (volume < MIN_VOLUME_THRESHOLD) {
                console.log(`[ProximityAI] Skipped: Volume ${volume} is below threshold ${MIN_VOLUME_THRESHOLD}`);
                return;
            }
            if (!text || text.length < 2) {
                console.log(`[ProximityAI] Skipped: Text is too short.`);
                return;
            }

            const player = $gamePlayer;
            const events = $gameMap.events();

            // Find the best candidate to talk to
            let bestCandidate = null;
            let bestScore = -999;

            events.forEach(event => {
                const sensitivity = Number(event.event().meta['VoiceListener'] || 0);
                if (sensitivity > 0) {
                    // 1. Calculate Distance
                    const dx = event.x - player.x;
                    const dy = event.y - player.y;
                    const distance = Math.sqrt(dx*dx + dy*dy);

                    // 2. Calculate Threshold (Physics Formula)
                    // Farther = Higher Volume Needed. Higher Sensitivity = Lower Volume Needed.
                    const requiredVolume = (distance * DISTANCE_PENALTY) / sensitivity;
                    console.log(`[ProximityAI] Candidate: Event ${event.eventId()}, Distance: ${distance.toFixed(1)}, Required Volume: ${requiredVolume.toFixed(1)}, Sensitivity: ${sensitivity}`);

                    // 3. Check Logic
                    if (volume >= requiredVolume) {
                        // Score based on how much we exceeded the threshold (closer/louder is better)
                        const score = volume - requiredVolume;
                        if (score > bestScore) {
                            bestScore = score;
                            bestCandidate = event;
                        }
                    }
                }
            });

            if (bestCandidate) {
                console.log(`[ProximityAI] Interaction triggered for Event ${bestCandidate.eventId()}`);
                this.triggerInteraction(bestCandidate, text, volume, bestCandidate.x - player.x);
            } else {
                console.log(`[ProximityAI] No suitable NPC found in range/hearing.`);
            }
        }

        async triggerInteraction(targetEvent, text, volume, distance) {
            // Visual Feedback (Balloon)
            $gameTemp.requestBalloon(targetEvent, 1); // Exclamation
            
            // Call AI
            const response = await AIManager.generateResponse(text, volume, distance);
            
            // Show Message
            $gameMessage.setFaceImage("", 0);
            $gameMessage.setBackground(0);
            $gameMessage.setPositionType(2);
            $gameMessage.add("\C[6][AI NPC]\C[0]: " + response);
        }
    }
    
    const DialogueManager = new class {
        constructor() {
            this.activeConversationTarget = null;
            this.conversationHistory = [];
            this.messageQueue = []; // Queue for pending AI messages
            this.CONVERSATION_END_DISTANCE = 5; 
        }

        // Called every frame by the Scene_Map.update hook
        update() {
            // Check to end the conversation
            if (this.activeConversationTarget) {
                const player = $gamePlayer;
                const event = this.activeConversationTarget;
                const dx = event.x - player.x;
                const dy = event.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > this.CONVERSATION_END_DISTANCE) {
                    console.log(`[ProximityAI] Conversation ended due to distance.`);
                    this.messageQueue.push("대화가 종료되었습니다.");
                    this.endConversation();
                }
            }

            // Process the message queue
            if (!($gameMessage.isBusy() || $gameMap.isEventRunning())) {
                if (this.messageQueue.length > 0) {
                    const message = this.messageQueue.shift();
                    $gameMessage.setFaceImage("", 0);
                    $gameMessage.setBackground(0);
                    $gameMessage.setPositionType(2);
                    $gameMessage.add(message);
                }
            }
        }

        endConversation() {
            this.activeConversationTarget = null;
            this.conversationHistory = [];
        }

        processSpeech(text, volume) {
            if ($gameMessage.isBusy() || $gameMap.isEventRunning()) {
                console.log(`[ProximityAI] Skipped speech processing because a message or event is active.`);
                return;
            }

             // If we are already in a conversation, bypass proximity checks
            if (this.activeConversationTarget) {
                console.log(`[ProximityAI] Continuing conversation with Event ${this.activeConversationTarget.eventId()}`);
                this.triggerInteraction(this.activeConversationTarget, text);
                return;
            }

            // --- Logic to START a NEW conversation ---
            console.log(`[ProximityAI] Processing speech to find new conversation partner. Text: "${text}", Volume: ${volume}`);
            if (volume < MIN_VOLUME_THRESHOLD) {
                console.log(`[ProximityAI] Skipped: Volume ${volume} is below threshold ${MIN_VOLUME_THRESHOLD}`);
                return;
            }
            if (!text || text.length < 2) {
                console.log(`[ProximityAI] Skipped: Text is too short.`);
                return;
            }

            const player = $gamePlayer;
            const events = $gameMap.events();
            let bestCandidate = null;
            let bestScore = -999;

            events.forEach(event => {
                const sensitivity = Number(event.event().meta['VoiceListener'] || 0);
                if (sensitivity > 0) {
                    const dx = event.x - player.x;
                    const dy = event.y - player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const requiredVolume = (distance * DISTANCE_PENALTY) / sensitivity;
                    console.log(`[ProximityAI] Candidate: Event ${event.eventId()}, Distance: ${distance.toFixed(1)}, Required Volume: ${requiredVolume.toFixed(1)}, Sensitivity: ${sensitivity}`);

                    if (volume >= requiredVolume) {
                        const score = volume - requiredVolume;
                        if (score > bestScore) {
                            bestScore = score;
                            bestCandidate = event;
                        }
                    }
                }
            });

            if (bestCandidate) {
                console.log(`[ProximityAI] New conversation started with Event ${bestCandidate.eventId()}`);
                this.activeConversationTarget = bestCandidate; // Start conversation!
                this.triggerInteraction(bestCandidate, text);
            } else {
                console.log(`[ProximityAI] No suitable NPC found in range/hearing.`);
            }
        }

        async triggerInteraction(targetEvent, text) {
            this.conversationHistory.push({ role: "user", parts: [{ text: text }] });
            $gameTemp.requestBalloon(targetEvent, 1);
            
            const response = await AIManager.generateResponse(this.conversationHistory);
            
            if (response) {
                this.conversationHistory.push({ role: "model", parts: [{ text: response }] });
                this.messageQueue.push(response); // Add response to our queue instead of showing it directly
            }
        }
    }

    // --- AI MANAGER (The Brain) ---
    const AIManager = new class {
        async generateResponse(history) {
            if (API_KEY === 'YOUR_API_KEY_HERE') return "API Key not configured.";

            const instruction = {
                role: "user",
                parts: [{ text: "You are a character in an RPG. The player is talking to you. Keep your response concise, under 25 words. Reply only with the dialogue text, without any prefixes like 'NPC:' or formatting." }]
            };
            
            // We insert the system instruction at the beginning, preserving the latest chat history
            const contents = [instruction, ...history.slice(-10)]; // Use last 10 interactions for context

            try {
                const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents })
                });
                
                const data = await response.json();
                if (!data.candidates || data.candidates.length === 0) {
                     console.error("[ProximityAI] AI response was empty or invalid.", data);
                     return "...."; // Return a silent-like response
                }
                return data.candidates[0].content.parts[0].text;
            } catch (e) {
                console.error("[ProximityAI] AI API call failed:", e);
                return "I heard you, but my AI brain is disconnected.";
            }
        }
    }

    // --- RPG MAKER HOOKS ---
    
    // 1. Start Audio on Map Load
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        audioManager.start();
    };

    // 2. Update Audio and Dialogue Loop
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        audioManager.update();
        DialogueManager.update(); // Add this to check for conversation end condition
        if (window.$gameTime) {
            $gameTime.update();
        }
    };

})();
