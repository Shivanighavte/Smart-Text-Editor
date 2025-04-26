// Initialize the editor functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set focus on the editor
    const editor = document.getElementById('editor');
    if (editor) {
        editor.focus();
    }

    // Get all formatting buttons
    const buttons = document.querySelectorAll('[data-command]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const command = this.dataset.command;
            const value = this.dataset.value || '';
            
            if (command === 'formatBlock') {
                // Handle heading formatting
                document.execCommand(command, false, value);
            } else {
                // Handle other formatting commands
                document.execCommand(command, false, null);
            }
            
            // Focus back to the editor
            editor.focus();
            
            // Update button states based on current formatting
            updateButtonStates();
        });
    });

    // Update button states when selection changes
    editor.addEventListener('mouseup', updateButtonStates);
    editor.addEventListener('keyup', updateButtonStates);

    // Handle apply results button
    const applyResultButton = document.getElementById('applyResultButton');
    if (applyResultButton) {
        applyResultButton.addEventListener('click', applyResultsToEditor);
    }

    // Initialize tooltips
    initializeTooltips();
});

// Function to update the active state of formatting buttons
function updateButtonStates() {
    // Bold button
    updateButtonState('bold');
    
    // Italic button
    updateButtonState('italic');
    
    // Underline button
    updateButtonState('underline');
    
    // Strikethrough button
    updateButtonState('strikeThrough');
    
    // Alignment buttons
    updateButtonState('justifyLeft');
    updateButtonState('justifyCenter');
    updateButtonState('justifyRight');
    
    // List buttons
    updateButtonState('insertUnorderedList');
    updateButtonState('insertOrderedList');
    
    // Heading buttons - a bit more complex
    const formatBlock = document.queryCommandValue('formatBlock');
    document.querySelectorAll('[data-command="formatBlock"]').forEach(button => {
        const value = button.dataset.value;
        button.classList.toggle('active', formatBlock === value);
    });
}

// Helper function to update a single button state
function updateButtonState(command) {
    const isActive = document.queryCommandState(command);
    document.querySelectorAll(`[data-command="${command}"]`).forEach(button => {
        button.classList.toggle('active', isActive);
    });
}

// Function to apply results to editor
function applyResultsToEditor() {
    const resultsArea = document.getElementById('results');
    const editor = document.getElementById('editor');
    
    if (resultsArea && editor && resultsArea.textContent !== '') {
        // Replace editor content with results
        editor.innerHTML = resultsArea.innerHTML;
        
        // Show success message
        updateStatus('Results applied to editor', 'success');
    } else {
        updateStatus('No results to apply', 'warning');
    }
}

// Function to update status message
function updateStatus(message, type = 'info') {
    const statusArea = document.getElementById('status');
    if (statusArea) {
        let statusClass = 'text-info';
        
        switch(type) {
            case 'success':
                statusClass = 'text-success';
                break;
            case 'error':
                statusClass = 'text-danger';
                break;
            case 'warning':
                statusClass = 'text-warning';
                break;
            default:
                statusClass = 'text-info';
        }
        
        statusArea.innerHTML = `<p class="${statusClass}">${message}</p>`;
        
        // Clear status after 5 seconds if it's a success message
        if (type === 'success') {
            setTimeout(() => {
                statusArea.innerHTML = '<p class="text-muted">Ready</p>';
            }, 5000);
        }
    }
}

// Function to initialize tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Helper function to get selected text
function getSelectedText() {
    const editor = document.getElementById('editor');
    let text = '';
    
    if (window.getSelection) {
        const selection = window.getSelection();
        
        // Check if the selection is within the editor
        if (editor.contains(selection.anchorNode)) {
            text = selection.toString();
        }
    }
    
    return text;
}

// Helper function to get the full text from the editor
function getEditorContent() {
    const editor = document.getElementById('editor');
    return editor ? editor.innerHTML : '';
}

// Helper function to get plain text from the editor
function getEditorPlainText() {
    const editor = document.getElementById('editor');
    return editor ? editor.innerText || editor.textContent : '';
}

// Show processing modal
function showProcessingModal(message = 'Processing your request...') {
    const modal = document.getElementById('processingModal');
    const processingMessage = document.getElementById('processingMessage');
    
    if (processingMessage) {
        processingMessage.textContent = message;
    }
    
    if (modal) {
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        return modalInstance;
    }
    
    return null;
}

// Hide processing modal
function hideProcessingModal() {
    const modal = document.getElementById('processingModal');
    if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}