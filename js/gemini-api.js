
const GEMINI_API_KEY = 'AIzaSyCWTX8PuFB5vklnkNsoWefb-a07Z7ytUCc';


const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

document.addEventListener('DOMContentLoaded', function () {
    updateStatus("Gemini AI ready", "success");
});

function updateStatus(message, type = "info") {
    const statusEl = document.getElementById("statusMessage");
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `alert alert-${type}`;
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}


async function callGeminiAPI(prompt) {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error("API key not set.");
        }

        const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
        const requestBody = {
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ],
            generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || response.statusText;
            throw new Error(`API Error: ${errorMessage}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Gemini API Error:", error);
        return `An error occurred: ${error.message}.\n\nFalling back to local processing.`;
    }
}

// ========== Prompt Creators ==========

// 📄 Summarization
function createSummarizationPrompt(text) {
    return `Please summarize the following text in a concise way while preserving the key information:

${text}

Provide only the summary without any additional explanations or introductions.`;
}



// 🧑‍🎓 Formalize Text
function createFormalizePrompt(text) {
    return `Please rewrite the following text in a more formal tone, appropriate for professional or academic contexts:

${text}

Keep the meaning intact but make it more formal. Provide only the rewritten text without any additional explanations.`;
}



// 🌐 Translate Text
function createTranslationPrompt(text, targetLanguage) {
    return `Please translate the following text into ${targetLanguage}:

${text}

Provide only the translated text without any additional explanations and check bad words if their re present dont convert into translation.`;
}
