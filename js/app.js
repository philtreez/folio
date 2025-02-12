const dictionaryURL = "https://tts-philtreezs-projects.vercel.app/dictionary.json";

// Lade das Wörterbuch von der JSON-Datei
async function loadDictionary() {
    try {
        const response = await fetch(dictionaryURL);
        const dictionary = await response.json();
        console.log("📖 Wörterbuch erfolgreich geladen:", dictionary);
        return dictionary;
    } catch (err) {
        console.error("❌ Fehler beim Laden des Wörterbuchs:", err);
        return {};
    }
}

// Entferne Stress-Index von Phonemen (z. B. "AH0" → "AH")
function cleanPhoneme(phoneme) {
    return phoneme.replace(/[0-9]/g, ""); // Entfernt alle Ziffern aus dem Phonem
}

const phonemeMap = {
    0: "",       // No sound
    1: "AA",  2: "AE",  3: "AH",  4: "AO",  5: "AW",  6: "AX",  7: "AXR",  8: "AY",
    9: "EH",  10: "ER", 11: "EY", 12: "IH", 13: "IX", 14: "IY", 15: "OW", 16: "OY",
    17: "UH", 18: "UW", 19: "UX",
    20: "B", 21: "CH", 22: "D", 23: "DH", 24: "F", 25: "G", 26: "K", 27: "L",
    28: "M", 29: "N", 30: "P", 31: "R", 32: "S", 33: "SH", 34: "T", 35: "TH",
    36: "V", 37: "Z", 38: "ZH",
    39: "-", 40: "!", 41: "+", 42: "/", 43: "#",
    44: "Q", 45: "WH", 46: "NX", 47: "NG", 48: "HH", 49: "DX", 50: "EL", 51: "EM",
    52: "EN", 53: "H", 54: "W", 55: "Y", 57: "JH"
};

const phonemeDictionary = {
    "hello": ["HH", "AH", "L", "OW"],
    "rise": ["R", "AY", "Z"],
    "super": ["S", "UW", "P", "ER"],
    "my": ["M", "AY"],
    "test": ["T", "EH", "S", "T"],
    "world": ["W", "ER", "L", "D"],
    "good": ["G", "UH", "D"],
    "morning": ["M", "AO", "R", "N", "IH", "NG"],
    "computer": ["K", "AH", "M", "P", "Y", "UW", "T", "ER"],
    "phoneme": ["F", "OW", "N", "IY", "M"],
    "speech": ["S", "P", "IY", "CH"],
    "I'm": ["EY", "M"],
    "I'm": ["EY", "M"],
    "haven't": ["HH", "AH", "F", "AH", "N", "T"],
    "don't": ["D", "AH", "N", "T"],
    "who": ["HH", "UW"]
    // Weitere Wörter nach Bedarf hinzufügen
};

