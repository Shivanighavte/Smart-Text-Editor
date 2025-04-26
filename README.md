# Smart-Text-Editor

⚠️ Important: To use Smart Features (Summarization, Translation, Formal Rewriting), you must set up `your own Google Gemini API key` inside the `gemini-api.js file`.
The demo includes a basic fallback, but for the best results, you should use your personal API key.



`Smart Text Editor` is an AI-powered, web-based writing tool designed to make text editing smarter, faster, and easier.  
It combines traditional text formatting with modern AI features like summarization, formal rewriting, translation, and speech-to-text, all in a beautiful and responsive interface.

Perfect for students, writers, and professionals who want to boost their writing productivity!

---

## ✨ Features

- **Rich Text Editing**  
  Format your content with bold, italic, underline, headings (H1-H3), lists, text alignment, and more.
  
- **File Management**  
  Open `.txt` files, copy editor content, clear text, and download your document quickly.

- **Smart AI Features (Powered by Gemini AI)**  
  - Summarize text intelligently  
  - Rewrite text in a formal tone  
  - Analyze tone (Friendly, Casual, Professional, etc.)

- **Speech-to-Text Integration**  
  Speak directly into the editor using your microphone (browser support required).

- **Multilingual Translation**  
  Translate your text into multiple languages including English, Hindi, Marathi, French, German, Chinese, Japanese, and Arabic.

- **Responsive Dark-Themed UI**  
  Built with Bootstrap 5, ensuring a sleek and mobile-friendly experience.

---

## 🛠️ Built With

- **HTML5 & CSS3** — Structuring and styling the application.
- **Bootstrap 5** — For responsive design and theming.
- **Vanilla JavaScript (Modular)** — For logic and functionality.
- **Google Gemini AI API** — For AI-powered text processing and translation.
- **Web Speech API** — For real-time speech recognition.

---

## 📂 Project Structure

```plaintext
├── index.html           # Main HTML page
├── css/
│   └── custom.css       # Custom styles
├── js/
│   ├── editor.js        # Text formatting and editor logic
│   ├── file-operations.js  # Open, copy, clear, download functionality
│   ├── gemini-api.js    # Gemini API integration
│   ├── text-analysis.js # Summarization and tone analysis
│   ├── speech-to-text.js # Speech recognition support
│   └── translation.js   # Language translation
```

---

## 🚀 Getting Started

1. **Clone or Download** this repository.
2. **Open `index.html`** directly in your browser.  
   (Preferably Chrome or Edge for full functionality.)
3. **Start Editing!**  
   - Format text  
   - Use Smart Features  
   - Translate content  
   - Or even speak directly to the editor!

---

## ⚡ Notes

- **Speech-to-Text** works best on Chrome and Edge. Firefox and Safari might have limited support.
- **Gemini API** requires a valid API Key for production use. A basic fallback is available for demo purposes.
- **Dark Theme** is enabled by default using Bootstrap's dark mode for better readability.
