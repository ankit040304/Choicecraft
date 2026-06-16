// Variable to store the story data once loaded
let storyData = {};
let isTyping = false;
const TYPING_SPEED = 30; // Milliseconds per character

// Load the story content from the external JSON file
async function loadStory() {
  try {
    const res = await fetch('story.json');
    storyData = await res.json();
    // Start the game at the 'start' scene
    showScene('start');
  } catch (error) {
    console.error("Failed to load story data:", error);
    document.getElementById('story-text').innerHTML = 
      "❌ Error loading story. Please ensure you are running this on a local server.";
  }
}

// Character-by-character animation returning a Promise
function typeWriter(text, element) {
  return new Promise((resolve) => {
    let i = 0;
    element.innerHTML = '';
    isTyping = true;

    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, TYPING_SPEED);
      } else {
        isTyping = false;
        resolve();
      }
    }
    type();
  });
}

// Updates the UI to show a new part of the story
async function showScene(sceneKey) {
  if (isTyping) return; // Prevent clicking while text is animating

  const scene = storyData[sceneKey];

  // Simple check if the scene exists to prevent crashes
  if (!scene) {
    console.error(`Scene "${sceneKey}" not found in story.json`);
    return;
  }

  // Update the scene image if one exists
  const img = document.getElementById('scene-image');
  if (scene.image) {
    img.src = scene.image;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  // Start typewriter effect and show buttons only when finished
  const storyElement = document.getElementById('story-text');
  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = ''; 

  // Wait for the typewriter to finish before showing choices
  await typeWriter(scene.text, storyElement);

  if (scene.choices && scene.choices.length > 0) {
    scene.choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.innerText = choice.text;
      btn.style.animationDelay = `${index * 0.15}s`;
      btn.onclick = () => showScene(choice.next);
      choicesDiv.appendChild(btn);
    });
  } else {
    // End of branch - create restart button
    const restartBtn = document.createElement('button');
    restartBtn.innerText = "Begin a New Journey 🔄";
    restartBtn.classList.add('restart-btn');
    restartBtn.style.background = "var(--accent-secondary)";
    restartBtn.style.color = "white";
    restartBtn.onclick = () => showScene('start');
    choicesDiv.appendChild(restartBtn);
  }
}

loadStory();