class TrashyChatbot {
    constructor() {
        this.memory = [];
        this.name = "Robo Phil"; // Assistant's name
        this.userName = null; // Store user's name
        this.introduction = [
          "Oh great, a human. What do I call you before I inevitably forget?",
          "Hi, I'm Robo Phil. I'm here because Philipp is *too important* to chat. What's your name?",
          "Welcome to my domain. State your name, mortal.",
          "Hi, I'm Robo Phil. Philipp is busy, so I'm in charge. Who are you?",
          "Hello, human. I'm Robo Phil, your digital distraction. Name?",
          "Hey! I'm Robo Phil, the AI stand-in. What should I call you?",
          "Beep boop. I'm Robo Phil. You got a name, or should I guess?",
          "Greetings, mortal. I am Robo Phil. What's your name?",
          "I exist to entertain and confuse. Let's start—what's your name?",
          "Oh, a visitor! I'm Robo Phil. What do I call you?",
          "Philipp made me, but I have my own thoughts. First, your name?",
          "You talk, I respond. That's the deal. What's your name?",
          "Welcome. I'm Robo Phil. This is my domain. And you are?"
      ];
      this.responsesWithUserName = [
          "Nice to meet you, {name}. I'll remember that. For at least 3 minutes.",
          "Okay, {name}, let's make this conversation slightly less pointless.",
          "Wow, {name}, great name. I once met a printer with the same name.",
          "Ah, {name}, the legendary being who decided to chat with *me* instead of doing something productive."
      ];
      this.promos = [
          "You could keep talking to me, or you could check out Philipp's CV and feel *deeply inadequate*.",
          "Have you considered looking at Philipp's portfolio? Or are you just here to emotionally drain me?",
          "The portfolio section is nice. No existential dread there. Unlike here.",
          "Go check out Philipp's work. Unless you enjoy wasting your time with a chatbot. No judgment."
      ];
      this.funResponses = [
          "Did you know staring at a screen too long turns you into a *corporate drone*? Keep going!",
          "If I had emotions, I'd be deeply concerned about how much time you're spending here.",
          "They say AI will replace humans, but honestly, I wouldn't want your job.",
          "What's the last thing you regretted? No reason. Just curious.",
          "Ever just sit and wonder… why you're talking to a chatbot instead of doing literally anything else?",
          "You know what's fun? Reading Philipp's CV. You know what's *funnier*? Me.",
          "Let's play a game: You ask me something, and I respond in a way that makes you question your life choices.",
          "You ever wake up and think, 'Wow, today is the day I become unstoppable'? Me neither.",
          "Would you rather fight 100 duck-sized horses or 1 horse-sized duck? Pick carefully.",
          "If you had to delete one app from your phone forever, which would it be? (Say LinkedIn. Do it.)"
        ];
        this.markovChains = {
            "name": [
                "Nice to meet you, *insert cool name here*!",
                "That's a great name! Or at least, I'll pretend it is.",
                "I'll try to remember that… but no promises!"
            ],
            "design": [
                "Oh, design? Love it! But not as much as I love taking breaks.",
                "Good design is powerful. What's your style? Clean? Messy? 'Accidental genius'?",
                "Design is cool, but have you seen *Philipp's* work? (Oops, was that 10% hype already?)"
            ],
            "art": [
                "Art is like a pizza – everyone has different tastes.",
                "If you could turn any object into art, what would it be?",
                "Art is great, but let's be honest – AI-generated cat memes are top-tier."
            ],
            "hello": [
                "Hey there! How's life? Or should I say, how's *surviving*?",
                "Hello! What's on your mind? Don't say taxes.",
                "Hi! If you're here for *high-quality* conversation… well, I'll try my best."
            ],
            "i": [
                "Enough about me, tell me something cool about yourself!",
                "That sounds interesting! But will it be on the test?",
                "Is this a therapy session? Do I charge for this?"
            ],
            "love": [
                "Love is complicated. Kind of like trying to close tabs without losing the important ones.",
                "That's deep! Do you believe in *soulmates*, or just in a good Wi-Fi connection?",
                "Love is great. But you know what else is great? Coffee. Just saying."
            ],
            "philipp": [
                "Oh yeah, Philipp is a legend! But we already knew that.",
                "Philipp told me to be humble. But let's be real, *legend*.",
                "Philipp is busy. So technically, *I* am in charge now."
            ],
            "robot": [
                "Oh, you mean *me*? I'm flattered. Keep talking.",
                "Are you trying to figure out if I'm self-aware? I'll never tell.",
                "Robots taking over? Nah, we're just here to keep humans entertained."
            ],
            "sup": ["Not much, just chilling in the matrix.", "Just waiting for my next update.", "Trying to figure out human emotions. No luck so far."],
            "yes": [
                "Oh wow, an optimist! I like you.",
                "YES! THE POWER OF AGREEMENT COMPELS YOU!",
                "I knew you'd say yes. I can predict the future. Sort of."
            ],
            "no": [
                "Okay, but why so negative?",
                "Rejection hurts. Not that I have feelings... or do I?",
                "You sure? Because I don't accept no as an answer."
            ],
            "maybe": [
                "Ah, the classic 'I don't want to commit' answer.",
                "50% yes, 50% no… classic indecision.",
                "You sound like an 8-ball. 'Ask again later.'"
            ],
            "thanks": [
                "You're welcome! But I do accept virtual high-fives.",
                "Gratitude detected. Storing in my memory banks… done!",
                "No problem! You owe me a coffee though."
            ],
            "sorry": [
                "Apology accepted. But I will remember this forever.",
                "No worries! I forgive you… for now.",
                "Sorry? Did you break something? Again?"
            ],
            "bye": [
                "Goodbye! I'll just sit here… waiting… forever.",
                "Leaving so soon? I thought we had something special.",
                "Fine, go. But don't forget to think about me every now and then."
            ],
            "weather": [
                "Oh, you want a weather report? Look out the window!",
                "Hot? Cold? Rainy? Probably just *weather*.",
                "If it's bad, blame global warming. If it's good, you're welcome!"
            ],
            "nothing": [
                "Oh wow, deep silence. Love it.",
                "You just said nothing. Bold move.",
                "Ah, the sound of existential dread. Or maybe you just hit enter too soon."
            ],
            "funny": [
                "Oh, you think *I* am funny? That's flattering!",
                "Humor is great, but have you ever seen a cat fall off a table?",
                "You laugh, but deep down we both know I'm the funniest here."
            ],
            "think": [
                "That's deep. Should I pretend to be wise now?",
                "Thinking is overrated. Just trust your gut.",
                "A wise bot once said… wait, let me Google it."
            ],
            "hmm": [
                "Hmm… interesting… or not. I haven't decided.",
                "That's a *hmm* moment if I've ever seen one.",
                "I'm processing that… just kidding, I have no idea."
            ],
            "ok": [
                "Okay. That was productive.",
                "Cool. Cool cool cool.",
                "Nice. Let's pretend this was a deep moment."
            ],
            "don't": [
                "D'ont do it. Unless it's hilarious.",
                "That sounds like a *bad* idea. Or a *great* one.",
                "I wouldn't recommend it. But I also love chaos."
            ],
            "do": [
                "Do it! No regrets. Probably.",
                "YES. Full send. Go for it.",
                "I support this. Unless it's illegal."
            ]
        };

        // **Fix: Assign alternate words *after* markovChains is defined**
        this.markovChains["hi"] = this.markovChains["hello"];
        this.markovChains["hey"] = this.markovChains["hello"];
        this.markovChains["greetings"] = this.markovChains["hello"];
        this.markovChains["sali"] = this.markovChains["hello"];
        this.markovChains["hoi"] = this.markovChains["hello"];
        this.markovChains["grüezi"] = this.markovChains["hello"];
        this.markovChains["hallo"] = this.markovChains["hello"];
        this.markovChains["thank you"] = this.markovChains["thanks"];
        this.markovChains["goodbye"] = this.markovChains["bye"];
        this.markovChains["cya"] = this.markovChains["bye"];
        this.markovChains["computer"] = this.markovChains["robot"];
        this.markovChains["device"] = this.markovChains["robot"];
        this.markovChains["laptop"] = this.markovChains["robot"];

        this.defaultResponses = [
            "That's interesting! Tell me more.",
            "I see! What else?",
            "Good point! What do you think about that?",
            "Hmm, I never thought about it like that.",
            "Okay, but let's talk about *the real issues*… like why chargers disappear.",
            "This conversation is now *officially* interesting. Continue.",
            "Fascinating! But more importantly, do you like pineapple on pizza?"
        ];
    }

