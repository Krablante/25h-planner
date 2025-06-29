import React, { useState } from 'react';

interface TodoInputProps {
  onAddTodo: (text: string) => void;
  placeholder: string;
}

const TodoInput: React.FC<TodoInputProps> = ({ onAddTodo, placeholder }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-grow bg-white/20 backdrop-blur-sm text-white placeholder-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 transition-shadow duration-300 shadow-md"
      />
      <button
        type="submit"
        className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/30 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!text.trim()}
      >
        Add
      </button>
    </form>
  );
};

export default TodoInput;