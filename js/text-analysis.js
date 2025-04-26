// Initialize text analysis features
document.addEventListener('DOMContentLoaded', function() {
    // Text summarization
    const summarizeButton = document.getElementById('summarizeButton');
    if (summarizeButton) {
        summarizeButton.addEventListener('click', () => analyzeText('summarize'));
    }
    
    // Tone analysis
    const toneButton = document.getElementById('toneButton');
    if (toneButton) {
        toneButton.addEventListener('click', () => analyzeText('tone'));
    }
    
    // Formal rewriting
    const formalButton = document.getElementById('formalButton');
    if (formalButton) {
        formalButton.addEventListener('click', () => analyzeText('formal'));
    }
    
    // Concise rewriting
    const conciseButton = document.getElementById('conciseButton');
    if (conciseButton) {
        conciseButton.addEventListener('click', () => analyzeText('concise'));
    }
});

// Function to analyze text with different modes using Gemini API
async function analyzeText(type) {
    // Get the selected text or fall back to the entire editor content
    let text = getSelectedText();
    if (!text) {
        text = getEditorPlainText();
    }
    
    if (!text) {
        updateStatus('No text to analyze', 'error');
        return;
    }
    
    // Show processing modal with appropriate message
    let processingMessage = 'Processing your request...';
    switch (type) {
        case 'summarize':
            processingMessage = 'Summarizing your text...';
            break;
        case 'tone':
            processingMessage = 'Analyzing tone...';
            break;
        case 'formal':
            processingMessage = 'Making text more formal...';
            break;
        case 'concise':
            processingMessage = 'Making text more concise...';
            break;
    }
    
    showProcessingModal(processingMessage);
    
    try {
        // Create prompt based on analysis type
        let prompt = '';
        switch (type) {
            case 'summarize':
                prompt = createSummarizationPrompt(text);
                break;
            case 'tone':
                prompt = createToneAnalysisPrompt(text);
                break;
            case 'formal':
                prompt = createFormalizePrompt(text);
                break;
            case 'concise':
                prompt = createConcisePrompt(text);
                break;
            default:
                hideProcessingModal();
                updateStatus('Invalid analysis type', 'error');
                return;
        }
        
        // Call Gemini API
        const result = await callGeminiAPI(prompt);
        
        // Check if API request failed and fall back to client-side processing
        if (result.includes('An error occurred')) {
            // Fall back to local processing
            let localResult = '';
            
            switch (type) {
                case 'summarize':
                    localResult = createSummarizedText(text);
                    break;
                case 'tone':
                    localResult = analyzeTone(text);
                    break;
                case 'formal':
                    localResult = makeFormal(text);
                    break;
                case 'concise':
                    localResult = makeConcise(text);
                    break;
            }
            
            // Hide processing modal
            hideProcessingModal();
            
            // Display the results with a note about using fallback
            const resultsArea = document.getElementById('results');
            if (resultsArea) {
                resultsArea.innerHTML = `
                    <div class="mb-2"><strong>${getAnalysisTypeLabel(type)} Results:</strong></div>
                    <div class="alert alert-warning mb-2">Gemini AI unavailable. Using local processing instead.</div>
                    <p>${localResult}</p>
                `;
                updateStatus(`${getAnalysisTypeLabel(type)} completed with local processing`, 'warning');
            }
        } else {
            // Hide processing modal
            hideProcessingModal();
            
            // Display the results
            const resultsArea = document.getElementById('results');
            if (resultsArea) {
                resultsArea.innerHTML = `
                    <div class="mb-2"><strong>${getAnalysisTypeLabel(type)} Results (Powered by Gemini AI):</strong></div>
                    <p>${result}</p>
                `;
                updateStatus(`${getAnalysisTypeLabel(type)} completed successfully`, 'success');
            }
        }
    } catch (error) {
        // Hide processing modal
        hideProcessingModal();
        
        // Fall back to client-side processing
        let localResult = '';
        
        switch (type) {
            case 'summarize':
                localResult = createSummarizedText(text);
                break;
            case 'tone':
                localResult = analyzeTone(text);
                break;
            case 'formal':
                localResult = makeFormal(text);
                break;
            case 'concise':
                localResult = makeConcise(text);
                break;
        }
        
        // Display the results with a note about using fallback
        const resultsArea = document.getElementById('results');
        if (resultsArea) {
            resultsArea.innerHTML = `
                <div class="mb-2"><strong>${getAnalysisTypeLabel(type)} Results:</strong></div>
                <div class="alert alert-warning mb-2">Error contacting Gemini AI: ${error.message}. Using local processing instead.</div>
                <p>${localResult}</p>
            `;
            updateStatus(`${getAnalysisTypeLabel(type)} completed with local processing`, 'warning');
        }
    }
}