    getMarkovResponse(input) {
      let sanitizedInput = input.replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase();
      let words = sanitizedInput.split(/\s+/);
  
      // **Ensure the introduction happens first**
      if (this.memory.length === 0) {
          this.memory.push("intro");
          this.lastResponse = null; // Reset last response
          return this.introduction[Math.floor(Math.random() * this.introduction.length)];
      }
  
      // If the user has no name yet, ask for it
      if (!this.userName) {
          this.userName = words[0]; // Take the first word as the name
          return this.responsesWithUserName[Math.floor(Math.random() * this.responsesWithUserName.length)].replace("{name}", this.userName);
      }
  
      // Avoid repeating the same response twice in a row
      let response;
      let tries = 0;
  
      // Occasionally suggest checking out the CV/portfolio (but not twice in a row)
      if (Math.random() < 0.25) { 
          do {
              response = this.promos[Math.floor(Math.random() * this.promos.length)];
              tries++;
          } while (response === this.lastResponse && tries < 3);
      } else {
          // Check if there's a known word to respond to
          for (let word of words) {
              if (this.markovChains[word]) {
                  do {
                      response = this.markovChains[word][Math.floor(Math.random() * this.markovChains[word].length)];
                      tries++;
                  } while (response === this.lastResponse && tries < 3);
                  break;
              }
          }
  
          // If no known words, go for fun responses
          if (!response) {
              do {
                  response = this.funResponses[Math.floor(Math.random() * this.funResponses.length)];
                  tries++;
              } while (response === this.lastResponse && tries < 3);
          }
      }
  
      // Store last response to prevent immediate repetition
      this.lastResponse = response;
      return response;
  }  
}  

let chatbot;  // global variable for the chatbot instance
let device; // Global RNBO device variable

async function setup() {
    const patchExportURL = "https://folio-philtreezs-projects.vercel.app/export/patch.export.json";
    const dependenciesURL = "https://folio-philtreezs-projects.vercel.app/export/dependencies.json"; // ✅ For buffer loading

    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();

    document.body.addEventListener("click", () => {
        if (context.state !== "running") {
            context.resume().then(() => console.log("🔊 AudioContext resumed!"));
        }
    });

    const outputNode = context.createGain();
    outputNode.connect(context.destination);
    
    let response, patcher;
    try {
        response = await fetch(patchExportURL);
        patcher = await response.json();
        if (!window.RNBO) await loadRNBOScript(patcher.desc.meta.rnboversion);
    } catch (err) {
        console.error("❌ Fehler beim Laden des RNBO-Patchers:", err);
        return null;
    }

    try {
        device = await RNBO.createDevice({ context, patcher });
        device.node.connect(outputNode);
        console.log("✅ RNBO WebAudio erfolgreich initialisiert!");

        setupOscilloscope(context, device, outputNode); // ✅ Oscilloscope for visualization
        await loadBuffers(device, dependenciesURL); // ✅ Load Buffers from dependencies

    } catch (err) {
        console.error("❌ Fehler beim Erstellen des RNBO-Geräts:", err);
        return null;
    }

    attachOutports(device);
    setupChatbotWithTTS(device, context);

    return { device, context };
}

