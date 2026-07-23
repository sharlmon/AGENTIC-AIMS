"use client"

import { useState, useEffect, useRef, forwardRef } from "react"

type VoiceInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  buttonClassName?: string
  style?: React.CSSProperties
  label?: string
  wide?: boolean
  textarea?: boolean
}

const VoiceInput = forwardRef<HTMLTextAreaElement | HTMLInputElement, VoiceInputProps>(function VoiceInput({ value, onChange, placeholder, className, rows, buttonClassName, style, label, wide, textarea }, ref) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      let finalTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setTranscript((prev) => {
          const combined = prev ? prev + " " + finalTranscript : finalTranscript
          onChange(combined)
          return combined
        })
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        setError(event.error)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [onChange])

  const toggleListening = () => {
    setError(null)
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      setTranscript("")
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (e) {
        setError("Failed to start voice input")
      }
    }
  }

  const clearTranscript = () => {
    setTranscript("")
    onChange("")
  }

  const input = textarea || rows ? (
    <textarea
      ref={ref as any}
      className={className || "textarea"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={style}
    />
  ) : (
    <input
      ref={ref as any}
      className={className || "input"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={style}
    />
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...(wide ? { gridColumn: "1 / -1" } : {}) }}>
      {label && <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink-2)" }}>{label}</label>}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>{input}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button
            type="button"
            onClick={toggleListening}
            className={isListening ? "admin-btn admin-btn-danger" : (buttonClassName || "admin-btn")}
            style={{ padding: "8px 12px", fontSize: "0.72rem", minWidth: 44, minHeight: 44 }}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? "⏹" : "🎤"}
          </button>
          {transcript && (
            <button
              type="button"
              onClick={clearTranscript}
              className="admin-btn"
              style={{ padding: "4px 8px", fontSize: "0.65rem" }}
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {isListening && (
        <p style={{ fontSize: "0.72rem", color: "var(--signal)", fontFamily: "var(--font-mono)", marginTop: 4, gridColumn: "1 / -1" }}>
          ● Listening... speak now
        </p>
      )}
      {error && <p style={{ fontSize: "0.72rem", color: "#c62828", marginTop: 4, gridColumn: "1 / -1" }}>{error}</p>}
    </div>
  )
})

export { VoiceInput }
