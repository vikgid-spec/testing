import React, { useState } from 'react';
import { LogOut, ArrowLeft } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState([
    'Finish homework',
    'Call John',
    'Buy groceries'
  ]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-white flex items-center justify-center px-4 py-8 font-['Open_Sans']">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-blue-200/10 to-transparent animate-pulse"></div>
      
      {/* Back button */}
      <button
        onClick={onLogout}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Dashboard card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
            Your Tasks
          </h1>
          
          {/* Task list */}
          <div className="mb-8">
            <ul className="space-y-4">
              {tasks.map((task, index) => (
                <li key={index} className="flex items-center text-lg text-gray-700">
                  <span className="font-semibold text-blue-600 mr-3 min-w-[24px]">
                    {index + 1}.
                  </span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Add new task form */}
          <form onSubmit={handleAddTask} className="mb-8">
            <div className="mb-4">
              <label htmlFor="newTask" className="block text-sm font-semibold text-gray-700 mb-2">
                New Task
              </label>
              <input
                type="text"
                id="newTask"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400"
                placeholder="Enter a new task"
              />
            </div>
            
            {/* Add Task button */}
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out hover:bg-blue-700"
            >
              Add Task
            </button>
          </form>
          
          {/* Logout button */}
          <button
            onClick={onLogout}
            className="w-full py-4 bg-gray-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;