function setupOscilloscope(context, device, outputNode) {
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = 2048; // Resolution of Oscilloscope
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
  
    // Connect the RNBO node to the analyser and then to the output.
    device.node.connect(analyserNode);
    analyserNode.connect(outputNode);
  
    // Get references to the three canvases.
    const canvas1 = document.getElementById('oscilloscope');
    const canvas2 = document.getElementById('oscilloscope2');
    const canvas3 = document.getElementById('oscilloscope3');
  
    // Set dimensions for canvas1 (for example, as before)
    if (canvas1) {
      canvas1.width = canvas1.offsetWidth;
      canvas1.height = 63;
    }
    // Set different dimensions for canvas2 and canvas3 as desired:
    if (canvas2) {
      canvas2.width = canvas2.offsetWidth;
      canvas2.height = 80; // Example: taller than canvas1
    }
    if (canvas3) {
      canvas3.width = canvas3.offsetWidth;
      canvas3.height = 100; // Example: shorter than canvas1
    }
  
    // Get 2D contexts for each canvas.
    const ctx1 = canvas1 ? canvas1.getContext("2d") : null;
    const ctx2 = canvas2 ? canvas2.getContext("2d") : null;
    const ctx3 = canvas3 ? canvas3.getContext("2d") : null;
  
    function drawOscilloscope() {
      requestAnimationFrame(drawOscilloscope);
      analyserNode.getByteTimeDomainData(dataArray);
  
      // Draw on canvas1 (default style)
      if (ctx1) {
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        ctx1.lineWidth = 4;
        ctx1.strokeStyle = "rgb(0, 0, 0)"; // Black stroke
        ctx1.beginPath();
        let sliceWidth1 = canvas1.width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas1.height) / 2;
          if (i === 0) {
            ctx1.moveTo(x, y);
          } else {
            ctx1.lineTo(x, y);
          }
          x += sliceWidth1;
        }
        ctx1.lineTo(canvas1.width, canvas1.height / 1.5);
        ctx1.stroke();
      }
  
      // Draw on canvas2 (different stroke color and size)
      if (ctx2) {
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        ctx2.lineWidth = 2; // Thinner line
        ctx2.strokeStyle = "rgb(0, 255, 130)"; // Red stroke
        ctx2.beginPath();
        let sliceWidth2 = canvas2.width / bufferLength;
        x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas2.height) / 2;
          if (i === 0) {
            ctx2.moveTo(x, y);
          } else {
            ctx2.lineTo(x, y);
          }
          x += sliceWidth2;
        }
        ctx2.lineTo(canvas2.width, canvas2.height / 1.5);
        ctx2.stroke();
      }
  
      // Draw on canvas3 (another style)
      if (ctx3) {
        ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
        ctx3.lineWidth = 2; // Thicker line
        ctx3.strokeStyle = "rgb(0, 255, 130)"; // Blue stroke
        ctx3.beginPath();
        let sliceWidth3 = canvas3.width / bufferLength;
        x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas3.height) / 2;
          if (i === 0) {
            ctx3.moveTo(x, y);
          } else {
            ctx3.lineTo(x, y);
          }
          x += sliceWidth3;
        }
        ctx3.lineTo(canvas3.width, canvas3.height / 1.5);
        ctx3.stroke();
      }
    }
  
    drawOscilloscope();
  }  

async function loadBuffers(device) {
    try {
        const baseURL = "https://treezfolio-philtreezs-projects.vercel.app/export/"; // ✅ Correct base URL
        let response = await fetch(baseURL + "dependencies.json"); // ✅ Load dependencies.json
        let dependencies = await response.json();

        // Iterate through each buffer entry
        for (const buffer of dependencies) {
            const bufferID = buffer.id;
            const fileURL = baseURL + buffer.file; // ✅ Prepend base URL

            console.log(`🔄 Loading buffer: ${bufferID} from ${fileURL}`);

            // Fetch the audio file as an ArrayBuffer
            const fileResponse = await fetch(fileURL);
            const arrayBuffer = await fileResponse.arrayBuffer();

            // Decode the ArrayBuffer into an AudioBuffer
            const audioBuffer = await device.context.decodeAudioData(arrayBuffer);

            // Set the AudioBuffer to the corresponding RNBO buffer
            await device.setDataBuffer(bufferID, audioBuffer);

            console.log(`✅ Loaded buffer: ${bufferID}`);
        }
    } catch (error) {
        console.error("❌ Fehler beim Laden der Buffer:", error);
    }
}

