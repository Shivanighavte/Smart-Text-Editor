// Initialize file operation functionality
document.addEventListener('DOMContentLoaded', function() {
    // File input for opening text files
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileOpen);
    }
    
    // Copy button
    const copyButton = document.getElementById('copyButton');
    if (copyButton) {
        copyButton.addEventListener('click', copyEditorContent);
    }
    
    // Clear button
    const clearButton = document.getElementById('clearButton');
    if (clearButton) {
        clearButton.addEventListener('click', clearEditor);
    }
    
    // Download button
    const downloadButton = document.getElementById('downloadButton');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadEditorContent);
    }
});

// Function to handle opening a text file
function handleFileOpen(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if it's a text file
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        updateStatus('Please select a text (.txt) file', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const editor = document.getElementById('editor');
        if (editor) {
            // Get the file content
            const content = e.target.result;
            
            // Set the content to the editor (as plain text, preserving line breaks)
            editor.innerText = content;
            
            // Update status
            updateStatus(`File "${file.name}" opened successfully`, 'success');
        }
    };
    
    reader.onerror = function() {
        updateStatus('Error reading file', 'error');
    };
    
    // Read the file as text
    reader.readAsText(file);
}

// Function to copy editor content to clipboard
function copyEditorContent() {
    const editor = document.getElementById('editor');
    
    if (!editor || !editor.textContent.trim()) {
        updateStatus('No content to copy', 'warning');
        return;
    }
    
    // Try to use the Clipboard API first
    if (navigator.clipboard) {
        navigator.clipboard.writeText(editor.innerText)
            .then(() => {
                updateStatus('Content copied to clipboard', 'success');
            })
            .catch(err => {
                console.error('Clipboard API error:', err);
                fallbackCopy();
            });
    } else {
        fallbackCopy();
    }
    
    // Fallback copy method
    function fallbackCopy() {
        // Create a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = editor.innerText;
        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            // Execute copy command
            const successful = document.execCommand('copy');
            if (successful) {
                updateStatus('Content copied to clipboard', 'success');
            } else {
                updateStatus('Unable to copy content', 'error');
            }
        } catch (err) {
            console.error('execCommand error:', err);
            updateStatus('Unable to copy content', 'error');
        }
        
        // Clean up
        document.body.removeChild(textarea);
    }
}

// Function to clear the editor
function clearEditor() {
    const editor = document.getElementById('editor');
    
    if (!editor || !editor.textContent.trim()) {
        updateStatus('Editor is already empty', 'info');
        return;
    }
    
    // Ask for confirmation before clearing
    if (confirm('Are you sure you want to clear all content?')) {
        editor.innerHTML = '';
        updateStatus('Editor cleared', 'success');
    }
}

// Function to download editor content as a text file
function downloadEditorContent() {
    const editor = document.getElementById('editor');
    
    if (!editor || !editor.textContent.trim()) {
        updateStatus('No content to download', 'warning');
        return;
    }
    
    // Get the content
    const content = editor.innerText;
    
    // Create a Blob from the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create a download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    
    // Generate a filename with date
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    a.download = `document_${formattedDate}.txt`;
    
    // Append to body, click to download, and remove
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }, 100);
    
    updateStatus('Document downloaded successfully', 'success');
}