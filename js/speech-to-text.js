// Initialize speech recognition functionality
document.addEventListener('DOMContentLoaded', function() {
    // Speech to text button
    const speechButton = document.getElementById('speechButton');
    if (speechButton) {
        speechButton.addEventListener('click', toggleSpeechRecognition);
    }
    
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        if (speechButton) {
            speechButton.disabled = true;
            speechButton.title = 'Speech recognition not supported in this browser';
            speechButton.innerHTML = '<i class="fas fa-microphone-slash"></i> Not Supported';
        }
        updateStatus('Speech recognition is not supported in your browser. Try Chrome or Edge.', 'warning');
    }
});

// Speech recognition variables
let recognition = null;
let isRecognizing = false;
let interimResult = ''; // Store interim results

// Toggle speech recognition on/off
function toggleSpeechRecognition() {
    const speechButton = document.getElementById('speechButton');
    
    if (!isRecognizing) {
        startSpeechRecognition();
        if (speechButton) {
            speechButton.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
            speechButton.classList.add('recording');
            speechButton.classList.remove('btn-danger');
            speechButton.classList.add('btn-success');
        }
    } else {
        stopSpeechRecognition();
        if (speechButton) {
            speechButton.innerHTML = '<i class="fas fa-microphone"></i> Speech to Text';
            speechButton.classList.remove('recording');
            speechButton.classList.remove('btn-success');
            speechButton.classList.add('btn-danger');
        }
    }
}

// Start speech recognition
function startSpeechRecognition() {
    // Check browser support again just to be safe
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        updateStatus('Speech recognition is not supported in your browser. Try Chrome or Edge.', 'error');
        return;
    }
    
    // Create speech recognition object
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    // Configure speech recognition
    recognition.continuous = true;      // Don't stop automatically
    recognition.interimResults = true;  // Get results as they come
    recognition.lang = 'en-US';         // Default language
    
    // Create overlay for showing interim results
    createInterimOverlay();
    
    // Handle results
    recognition.onresult = function(event) {
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        // Get current selection range
        const selection = saveSelection(editor);
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update interim overlay with current interim results
        if (interimTranscript !== '') {
            showInterimResult(interimTranscript);
        }
        
        // Insert final transcript at cursor position
        if (finalTranscript !== '') {
            insertTextAtCursor(editor, finalTranscript, selection);
            updateStatus('Added: ' + finalTranscript, 'success');
            hideInterimResult(); // Hide interim results when final text is inserted
        }
    };
    
    // Handle errors
    recognition.onerror = function(event) {
        const errorMessages = {
            'no-speech': 'No speech was detected. Please try again.',
            'audio-capture': 'No microphone was found or microphone is disabled.',
            'not-allowed': 'Microphone permission was denied. Please allow microphone access.',
            'network': 'A network error occurred. Please check your connection.',
            'aborted': 'Speech recognition was aborted.',
            'service-not-allowed': 'Speech recognition service is not allowed.'
        };
        
        const errorMsg = errorMessages[event.error] || `Error occurred: ${event.error}`;
        updateStatus(errorMsg, 'error');
        
        stopSpeechRecognition();
        const speechButton = document.getElementById('speechButton');
        if (speechButton) {
            speechButton.innerHTML = '<i class="fas fa-microphone"></i> Speech to Text';
            speechButton.classList.remove('recording');
            speechButton.classList.remove('btn-success');
            speechButton.classList.add('btn-danger');
        }
    };
    
    // Handle end of recognition
    recognition.onend = function() {
        isRecognizing = false;
        hideInterimResult(); // Make sure to hide interim results
        
        const speechButton = document.getElementById('speechButton');
        if (speechButton) {
            speechButton.innerHTML = '<i class="fas fa-microphone"></i> Speech to Text';
            speechButton.classList.remove('recording');
            speechButton.classList.remove('btn-success');
            speechButton.classList.add('btn-danger');
        }
    };
    
    // Start recognition
    try {
        recognition.start();
        isRecognizing = true;
        updateStatus('Listening... Speak now.', 'info');
    } catch (e) {
        updateStatus('Error starting speech recognition: ' + e.message, 'error');
    }
}

// Stop speech recognition
function stopSpeechRecognition() {
    if (recognition) {
        recognition.stop();
        isRecognizing = false;
        hideInterimResult(); // Make sure to hide interim results
        updateStatus('Speech recognition stopped', 'info');
    }
}

// Helper function to save current selection (cursor position)
function saveSelection(containerEl) {
    if (window.getSelection && document.createRange) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            // Check if the range is within the editor
            if (containerEl.contains(range.commonAncestorContainer)) {
                return range;
            }
        }
    }
    
    // If no valid selection, return a range at the end of the editor
    const range = document.createRange();
    range.selectNodeContents(containerEl);
    range.collapse(false); // Collapse to end
    return range;
}

// Helper function to restore selection (cursor position)
function restoreSelection(containerEl, range) {
    if (range && window.getSelection) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Helper function to insert text at current cursor position or selection
function insertTextAtCursor(editor, text, savedRange) {
    // Focus on the editor first
    editor.focus();
    
    // Restore the saved selection
    if (savedRange) {
        restoreSelection(editor, savedRange);
    }
    
    // Insert the text
    if (window.getSelection) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            // Create a text node with the transcribed text
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            
            // Move cursor to the end of the inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            // If no range, just append at the end
            editor.innerHTML += text;
        }
    } else {
        // Fallback for older browsers
        editor.innerHTML += text;
    }
}

// Create overlay for displaying interim results
function createInterimOverlay() {
    // Remove existing overlay if any
    let overlay = document.getElementById('interimResultsOverlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
    
    // Create new overlay
    overlay = document.createElement('div');
    overlay.id = 'interimResultsOverlay';
    overlay.style.position = 'fixed';
    overlay.style.bottom = '20px';
    overlay.style.left = '50%';
    overlay.style.transform = 'translateX(-50%)';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.color = 'white';
    overlay.style.padding = '10px 20px';
    overlay.style.borderRadius = '5px';
    overlay.style.zIndex = '9999';
    overlay.style.maxWidth = '80%';
    overlay.style.textAlign = 'center';
    overlay.style.display = 'none'; // Hidden by default
    
    document.body.appendChild(overlay);
}

// Show interim results in the overlay
function showInterimResult(text) {
    const overlay = document.getElementById('interimResultsOverlay');
    if (overlay) {
        overlay.textContent = text;
        overlay.style.display = 'block';
    }
}

// Hide interim results overlay
function hideInterimResult() {
    const overlay = document.getElementById('interimResultsOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}