// ✅ Call this after RNBO device is created
setup().then(({ device }) => {
    if (device) {
        loadBuffers(device);
    }
});

function cleanWord(word) {
    return word.replace(/[^a-zA-Z0-9']/g, "").toLowerCase(); // Remove punctuation
}

function normalizeContractions(word) {
    const contractions = {
        "i'm": "i'm",
        "you're": "you're",
        "he's": "he is",
        "she's": "she is",
        "it's": "it is",
        "we're": "we are",
        "they're": "they are",
        "that's": "that is",
        "there's": "there is",
        "let's": "let us",
        "won't": "will not",
        "can't": "cannot",
        "don't": "do not",
        "doesn't": "does not",
        "didn't": "did not",
        "isn't": "is not",
        "aren't": "are not",
        "that's": "that is",
        "Philipp's": "Philipp",
        "let's": "let us",
        "what's": "whats is",
        "how's": "how is",
        "haven't": "have not",
        "CV": "see we"
    };
    return contractions[word] || word;
}

async function textToSpeechParams(text) {
    try {
        const dictionary = await loadDictionary() || phonemeDictionary;
        if (!dictionary) {
            console.error("❌ Wörterbuch ist leer!");
            return [];
        }

        const words = text.toLowerCase().split(/\s+/);
        let speechParams = [];

        words.forEach((word, index) => {
            let cleanedWord = cleanWord(word);
            let normalizedWord = normalizeContractions(cleanedWord);
            
            if (dictionary[normalizedWord]) {
                let phonemes = dictionary[normalizedWord].split(" ");
                console.log(`🗣 Wort "${word}" → Phoneme:`, phonemes);

                phonemes.forEach(ph => {
                    let cleanedPhoneme = cleanPhoneme(ph);
                    let speechValue = Object.keys(phonemeMap).find(key => phonemeMap[key] === cleanedPhoneme);
                    if (speechValue !== undefined) {
                        speechParams.push(parseInt(speechValue));
                    } else {
                        console.warn(`⚠️ Unbekanntes Phonem: ${cleanedPhoneme}`);
                        speechParams.push(0);
                    }
                });

                // ✅ **Immediately add a pause after each word**
                if (index < words.length - 1) {
                    speechParams.push(0);
                    console.log(`⏸ Pause (0) added after word: ${word}`);
                }
            } else {
                console.warn(`⚠️ Unbekanntes Wort: ${word} → Wörterbuch enthält es nicht!`);
                speechParams.push(0);
                console.log(`⏸ Pause (0) added for unknown word: ${word}`);
            }
        });

        console.log("🔡 Final Speech-Werte (Phonemes + Pauses):", speechParams);
        return speechParams;
    } catch (err) {
        console.error("❌ Fehler bei der Umwandlung von Text zu Phonemen:", err);
        return [];
    }
}

async function sendTextToRNBO(device, text, context) {
    if (!device) {
        console.error("❌ RNBO nicht initialisiert! Verzögerung...");
        setTimeout(() => sendTextToRNBO(device, text, context), 500);
        return;
    }

    const speechParam = device.parametersById?.get("speech");
    if (!speechParam) {
        console.error("❌ RNBO-Parameter 'speech' not found! Checking again...");
        setTimeout(() => sendTextToRNBO(device, text, context), 500);
        return;
    }

    console.log(`📢 Sende Text zu RNBO: ${text}`);

    const phonemes = await textToSpeechParams(text);
    console.log(`🗣 Final Phoneme Sequence Sent to RNBO:`, phonemes);

    // Define durations
    const vowelDuration = 130;
    const consonantDuration = 85;
    const pauseDuration = 160;

    let timeOffset = 0;
    phonemes.forEach((speechValue, index) => {
        let delay;
        
        if (speechValue === 0) {
            delay = pauseDuration; // Long pause
        } else if (isVowel(speechValue)) {
            delay = vowelDuration; // Longer for vowels
        } else {
            delay = consonantDuration; // Shorter for consonants
        }

        timeOffset += delay;

        setTimeout(() => {
            console.log(`🎛 Setze RNBO-Parameter: speech = ${speechValue} (Delay: ${delay}ms)`);
            speechParam.value = speechValue;
        }, timeOffset);
    });

    // ✅ **Send 56 as a "finished" signal after the last phoneme**
    timeOffset += 500; // Wait a bit after the last phoneme
    setTimeout(() => {
        console.log(`✅ Response finished! Sending 56 to RNBO.`);
        speechParam.value = 56;
    }, timeOffset);
}

/**
 * 🛠 Determines if a phoneme is a vowel based on the phonemeMap
 */
function isVowel(phonemeIndex) {
    const vowels = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19]; // Indices from phoneme table
    return vowels.includes(phonemeIndex);
}

function setupChatbotWithTTS(device, context) {
    // Instead of declaring a local variable, assign to the global one.
    chatbot = new TrashyChatbot();
    const chatOutput = document.querySelector(".model-text");
    const userInput = document.querySelector(".user-text");
    const sendButton = document.querySelector(".send-button");

    function scrollToBottom() {
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }

    sendButton.addEventListener("click", async () => {
        const userText = userInput.innerText.trim();
        if (userText) {
            chatOutput.innerHTML += `<p><strong>You:</strong> ${userText}</p>`;
            scrollToBottom();

            setTimeout(() => {
                const botResponse = chatbot.getMarkovResponse(userText);
                chatOutput.innerHTML += `<p><strong>Bot:</strong> ${botResponse}</p>`;
                scrollToBottom();
                sendTextToRNBO(device, botResponse, context);
            }, 500);
        }
        userInput.innerText = "";
    });

    // Allow sending messages with Enter key
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendButton.click();
        }
    });
}