// Helper function to get a friendly label for the analysis type
function getAnalysisTypeLabel(type) {
    switch (type) {
        case 'summarize':
            return 'Text Summarization';
        case 'tone':
            return 'Tone Analysis';
        case 'formal':
            return 'Formal Rewriting';
        case 'concise':
            return 'Concise Rewriting';
        default:
            return 'Text Analysis';
    }
}

// ---- Fallback client-side implementations ----
// These are used when the Gemini API is unavailable

// Client-side text summarization (simplified)
function createSummarizedText(text) {
    // Basic summarization logic:
    // 1. Split text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // 2. If text is already short, return as is
    if (sentences.length <= 3) {
        return text;
    }
    
    // 3. Otherwise, take roughly 1/3 of the sentences, but at least 2
    const numSentencesToInclude = Math.max(2, Math.floor(sentences.length / 3));
    
    // 4. Take sentences from the beginning, middle and end for better context
    let summaryArr = [];
    summaryArr.push(sentences[0]); // First sentence
    
    // Add more sentences if needed
    if (numSentencesToInclude > 2) {
        // Add some from the middle
        const middleIdx = Math.floor(sentences.length / 2);
        for (let i = 1; i < numSentencesToInclude - 1; i++) {
            const step = Math.floor(sentences.length / numSentencesToInclude);
            const idx = (i * step) % sentences.length;
            if (!summaryArr.includes(sentences[idx])) {
                summaryArr.push(sentences[idx]);
            }
        }
    }
    
    // Add the last sentence if not already included
    if (!summaryArr.includes(sentences[sentences.length - 1])) {
        summaryArr.push(sentences[sentences.length - 1]);
    }
    
    // Join the selected sentences
    return summaryArr.join(' ');
}

// Client-side tone analysis (simplified)
function analyzeTone(text) {
    // Simple word-based tone analysis
    const text_lower = text.toLowerCase();
    
    // Check for formal tone markers
    const formalWords = ['therefore', 'however', 'consequently', 'furthermore', 'thus', 'hence'];
    const formalCount = formalWords.filter(word => text_lower.includes(word)).length;
    
    // Check for casual tone markers
    const casualWords = ['hey', 'yeah', 'cool', 'awesome', 'gonna', 'wanna', 'stuff'];
    const casualCount = casualWords.filter(word => text_lower.includes(word)).length;
    
    // Check for professional terms
    const professionalWords = ['analysis', 'implement', 'strategy', 'efficient', 'evaluate'];
    const professionalCount = professionalWords.filter(word => text_lower.includes(word)).length;
    
    // Check for friendly/warm tone
    const friendlyWords = ['please', 'thank', 'appreciate', 'grateful', 'happy', 'glad'];
    const friendlyCount = friendlyWords.filter(word => text_lower.includes(word)).length;
    
    // Calculate average sentence length (longer sentences often indicate formality)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const avgSentenceLength = text.length / sentences.length;
    
    // Determine the tone based on our simplified analysis
    let tone = 'Neutral';
    let details = 'The text appears to have a neutral tone.';
    
    if (formalCount > 0 && avgSentenceLength > 20 && casualCount === 0) {
        tone = 'Formal';
        details = 'The text uses formal language, complex sentence structures, and professional terminology.';
    } else if (casualCount > 0 || avgSentenceLength < 12) {
        tone = 'Casual';
        details = 'The text uses casual language and simpler sentence structures.';
    } else if (professionalCount > 0) {
        tone = 'Professional';
        details = 'The text uses professional terminology and focuses on work-related concepts.';
    } else if (friendlyCount > 0) {
        tone = 'Friendly';
        details = 'The text uses warm and approachable language.';
    }
    
    return `<strong>Tone:</strong> ${tone}<br><br>${details}`;
}

