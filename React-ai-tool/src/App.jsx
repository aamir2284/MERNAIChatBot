import './App.css'
import React, { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

function App() {
  const [question, setQuestion] = useState('')
  const [chat, setChat] = useState([])
  const chatRef = useRef(null)

  // API key (you can move to .env later)
  const apiKey = "GEMINI_API_KEY"
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const askQuestion = async () => {
    if (!question.trim()) return

    const newQuestion = question
    setQuestion('')

    // Add user's question first
    setChat(prev => [...prev, { question: newQuestion, answer: '⏳ Thinking...' }])

    try {
      const result = await model.generateContent(newQuestion)
      const text = result.response.text()

      // Update last chat with answer
      setChat(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { question: newQuestion, answer: text }
        return updated
      })
    } catch (error) {
      console.error(error)
      setChat(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          question: newQuestion,
          answer: '❌ Something went wrong. Please check your API key or model name.',
        }
        return updated
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') askQuestion()
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chat])

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* Sidebar */}
      <div className="w-1/4 bg-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-700 text-lg font-semibold">
          Questions
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chat.length === 0 ? (
            <p className="text-gray-500">Your questions will appear here...</p>
          ) : (
            chat.map((item, index) => (
              <div
                key={index}
                className="text-sm border border-zinc-700 p-2 rounded-xl bg-zinc-900"
              >
                {item.question}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col border-l border-zinc-700">
        {/* Chat Messages */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {chat.length === 0 ? (
            <p className="text-gray-500">Ask something to start...</p>
          ) : (
            chat.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-start">
                  <div className="bg-blue-600 px-4 py-2 rounded-2xl max-w-xl text-left">
                    <span className="font-semibold text-sm">You:</span>
                    <p>{item.question}</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-zinc-700 px-4 py-2 rounded-2xl max-w-xl text-left">
                    <span className="font-semibold text-sm text-green-400">AI:</span>
                    <p className="whitespace-pre-line">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-zinc-700 p-4 bg-zinc-800">
          <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-2xl p-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-white px-3 py-2"
              placeholder="Ask me anything..."
            />
            <button
              onClick={askQuestion}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl transition-all duration-200"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