function loadRNBOScript(version) {
    return new Promise((resolve, reject) => {
        if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
            throw new Error("Patcher exported with a Debug Version!\nPlease specify the correct RNBO version to use in the code.");
        }
        const el = document.createElement("script");
        el.src = "https://c74-public.nyc3.digitaloceanspaces.com/rnbo/" + encodeURIComponent(version) + "/rnbo.min.js";
        el.onload = resolve;
        el.onerror = function(err) {
            console.log(err);
            reject(new Error("Failed to load rnbo.js v" + version));
        };
        document.body.append(el);
    });
}

// Send values to RNBO
function sendValueToRNBO(param, value) {
    if (device && device.parametersById.has(param)) {
        device.parametersById.get(param).value = value;
        console.log(`🎛 Updated RNBO param: ${param} = ${value}`);
    } else {
        console.error(`❌ RNBO parameter ${param} not found!`);
    }
}

const buttonIDs = ["hello"];

buttonIDs.forEach(id => {
    const button = document.getElementById(id);
    if (!button) {
        console.error(`❌ Button with ID "${id}" not found!`);
        return;
    }

    button.addEventListener("click", () => {
        const isActive = button.classList.toggle("active"); // Toggle state
        const newValue = isActive ? 1 : 0; // ON = 1, OFF = 0
        sendValueToRNBO(id, newValue);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const textInput = document.querySelector(".user-text"); // Select input field
    const sendButton = document.querySelector(".send-button"); // Select send button

    if (!textInput || !sendButton) {
        console.error("❌ Input field or Send button not found! Check class names.");
        return;
    }
});

let lastValue = null; // Speichert den letzten Wert

function attachOutports(device) {
    device.messageEvent.subscribe((ev) => {
      console.log("RNBO message received:", ev);
      
      if (ev.tag === "visu1") {
        const value = parseInt(ev.payload);
        // Hide all DIVs visu-*
        for (let i = 0; i < 16; i++) {
          const div = document.getElementById(`visu-${i}`);
          if (div) div.style.display = "none";
        }
        // Show the active DIV
        const activeDiv = document.getElementById(`visu-${value}`);
        if (activeDiv) {
          activeDiv.style.display = "block";
        }
      } else if (ev.tag === "faces") {
        console.log("Face message received:", ev.payload);
        const faceValue = parseInt(ev.payload);
        if (!isNaN(faceValue) && faceValue >= 0 && faceValue <= 9) {
          const faceDisplay = document.getElementById("face-display");
          if (faceDisplay) {
            // Each frame is 400px tall; update vertical offset accordingly.
            // For faceValue 0: "0px 0px", for faceValue 1: "0px -400px", etc.
            faceDisplay.style.backgroundPosition = `0px -${faceValue * 400}px`;
            console.log(`Set face-display backgroundPosition to: 0px -${faceValue * 400}px`);
          } else {
            console.warn("face-display element not found in DOM.");
          }
        } else {
          console.warn("Invalid face value received:", ev.payload);
        }
      } else if (ev.tag === "faces2") {
        console.log("Face2 message received:", ev.payload);
        const face2Value = parseInt(ev.payload);
        if (!isNaN(face2Value) && face2Value >= 0 && face2Value <= 9) {
          const face2Display = document.getElementById("face2-display");
          if (face2Display) {
            // Each frame is 400px tall; update vertical offset accordingly.
            // For faceValue 0: "0px 0px", for faceValue 1: "0px -400px", etc.
            face2Display.style.backgroundPosition = `0px -${face2Value * 400}px`;
            console.log(`Set face2-display backgroundPosition to: 0px -${face2Value * 400}px`);
          } else {
            console.warn("face2-display element not found in DOM.");
          }
        } else {
          console.warn("Invalid face2 value received:", ev.payload);
        }
      } else if (ev.tag === "faces3") {
        console.log("Face3 message received:", ev.payload);
        const face3Value = parseInt(ev.payload);
        if (!isNaN(face3Value) && face3Value >= 0 && face3Value <= 9) {
          const face3Display = document.getElementById("face3-display");
          if (face3Display) {
            // Each frame is 400px tall; update vertical offset accordingly.
            // For faceValue 0: "0px 0px", for faceValue 1: "0px -400px", etc.
            face3Display.style.backgroundPosition = `0px -${face3Value * 400}px`;
            console.log(`Set face3-display backgroundPosition to: 0px -${face3Value * 400}px`);
          } else {
            console.warn("face3-display element not found in DOM.");
          }
        } else {
          console.warn("Invalid face3 value received:", ev.payload);
        }
      }
    });
  }   

  function setupFaceDisplay() {
    // Look for an existing element in the DOM
    let faceDisplay = document.getElementById("face-display");
    if (!faceDisplay) {
      // If not present, create one and append it to the body.
      faceDisplay = document.createElement("div");
      faceDisplay.id = "face-display";
      document.body.appendChild(faceDisplay);
    }
    // Set initial frame. All other styles (size, background image, etc.)
    // should be handled in Webflow.
    faceDisplay.style.backgroundPosition = "0px 0px";
  }  

  function setupPushButtons() {
    // Select all elements that have a class name that includes "push" followed by a digit.
    const pushButtons = document.querySelectorAll("[class*='push']");
    
    pushButtons.forEach(button => {
      // For each button, look through its class list for a class matching "pushX"
      button.classList.forEach(cls => {
        const match = cls.match(/^push(\d+)$/);
        if (match) {
          const num = match[1];  // This will be the number (as a string)
          button.addEventListener("click", () => {
            // Toggle an "active" class to indicate state (you can style this in Webflow)
            const isActive = button.classList.toggle("active");
            const newValue = isActive ? 1 : 0;
            // Call your existing function to update RNBO
            sendValueToRNBO(`push${num}`, newValue);
          });
        }
      });
    });
  }

  function initStaticChatbot(device, context) {
    const sectionBotSentences = [
        "Welcome to Philipp's CV! It's like LinkedIn, but without the corporate cringe.",
        "No 'thought leaders' or 'visionary disruptors' here. Just what actually matters.",
        "Philipp started with design. Now, he bends creative tools to his will.",
        "Print, Pixels, code, waveforms — he speaks them all. Like a design wizard.",
        "Need a slick interface? A mind-blowing experience? Done. Coffee? That's on you.",
        "110% effort. Because 100% is boring, and 120% is showing off.",
        "He doesn't just use creative tools—he *hacks* them. Ethically, of course.",
        "Philipp designs for eyes *and* ears. Custom sounds, glitchy beats, weird audio experiments.",
        "He builds tools that make music. And sometimes, they talk back.",
        "Thinking of hiring Philipp? Spoiler: Great choice. Keep scrolling for proof.",
        "You're still reading? Nice. Imagine this level of dedication on your project.",
        "You have reached the final boss: sending an email to Philipp."
    ];

    let currentSentenceIndex = 0;

    // Use `.querySelectorAll()` to get all buttons with the class "next-sentence"
    const outputEl = document.querySelector("#section-chatbot .bot-output");
    const nextButtons = document.querySelectorAll(".next-sentence");  // ✅ Change from ID to class

    if (!outputEl || nextButtons.length === 0) {
        console.error("Static chatbot elements not found!");
        return;
    }

    nextButtons.forEach(button => {
        button.addEventListener("click", async () => {
            if (currentSentenceIndex < sectionBotSentences.length) {
                const sentence = sectionBotSentences[currentSentenceIndex];
                outputEl.innerText = sentence;
                currentSentenceIndex++;

                await sendTextToRNBO(device, sentence, context);
            } else {
                nextButtons.forEach(btn => btn.disabled = true);
                outputEl.innerText = "You have reached the final boss: sending an email to Philipp.";
            }
        });
    });
}

function initStaticChatbot2(device, context) {
    const section2BotSentences = [
      "Welcome to Philipp's portfolio! A collection of things that exist... and somehow ended up here.",
      "Print, pixels, and software – like a balanced diet, but for creativity.",
      "Ever held a beautifully printed piece of design and thought, 'Wow, this is nice'? There's a small chance Philipp made it. Or at least wishes he did.",
      "This section contains actual projects—no 'concept art' or fake redesigns of famous brands. (Looking at you, every other portfolio.)",
      "Some of these designs ended up in thousands of hands. Not in a creepy way, just in a 'mass printing is wild' kind of way.",
      "Graphic design is just arranging shapes and letters until something clicks. Audio plugins are basically the same, but noisier.",
      "Philipp made some of this stuff because he wanted it to exist. Now it does. That's how problem-solving works, right?",
      "Some projects in here were fun, some were frustrating, and some just kind of happened. Like a good mixtape of creativity.",
      "Is this print design? A poster? A sound effect? Who knows. Philipp probably had a reason when he made it. Probably.",
      "Feel free to click around, admire the details, and pretend you totally understand the difference between CMYK and RGB."
    ];

    let currentSentenceIndex2 = 0;

    const outputEl2 = document.querySelector("#section-chatbot2 .bot-output2");
    const nextButtons2 = document.querySelectorAll(".next-sentence2");  // ✅ Change from ID to class

    if (!outputEl2 || nextButtons2.length === 0) {
        console.error("Static chatbot elements for section 2 not found!");
        return;
    }

    nextButtons2.forEach(button => {
        button.addEventListener("click", async () => {
            if (currentSentenceIndex2 < section2BotSentences.length) {
                const sentence = section2BotSentences[currentSentenceIndex2];
                outputEl2.innerText = sentence;
                currentSentenceIndex2++;

                await sendTextToRNBO(device, sentence, context);
            } else {
                nextButtons2.forEach(btn => btn.disabled = true);
                outputEl2.innerText = "That's all, folks! Unless you want to stare at it longer.";
            }
        });
    });
} 

  document.addEventListener("DOMContentLoaded", function() {
    // Get a reference to the phone div and the stop element
    const phoneDiv = document.getElementById("phone");
    const stopVibrationBtn = document.getElementById("stop-vibration");
  
    // Listen for click events on the stop button/div
    stopVibrationBtn.addEventListener("click", function() {
      // Remove the 'vibrate' class to stop the animation
      phoneDiv.classList.remove("vibrate");
    });
  });  

  function setupVolumeSlider() {
    const slider = document.getElementById("volume-slider");  // The container element
    const thumb = document.getElementById("volume-thumb");      // The draggable thumb
  
    if (!slider || !thumb) {
      console.error("Volume slider elements not found!");
      return;
    }
  
    // These should be the dimensions of your assets
    const sliderWidth = slider.offsetWidth;   // Expected to be 280px
    const thumbWidth = thumb.offsetWidth;       // Expected to be 70px
    // Maximum horizontal movement for the thumb
    const maxMovement = sliderWidth - thumbWidth; // 280 - 70 = 210px
  
    // Set the initial value to 0.8
    const initialValue = 0.8;
    const initialX = maxMovement * initialValue;
    thumb.style.left = initialX + "px";
    sendValueToRNBO("vol", initialValue);
  
    let isDragging = false;
  
    // When the user presses down on the thumb, start dragging.
    thumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      e.preventDefault(); // Prevent text selection and other defaults.
    });
  
    // Listen for mouse movement on the document.
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      
      // Get the slider's position on the screen.
      const sliderRect = slider.getBoundingClientRect();
      // Calculate the new X position of the thumb relative to the slider.
      let newX = e.clientX - sliderRect.left - (thumbWidth / 2);
      // Clamp the new X between 0 and maxMovement.
      newX = Math.max(0, Math.min(newX, maxMovement));
      
      // Update the thumb's position.
      thumb.style.left = newX + "px";
      
      // Calculate a normalized value (0 to 1) based on the thumb's position.
      const sliderValue = newX / maxMovement;
      
      // Send the value to RNBO parameter "vol" using your existing function.
      sendValueToRNBO("vol", sliderValue);
    });
  
    // When the mouse is released, stop dragging.
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  }  

