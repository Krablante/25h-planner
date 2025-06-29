import React from 'react';
import { Todo } from '../types';
import { TrashIcon } from './icons';

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, id: string) => void;
  onDragEnter: (e: React.DragEvent<HTMLLIElement>, id: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  isDragging: boolean;
  isDragOver: boolean;
  showTimer?: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onDelete, onDragStart, onDragEnter, onDragEnd, isDragging, isDragOver, showTimer = true }) => {
  const getRemainingTime = () => {
    const twentyFiveHours = 25 * 60 * 60 * 1000;
    const expiresAt = todo.createdAt + twentyFiveHours;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return 'Expired';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, todo.id)}
      onDragEnter={(e) => onDragEnter(e, todo.id)}
      onDragEnd={onDragEnd}
      className={`
        group flex items-center justify-between bg-white/10 backdrop-blur-md rounded-lg p-3 mb-2 cursor-grab
        transition-all duration-300 ease-in-out shadow-lg
        ${isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}
        ${isDragOver ? 'bg-white/20' : ''}
      `}
    >
      <div className="flex flex-col">
        <span className="text-white text-base">{todo.text}</span>
        {showTimer && <span className="text-gray-300 text-xs mt-1">{getRemainingTime()}</span>}
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label={`Delete task: ${todo.text}`}
      >
        <TrashIcon />
      </button>
    </li>
  );
};

export default TodoItem;