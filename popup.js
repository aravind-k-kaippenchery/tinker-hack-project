const screen = document.getElementById("screen");
const buttons = document.querySelectorAll(".button");
const cursor = document.getElementById('cursor');
const message = document.getElementById('message');
const challengeBox = document.getElementById('challenge');
const roastBox = document.getElementById('roast'); // 🔥 New Roast Element

const expressions = ['3+4', '5-2', '2*3', '6/2', '9-3', '7+1', '8/2', '4*2'];
const currentChallenge = expressions[Math.floor(Math.random() * expressions.length)];
challengeBox.innerHTML = `Type: <code>${currentChallenge}</code> to proceed`;

let roastTimeout;

// 🔥 Fetch funny roast from Gemini
async function getRoast() {
  const apiKey = 'AIzaSyAcKnWT53spAj-VDusd8soHkQ41822Ylxc'; // 🔑 Replace this
  const prompt = `Give me a short funny roast for someone who failed a basic math question. Under 15 words.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await res.json();
    const roastText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Even a potato can add better.";
    roastBox.textContent = roastText;

    clearTimeout(roastTimeout);
    roastTimeout = setTimeout(() => {
      roastBox.textContent = '';
    }, 4000);
  } catch (e) {
    roastBox.textContent = "That was so bad, even the AI crashed.";
  }
}

// 🧊 Floating buttons
buttons.forEach(button => {
  const moveButton = () => {
    const maxX = window.innerWidth - button.offsetWidth;
    const maxY = window.innerHeight - button.offsetHeight;
    const targetX = Math.random() * maxX;
    const targetY = Math.random() * maxY;
    button.style.transition = "transform 3s linear";
    button.style.transform = `translate(${targetX}px, ${targetY}px)`;
    setTimeout(moveButton, 3000);
  };
  moveButton();
});

// ➕ Calculator Logic
buttons.forEach(button => {
  button.addEventListener("click", () => {
    const val = button.value;

    if (val === "=") {
      try {
        screen.value = eval(screen.value);
      } catch {
        screen.value = "Error";
      }
    } else if (val === "sin") {
      screen.value = Math.sin(parseFloat(screen.value)).toFixed(4);
    } else if (val === "cos") {
      screen.value = Math.cos(parseFloat(screen.value)).toFixed(4);
    } else if (val === "tan") {
      screen.value = Math.tan(parseFloat(screen.value)).toFixed(4);
    } else if (val === "√") {
      screen.value = Math.sqrt(parseFloat(screen.value)).toFixed(4);
    } else if (val === "C") {
      screen.value = "";
    } else {
      screen.value += val;
    }

    const typed = screen.value.replace(/\s/g, '');
    if (typed === currentChallenge) {
      setTimeout(() => {
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      }, 1000);
    } else if (!currentChallenge.startsWith(typed)) {
      getRoast(); // 🔥 Trigger roast if wrong part typed
    }
  });
});

// ✋ Hand detection
const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

let lastClickTime = 0;

hands.onResults(results => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const lm = results.multiHandLandmarks[0];
    const indexTip = lm[8];
    const thumbTip = lm[4];
    const x = (1 - indexTip.x) * window.innerWidth;
    const y = indexTip.y * window.innerHeight;

    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
    message.textContent = 'Hand detected';

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    const close = (a, b, t = 0.08) => dist(a, b) < t;
    const isPinching = () => close(indexTip, thumbTip);

    if (isPinching() && Date.now() - lastClickTime > 800) {
      buttons.forEach(btn => {
        const r = btn.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          btn.click();
          lastClickTime = Date.now();
        }
      });
    }
  } else {
    message.textContent = 'No hand detected';
  }
});

// 📷 Camera Setup
async function startCamera() {
  const video = document.createElement('video');
  video.style.display = 'none';
  document.body.appendChild(video);
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  await video.play();
  const cam = new Camera(video, {
    onFrame: async () => await hands.send({ image: video }),
    width: 640,
    height: 480
  });
  cam.start();
}
startCamera();

// 🧠 Fallback Challenge Check
function checkChallenge() {
  const typed = screen.value.replace(/\s/g, '');
  if (typed === currentChallenge) {
    setTimeout(() => {
      window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }, 1000);
  }
}
const observer = new MutationObserver(checkChallenge);
observer.observe(screen, { childList: true, characterData: true, subtree: true });
