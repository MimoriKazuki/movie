'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  suggestions?: string[]
}

export function TagInput({ 
  value = [], 
  onChange, 
  placeholder = "タグを入力してEnterキーで追加",
  maxTags = 10,
  suggestions = []
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      onChange([...value, trimmedTag])
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
  )

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white min-h-[42px] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[150px] border-none outline-none text-gray-900 placeholder-gray-400"
          style={{ backgroundColor: 'transparent' }}
        />
      </div>
      
      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-900"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <p className="mt-1 text-xs text-gray-500">
        {value.length}/{maxTags} タグ • Enterキーで追加
      </p>
    </div>
  )
}