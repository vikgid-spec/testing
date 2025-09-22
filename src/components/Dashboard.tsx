import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Plus, Trash2, Edit3, Check, X, Sparkles, Save } from 'lucide-react';
import { authHelpers } from '../lib/supabase';
import { taskHelpers, Task } from '../lib/tasks';
import { subtaskHelpers, Subtask } from '../lib/subtasks';

interface DashboardProps {
  onLogout: () => void;
  user: any | null;
}

function Dashboard({ onLogout, user }: DashboardProps) {
  // Don't render dashboard if user is not authenticated
  if (!user) {
    return null;
  }

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});
  const [generatingSubtasks, setGeneratingSubtasks] = useState<string | null>(null);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<Record<string, string[]>>({});
  const [savingSubtask, setSavingSubtask] = useState<string | null>(null);
  const [hasGeneratedSubtasks, setHasGeneratedSubtasks] = useState<Set<string>>(new Set());

  // Load tasks when component mounts
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setTasksLoading(true);
    try {
      const { data, error } = await taskHelpers.getTasks();
      if (error) {
        console.error('Error loading tasks:', error);
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const loadSubtasks = async (taskId: string) => {
    try {
      const { data, error } = await subtaskHelpers.getSubtasks(taskId);
      if (error) {
        console.error('Error loading subtasks:', error);
      } else {
        setSubtasks(prev => ({ ...prev, [taskId]: data || [] }));
      }
    } catch (error) {
      console.error('Error loading subtasks:', error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await taskHelpers.createTask(newTask.trim(), user.id, newTaskPriority);
      if (error) {
        console.error('Error creating task:', error);
      } else if (data) {
        setTasks([data, ...tasks]);
        setNewTask('');
        setNewTaskPriority('medium');
        // Load subtasks for the new task
        loadSubtasks(data.id);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'in-progress' | 'done') => {
    try {
      const { data, error } = await taskHelpers.updateTaskStatus(taskId, newStatus);
      if (error) {
        console.error('Error updating task status:', error);
      } else if (data) {
        setTasks(tasks.map(task => task.id === taskId ? data : task));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: 'low' | 'medium' | 'high') => {
    try {
      const { data, error } = await taskHelpers.updateTaskPriority(taskId, newPriority);
      if (error) {
        console.error('Error updating task priority:', error);
      } else if (data) {
        setTasks(tasks.map(task => task.id === taskId ? data : task));
      }
    } catch (error) {
      console.error('Error updating task priority:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await taskHelpers.deleteTask(taskId);
      if (error) {
        console.error('Error deleting task:', error);
      } else {
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task.id);
    setEditingTitle(task.title);
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!editingTitle.trim()) return;

    try {
      const { data, error } = await taskHelpers.updateTaskTitle(taskId, editingTitle.trim());
      if (error) {
        console.error('Error updating task title:', error);
      } else if (data) {
        setTasks(tasks.map(task => task.id === taskId ? data : task));
        setEditingTask(null);
        setEditingTitle('');
      }
    } catch (error) {
      console.error('Error updating task title:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditingTitle('');
  };

  const handleGenerateSubtasks = async (taskId: string, taskTitle: string) => {
    setGeneratingSubtasks(taskId);
    setHasGeneratedSubtasks(prev => new Set([...prev, taskId]));
    try {
      const suggestions = await subtaskHelpers.generateSubtasks(taskTitle);
      setSuggestedSubtasks(prev => ({ ...prev, [taskId]: suggestions }));
    } catch (error) {
      console.error('Error generating subtasks:', error);
      // You could add a toast notification here
    } finally {
      setGeneratingSubtasks(null);
    }
  };

  const handleSaveSubtask = async (taskId: string, subtaskTitle: string, suggestionIndex: number) => {
    setSavingSubtask(`${taskId}-${suggestionIndex}`);
    try {
      const { data, error } = await subtaskHelpers.createSubtask(subtaskTitle, taskId, user.id);
      if (error) {
        console.error('Error saving subtask:', error);
      } else if (data) {
        // Update local subtasks state
        setSubtasks(prev => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), data]
        }));
        
        // Remove the suggestion from the list
        setSuggestedSubtasks(prev => ({
          ...prev,
          [taskId]: prev[taskId]?.filter((_, index) => index !== suggestionIndex) || []
        }));
      }
    } catch (error) {
      console.error('Error saving subtask:', error);
    } finally {
      setSavingSubtask(null);
    }
  };

  const handleSubtaskStatusChange = async (subtaskId: string, taskId: string, newStatus: 'pending' | 'in-progress' | 'done') => {
    try {
      const { data, error } = await subtaskHelpers.updateSubtaskStatus(subtaskId, newStatus);
      if (error) {
        console.error('Error updating subtask status:', error);
      } else if (data) {
        setSubtasks(prev => ({
          ...prev,
          [taskId]: prev[taskId]?.map(subtask => subtask.id === subtaskId ? data : subtask) || []
        }));
      }
    } catch (error) {
      console.error('Error updating subtask status:', error);
    }
  };

  // Load subtasks for all tasks when tasks are loaded
  useEffect(() => {
    tasks.forEach(task => {
      if (!subtasks[task.id]) {
        loadSubtasks(task.id);
      }
    });
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Dashboard card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg">
              <User size={24} className="text-blue-600" />
              <div>
                <p className="font-semibold text-gray-800">
                  Welcome, {user.user_metadata?.full_name || user.email}!
                </p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          )}
          
          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
            Your Tasks
          </h1>
          
          {/* Add new task form */}
          <form onSubmit={handleAddTask} className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
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
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-800"
                  disabled={loading}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !newTask.trim()}
              className="w-full py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {loading ? 'Adding Task...' : 'Add Task'}
            </button>
          </form>
          
          {/* Task list */}
          <div className="mb-8">
            {tasksLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading tasks...</div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-600">No tasks yet. Create your first task above!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {editingTask === task.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                              onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                            />
                            <button
                              onClick={() => handleSaveEdit(task.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-medium text-gray-800 truncate">{task.title}</h3>
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Priority selector */}
                        <select
                          value={task.priority}
                          onChange={(e) => handlePriorityChange(task.id, e.target.value as 'low' | 'medium' | 'high')}
                          className={`px-3 py-1 text-xs font-medium border rounded-full ${getPriorityColor(task.priority)}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        
                        {/* Status selector */}
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as 'pending' | 'in-progress' | 'done')}
                          className={`px-3 py-1 text-xs font-medium border rounded-full ${getStatusColor(task.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Subtasks section */}
                    <div className="mt-4 pl-4 border-l-2 border-gray-100">
                      {/* Existing subtasks */}
                      {subtasks[task.id] && subtasks[task.id].length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Subtasks:</h4>
                          <div className="space-y-2">
                            {subtasks[task.id].map((subtask) => (
                              <div key={subtask.id} className="flex items-center gap-2 text-sm">
                                <select
                                  value={subtask.status}
                                  onChange={(e) => handleSubtaskStatusChange(subtask.id, task.id, e.target.value as 'pending' | 'in-progress' | 'done')}
                                  className={`px-2 py-1 text-xs font-medium border rounded ${getStatusColor(subtask.status)}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="done">Done</option>
                                </select>
                                <span className={`flex-1 ${subtask.status === 'done' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                  {subtask.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Generate subtasks button */}
                      {!hasGeneratedSubtasks.has(task.id) && (
                        <button
                          onClick={() => handleGenerateSubtasks(task.id, task.title)}
                          disabled={generatingSubtasks === task.id}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles size={14} />
                          {generatingSubtasks === task.id ? 'Generating...' : 'Generate Subtasks with AI'}
                        </button>
                      )}
                      
                      {/* Suggested subtasks */}
                      {suggestedSubtasks[task.id] && suggestedSubtasks[task.id].length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Subtasks:</h4>
                          <div className="space-y-2">
                            {suggestedSubtasks[task.id].map((suggestion, index) => (
                              <div key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded border">
                                <span className="text-sm text-gray-700 flex-1">{suggestion}</span>
                                <button
                                  onClick={() => handleSaveSubtask(task.id, suggestion, index)}
                                  disabled={savingSubtask === `${task.id}-${index}`}
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Save size={12} />
                                  {savingSubtask === `${task.id}-${index}` ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Logout button */}
          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                await authHelpers.signOut();
                onLogout();
              }}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;