// Client-side formal text conversion (simplified)
function makeFormal(text) {
    // Simple word replacements to make text more formal
    let formalText = text;
    
    const replacements = {
        'a lot': 'significantly',
        'amazing': 'remarkable',
        'awesome': 'impressive',
        'bad': 'unfavorable',
        'big': 'substantial',
        'boss': 'supervisor',
        'buy': 'purchase',
        'cool': 'excellent',
        'crazy': 'extraordinary',
        'deal with': 'address',
        'do': 'perform',
        'get': 'obtain',
        'good': 'satisfactory',
        'great': 'exceptional',
        'happy': 'pleased',
        'hate': 'strongly dislike',
        'help': 'assist',
        'huge': 'extensive',
        'job': 'position',
        'kids': 'children',
        'know': 'understand',
        'like': 'appreciate',
        'look at': 'examine',
        'love': 'greatly appreciate',
        'makes sense': 'is logical',
        'meet': 'convene',
        'nice': 'agreeable',
        'old': 'previous',
        'pretty': 'relatively',
        'right now': 'currently',
        'show': 'demonstrate',
        'stuff': 'materials',
        'sure': 'certainly',
        'tell': 'inform',
        'think': 'believe',
        'totally': 'completely',
        'use': 'utilize',
        'want': 'desire',
        'yeah': 'yes',
        'you know': ''
    };
    
    // Apply replacements
    Object.entries(replacements).forEach(([casual, formal]) => {
        const regex = new RegExp('\\b' + casual + '\\b', 'gi');
        formalText = formalText.replace(regex, formal);
    });
    
    // Replace contractions
    const contractions = {
        "don't": "do not",
        "doesn't": "does not",
        "won't": "will not",
        "can't": "cannot",
        "isn't": "is not",
        "aren't": "are not",
        "wasn't": "was not",
        "weren't": "were not",
        "haven't": "have not",
        "hasn't": "has not",
        "hadn't": "had not",
        "wouldn't": "would not",
        "couldn't": "could not",
        "shouldn't": "should not",
        "I'm": "I am",
        "you're": "you are",
        "he's": "he is",
        "she's": "she is",
        "it's": "it is",
        "we're": "we are",
        "they're": "they are",
        "I've": "I have",
        "you've": "you have",
        "we've": "we have",
        "they've": "they have",
        "I'll": "I will",
        "you'll": "you will",
        "he'll": "he will",
        "she'll": "she will",
        "it'll": "it will",
        "we'll": "we will",
        "they'll": "they will",
        "I'd": "I would",
        "you'd": "you would",
        "he'd": "he would",
        "she'd": "she would",
        "it'd": "it would",
        "we'd": "we would",
        "they'd": "they would"
    };
    
    // Apply contraction replacements
    Object.entries(contractions).forEach(([contraction, expanded]) => {
        const regex = new RegExp('\\b' + contraction + '\\b', 'gi');
        formalText = formalText.replace(regex, expanded);
    });
    
    return formalText;
}

// Client-side concise text conversion (simplified)
function makeConcise(text) {
    // Simple concise text creation logic:
    
    // 1. Remove filler phrases
    const fillerPhrases = [
        'in order to', 'due to the fact that', 'for the purpose of', 
        'in the event that', 'in the process of', 'with regard to',
        'with the exception of', 'in spite of the fact that', 'as a matter of fact',
        'for all intents and purposes', 'in a manner of speaking', 'at the present time',
        'for the most part', 'on the grounds that', 'in light of the fact that',
        'it should be noted that', 'it is important to note that', 'needless to say',
        'the fact of the matter is', 'as far as I am concerned', 'in my personal opinion'
    ];
    
    let conciseText = text;
    fillerPhrases.forEach(phrase => {
        const replacements = {
            'in order to': 'to',
            'due to the fact that': 'because',
            'for the purpose of': 'for',
            'in the event that': 'if',
            'in the process of': 'while',
            'with regard to': 'about',
            'with the exception of': 'except',
            'in spite of the fact that': 'although',
            'as a matter of fact': 'actually',
            'for all intents and purposes': 'essentially',
            'in a manner of speaking': 'somewhat',
            'at the present time': 'now',
            'for the most part': 'mostly',
            'on the grounds that': 'because',
            'in light of the fact that': 'because',
            'it should be noted that': '',
            'it is important to note that': '',
            'needless to say': '',
            'the fact of the matter is': '',
            'as far as I am concerned': '',
            'in my personal opinion': ''
        };
        
        if (replacements[phrase]) {
            const regex = new RegExp(phrase, 'gi');
            conciseText = conciseText.replace(regex, replacements[phrase]);
        }
    });
    
    // 2. Remove redundant words
    const redundantPairs = [
        ['completely|totally|absolutely', 'eliminated'],
        ['future', 'plans'],
        ['past', 'history'],
        ['unexpected', 'surprise'],
        ['repeat', 'again'],
        ['final', 'outcome'],
        ['basic', 'fundamentals'],
        ['true', 'facts'],
        ['free', 'gift'],
        ['new', 'innovation'],
        ['personal', 'opinion'],
        ['advance', 'planning'],
        ['current', 'trend'],
        ['various', 'different'],
        ['each', 'individual']
    ];
    
    redundantPairs.forEach(pair => {
        const regex = new RegExp(pair[0] + ' ' + pair[1], 'gi');
        conciseText = conciseText.replace(regex, pair[1]);
    });
    
    // 3. Split into sentences and reduce compound sentences where possible
    let sentences = conciseText.match(/[^.!?]+[.!?]+/g) || [conciseText];
    sentences = sentences.map(sentence => {
        // Remove "There is" and "There are" starts where possible
        return sentence
            .replace(/^There (is|are) /i, '')
            .replace(/^It is /i, '')
            .trim();
    });
    
    return sentences.join(' ');
}