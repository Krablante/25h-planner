import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Todo } from './types';
import TodoInput from './components/TodoInput';
import TodoItem from './components/TodoItem';

const DAILY_STORAGE_KEY = 'serenePlannerTodos';
const GLOBAL_STORAGE_KEY = 'serenePlannerGlobalTodos';
const EXPIRATION_TIME_MS = 25 * 60 * 60 * 1000; // 25 hours

type View = 'daily' | 'global';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [globalTodos, setGlobalTodos] = useState<Todo[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('daily');

  const dragItemId = useRef<string | null>(null);
  const dragOverItemId = useRef<string | null>(null);

  const filterExpiredTodos = useCallback((todosToFilter: Todo[]): Todo[] => {
    const now = Date.now();
    return todosToFilter.filter(todo => (now - todo.createdAt) < EXPIRATION_TIME_MS);
  }, []);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedDailyTodos = localStorage.getItem(DAILY_STORAGE_KEY);
      if (storedDailyTodos) {
        setTodos(filterExpiredTodos(JSON.parse(storedDailyTodos)));
      }
      const storedGlobalTodos = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (storedGlobalTodos) {
        setGlobalTodos(JSON.parse(storedGlobalTodos));
      }
    } catch (error) {
      console.error("Failed to load todos from localStorage", error);
    }
  }, [filterExpiredTodos]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(globalTodos));
    }
  }, [globalTodos, isClient]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTodos(prevTodos => filterExpiredTodos(prevTodos));
    }, 60000); // Check for expired todos every minute

    return () => clearInterval(interval);
  }, [filterExpiredTodos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      createdAt: Date.now(),
    };
    if (activeView === 'daily') {
      setTodos(prevTodos => [newTodo, ...prevTodos]);
    } else {
      setGlobalTodos(prevTodos => [newTodo, ...prevTodos]);
    }
  };

  const deleteTodo = (id: string) => {
    if (activeView === 'daily') {
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } else {
      setGlobalTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    dragItemId.current = id;
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.preventDefault();
    dragOverItemId.current = id;
    
    const currentList = activeView === 'daily' ? todos : globalTodos;
    const setList = activeView === 'daily' ? setTodos : setGlobalTodos;

    const reorderedList = [...currentList];
    const draggedItem = reorderedList.find(todo => todo.id === dragItemId.current);
    const overItemIndex = reorderedList.findIndex(todo => todo.id === dragOverItemId.current);
    
    if (draggedItem && overItemIndex !== -1 && dragItemId.current !== id) {
      const reordered = reorderedList.filter(todo => todo.id !== dragItemId.current);
      reordered.splice(overItemIndex, 0, draggedItem);
      setList(reordered);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    dragItemId.current = null;
    dragOverItemId.current = null;
    setDraggedItemId(null);
  };
  
  const currentList = activeView === 'daily' ? todos : globalTodos;
  const placeholder = activeView === 'daily' ? "What's the plan for today?" : "What's a bigger goal?";

  return (
    <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(https://picsum.photos/seed/serenity/1920/1080)` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      </div>
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-3 sm:p-6">
        <div className="w-full max-w-2xl mx-auto">
          <header className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
              Serene Planner
            </h1>
          </header>
          
          <div className="bg-black/20 backdrop-blur-lg p-4 sm:p-8 rounded-2xl shadow-2xl border border-white/10">
            <div className="flex justify-center mb-6 border-b border-white/10">
              <button
                onClick={() => setActiveView('daily')}
                className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-medium transition-colors duration-300 rounded-t-lg ${
                  activeView === 'daily' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setActiveView('global')}
                className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-medium transition-colors duration-300 rounded-t-lg ${
                  activeView === 'global' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white'
                }`}
              >
                Global
              </button>
            </div>

            <TodoInput onAddTodo={addTodo} placeholder={placeholder} />
            
            <ul className="max-h-[65vh] overflow-y-auto pr-2 -mr-2">
              {currentList.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onDelete={deleteTodo}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedItemId === todo.id}
                  isDragOver={dragOverItemId.current === todo.id && draggedItemId !== todo.id}
                  showTimer={activeView === 'daily'}
                />
              ))}
              {currentList.length === 0 && (
                 <div className="text-center py-10">
                   <p className="text-gray-300">
                    {activeView === 'daily' ? 'Your mind is clear. Add a plan to begin.' : 'No global goals yet. Add one!'}
                   </p>
                 </div>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;