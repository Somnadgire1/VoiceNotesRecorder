const startRecordBtn = document.getElementById("start-record-btn");
const pauseRecordBtn = document.getElementById("pause-record-btn");
const resetRecordBtn = document.getElementById("reset-record-btn");
const recordingStatus = document.getElementById("recording-status");
const noteTextarea = document.getElementById("note-textarea");
const saveNoteBtn = document.getElementById("save-note-btn");
const notesList = document.getElementById("notes");

let recognition;
let noteContent = "";
let silenceTimer;
let isPausedByUser = false;
isLoadingNotes = false;

// Initialize speech recognition if available
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.continuous = true;

  recognition.onsoundend = function () {
    // new event listener
    // Start a timer that will stop recognition after 5 seconds
    silenceTimer = setTimeout(() => {
      recognition.stop();
      recordingStatus.textContent = "Stopped recording due to silence.";
    }, 5000);
  };

  recognition.onend = function () {
    // new event listener
    // If the recognition service disconnects (e.g., due to long silence), clear the silence timer
    clearTimeout(silenceTimer);
    if (!isPausedByUser) {
      recordingStatus.textContent =
        "Stopped recording due to Not Recognition Voice. Please Try Again.!";
    } else {
      isPausedByUser = false; // Reset the flag for future use
    }
  };
}

// Handle recording start
startRecordBtn.addEventListener("click", () => {
  if (recognition) {
    recognition.start();
    updateStatus("Recording Start......");
  }
});

// Handle recording pause
pauseRecordBtn.addEventListener("click", () => {
  if (recognition) {
    isPausedByUser = true;
    recognition.stop();
    updateStatus("Recording Paused.!");
  }
});
// Handle recording reset
resetRecordBtn.addEventListener("click", () => {
  if (recognition) {
    recognition.stop();
  }
  noteContent = "";
  noteTextarea.value = "";
  updateStatus("Recording Reset Successful.");
});

function updateStatus(text) {
  recordingStatus.textContent = text;
  recordingStatus.classList.add("sliding");
  setTimeout(() => recordingStatus.classList.remove("sliding"), 500);
}

// Handle the speech recognition results
recognition.onresult = function (event) {
  noteContent += event.results[event.results.length - 1][0].transcript;
  noteTextarea.value = noteContent;
  // console.log("Content before saving:", noteContent);
};

saveNoteBtn.addEventListener("click", () => {
  // console.log("Save button clicked. Current note content:", noteContent);
  if (recognition) {
    recognition.stop();
    updateStatus("Recording stopped.");
  }
  //   console.log("Recognition stopped. Time taken:", Date.now() - startTime, "ms");
  if (noteContent.trim() !== "") {
    try {
      localStorage.setItem(new Date().toISOString(), noteContent);
      noteContent = "";
      noteTextarea.value = "";
      // console.log("Calling loadNotes from [function or event description]");
      loadNotes();
      updateStatus("Note Saved Successfully.");
    } catch (e) {
      console.error("Failed to save note in localStorage:", e);
      updateStatus("Error: Note could not be saved.");
    }
  } else {
    updateStatus("Note is empty and won't be saved.");
  }
});

// Handle note saving
saveNoteBtn.addEventListener("click", () => {
  if (recognition) {
    recognition.stop();
    updateStatus("Recording stopped.");
  }
  if (noteContent.trim() !== "") {
    try {
      localStorage.setItem(new Date().toISOString(), noteContent);
      noteContent = "";
      noteTextarea.value = "";
      loadNotes();
      updateStatus("Note Saved Successfully.");
    } catch (e) {
      console.error("Failed to save note in localStorage:", e);
      updateStatus("Error: Note could not be saved.");
    }
  } else {
    updateStatus("Note is empty and won't be saved.");
  }
  saveCurrentNote();
});

const speech = new SpeechSynthesisUtterance(noteContent);
window.speechSynthesis.speak(speech);
noteTextarea.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    saveCurrentNote();
    noteTextarea.value = "";
  }
});

function saveCurrentNote() {
  const currentContent = noteTextarea.value; // Get the current content from textarea
  if (currentContent.trim() !== "") {
    try {
      const timestamp = new Date().toISOString();
      localStorage.setItem(timestamp, currentContent);
      loadNotes();
      updateStatus("Note Saved Successfully.");
    } catch (e) {
      console.error("Failed to save note in localStorage:", e);
      updateStatus("Error: Note could not be saved.");
    }
  } else {
    updateStatus("Note is empty and won't be saved.");
  }
}

// Add event listener for note deletion, listening, and downloading

notesList.addEventListener("click", function (e) {
  e.preventDefault();
  var target = e.target;

  // Get the closest 'li' element
  const noteElement = target.closest("li");

  if (!noteElement) return;

  // Get the note content
  const noteContent = noteElement.querySelector(".content").textContent;
  //   console.log("Saving note:", noteContent);
  if (event.target.matches(".listen-note")) {
    // If the 'Listen' button was clicked, read the note aloud
    const speech = new SpeechSynthesisUtterance(noteContent);
    window.speechSynthesis.speak(speech);
  } else if (event.target.matches(".delete-note")) {
    // If the 'Delete' button was clicked, delete the note

    // Here we retrieve the note's key from the local storage (you may need to adjust this part according to how you're saving the notes)
    const noteKey = noteElement.getAttribute("data-key");

    // Then we remove it from the local storage
    localStorage.removeItem(noteKey);

    // And finally remove the note element from the page
    noteElement.remove();
  } else if (event.target.matches(".download-note")) {
    // If the 'Download' button was clicked, download the note
    var blob = new Blob([noteContent], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "note.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
});

// Load saved notes
function loadNotes() {
  if (isLoadingNotes) return;
  isLoadingNotes = true;
  const keys = Object.keys(localStorage);
  notesList.innerHTML = "";
  notesList.style.display = "block";

  if (keys.length === 0) {
    // No notes in local storage, display a message
    notesList.innerHTML =
      '<li><p class="no-notes">You don\'t have any notes.</p></li>';
  } else {
    // There are notes in local storage, load them
    for (let key of keys) {
      const noteContent = localStorage.getItem(key);
      // Create li
      const noteElement = document.createElement("li");
      noteElement.className = "note";
      noteElement.setAttribute("data-key", key); // Store the key in a data attribute
      //   console.log("Loaded notes:", keys);
      // Create p for note content
      const contentElement = document.createElement("p");
      contentElement.className = "content";
      contentElement.textContent = noteContent;

      // Create Listen button
      const listenBtn = document.createElement("button");
      listenBtn.className = "listen-note";
      listenBtn.textContent = "Listen";

      // Create Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-note";
      deleteBtn.textContent = "Delete";

      // Create Download button
      const downloadBtn = document.createElement("button");
      downloadBtn.className = "download-note";
      downloadBtn.textContent = "Download";

      // Append everything to the li
      noteElement.appendChild(contentElement);
      noteElement.appendChild(listenBtn);
      noteElement.appendChild(deleteBtn);
      noteElement.appendChild(downloadBtn);

      // Append the li to the notes list
      notesList.appendChild(noteElement);
    }
  }
  isLoadingNotes = false;
}
// console.trace("loadNotes called from: ");

// console.log(localStorage.getItem('the_timestamp_key_here'));
// Load notes on page load
loadNotes();
