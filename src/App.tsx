import React from 'react';

function App() {
  const handleLogin = () => {
    console.log('Login clicked');
    // Navigate to login page
  };

  const handleSignup = () => {
    console.log('Signup clicked');
    // Navigate to signup page
  };

  const handleDashboard = () => {
    console.log('Go to Dashboard clicked');
    // Navigate to dashboard page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-white flex items-center justify-center px-4 py-8 font-['Open_Sans']">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-blue-200/10 to-transparent animate-pulse"></div>
      
      {/* Main content container */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Welcome heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
          Welcome to My Task Manager
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12 md:mb-16 font-light leading-relaxed drop-shadow-md max-w-2xl mx-auto">
          Organize your tasks, boost your productivity, and achieve your goals with our intuitive task management solution.
        </p>
        
        {/* Button container */}
        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center items-center">
          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-white text-blue-600 font-semibold text-lg md:text-xl rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out border-2 border-transparent hover:border-blue-200 min-w-[180px] md:min-w-[200px]"
          >
            Login
          </button>
          
          {/* Signup Button */}
          <button
            onClick={handleSignup}
            className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-blue-600 text-white font-semibold text-lg md:text-xl rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700 min-w-[180px] md:min-w-[200px]"
          >
            Signup
          </button>
          
          {/* Dashboard Button */}
          <button
            onClick={handleDashboard}
            className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-transparent text-white font-semibold text-lg md:text-xl rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out border-2 border-white hover:bg-white hover:text-blue-600 min-w-[180px] md:min-w-[200px]"
          >
            Go to Dashboard
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="mt-16 md:mt-20 flex justify-center space-x-4 opacity-70">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default App;