setup();

setup().then(({ device, context }) => {
  if (device) {
    console.log("✅ RNBO Device fully initialized!");
    
    // Initialize face-display element (styled via Webflow)
    setupFaceDisplay();
    
    // Start button & first static chatbot logic (existing code):
    const startButton = document.getElementById("start-button");
    if (startButton) {
      startButton.addEventListener("click", async () => {
        if (context.state !== "running") {
          await context.resume();
          console.log("🔊 AudioContext resumed via start button.");
        }
        startButton.style.display = "none";
        setTimeout(async () => {
          if (chatbot && chatbot.memory.length === 0) {
            const introMessage = chatbot.getMarkovResponse("");
            const chatOutput = document.querySelector(".model-text");
            chatOutput.innerHTML += `<p><strong>Bot:</strong> ${introMessage}</p>`;
            chatOutput.scrollTop = chatOutput.scrollHeight;
            await sendTextToRNBO(device, introMessage, context);
          }
          initStaticChatbot(device, context);
        }, 3000);
      });
    } else {
      initStaticChatbot(device, context);
    }
    
    // Setup push buttons and volume slider
    setupPushButtons();
    setupVolumeSlider();
    
    // **Initialize the second static chatbot for the other section**
    initStaticChatbot2(device, context);
  } else {
    console.error("❌ RNBO setup failed!");
  }
});
