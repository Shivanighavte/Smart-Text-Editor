// Initialize translation functionality
document.addEventListener('DOMContentLoaded', function() {
    // All translation buttons
    const translateButtons = document.querySelectorAll('.translate-button');
    if (translateButtons) {
        translateButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetLanguage = this.dataset.lang;
                translateText(targetLanguage);
            });
        });
    }
});

// Function to translate text using Gemini API
async function translateText(targetLanguage) {
    // Get the selected text or fall back to the entire editor content
    let text = getSelectedText();
    if (!text) {
        text = getEditorPlainText();
    }
    
    if (!text) {
        updateStatus('No text to translate', 'error');
        return;
    }
    
    // Show processing modal
    showProcessingModal(`Translating to ${targetLanguage}...`);
    
    try {
        // Create translation prompt
        const prompt = createTranslationPrompt(text, targetLanguage);
        
        // Call Gemini API
        const result = await callGeminiAPI(prompt);
        
        // Check if API request failed and fall back to client-side processing
        if (result.includes('An error occurred')) {
            // Fall back to local processing
            const localResult = simulateTranslation(text, targetLanguage);
            
            // Hide processing modal
            hideProcessingModal();
            
            // Display the results with a note about using fallback
            const resultsArea = document.getElementById('results');
            if (resultsArea) {
                resultsArea.innerHTML = `
                    <div class="mb-2"><strong>Translation to ${targetLanguage}:</strong></div>
                    <div class="alert alert-warning mb-2">Gemini AI unavailable. Using basic translation instead.</div>
                    <p>${localResult}</p>
                `;
                updateStatus(`Translation to ${targetLanguage} completed with local processing`, 'warning');
            }
        } else {
            // Hide processing modal
            hideProcessingModal();
            
            // Display the results
            const resultsArea = document.getElementById('results');
            if (resultsArea) {
                resultsArea.innerHTML = `
                    <div class="mb-2"><strong>Translation to ${targetLanguage} (Powered by Gemini AI):</strong></div>
                    <p>${result}</p>
                `;
                updateStatus(`Translation to ${targetLanguage} completed successfully`, 'success');
            }
        }
    } catch (error) {
        // Hide processing modal
        hideProcessingModal();
        
        // Fall back to client-side processing
        const localResult = simulateTranslation(text, targetLanguage);
        
        // Display the results with a note about using fallback
        const resultsArea = document.getElementById('results');
        if (resultsArea) {
            resultsArea.innerHTML = `
                <div class="mb-2"><strong>Translation to ${targetLanguage}:</strong></div>
                <div class="alert alert-warning mb-2">Error contacting Gemini AI: ${error.message}. Using basic translation instead.</div>
                <p>${localResult}</p>
            `;
            updateStatus(`Translation to ${targetLanguage} completed with local processing`, 'warning');
        }
    }
}

// Fallback: Simulate translation (client-side demo only)
function simulateTranslation(text, targetLanguage) {
    // For demo purposes, we'll modify the text slightly to simulate translation
    // This is used as a fallback when the API is unavailable
    
    // Common words/phrases in different languages for demonstration
    const greetings = {
        'English': ['Hello', 'Thank you', 'Goodbye', 'Yes', 'No', 'Please', 'Sorry'],
        'Spanish': ['Hola', 'Gracias', 'Adiós', 'Sí', 'No', 'Por favor', 'Lo siento'],
        'French': ['Bonjour', 'Merci', 'Au revoir', 'Oui', 'Non', 'S\'il vous plaît', 'Désolé'],
        'German': ['Hallo', 'Danke', 'Auf Wiedersehen', 'Ja', 'Nein', 'Bitte', 'Entschuldigung'],
        'Chinese': ['你好', '谢谢', '再见', '是的', '不', '请', '对不起'],
        'Japanese': ['こんにちは', 'ありがとう', 'さようなら', 'はい', 'いいえ', 'お願いします', 'ごめんなさい'],
        'Hindi': ['नमस्ते', 'धन्यवाद', 'अलविदा', 'हां', 'नहीं', 'कृपया', 'माफ़ करें'],
        'Arabic': ['مرحبا', 'شكرا لك', 'مع السلامة', 'نعم', 'لا', 'من فضلك', 'آسف']
    };
    
    // If language not supported in our demo, return original with a note
    if (!greetings[targetLanguage]) {
        return text + ' [This is a fallback translation. Please enter a valid Gemini API key for better results.]';
    }
    
    // For demo purposes only: replace some common words/phrases
    let translatedText = text;
    
    // Replace common words if found
    for (let i = 0; i < greetings['English'].length; i++) {
        const regex = new RegExp('\\b' + greetings['English'][i] + '\\b', 'gi');
        translatedText = translatedText.replace(regex, greetings[targetLanguage][i]);
    }
    
    // Add a signature to make it clear this is a fallback
    translatedText += '\n\n[Note: This is a basic fallback translation. Enter a valid Gemini API key for better results.]';
    
    return translatedText;
}