// tasky/frontend/src/App.tsx
import Board from './components/Board';
import Header from './components/Header';

function App() {
  return (
    // Main container for the entire application
    // min-h-screen: Ensures the div takes at least the full viewport height
    // bg-gradient-to-br: Applies a background gradient from top-left to bottom-right
    // from-blue-500 to-purple-600: Defines the gradient colors
    // text-white: Sets the default text color to white for better contrast on the dark gradient
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      {/* Header component will go here */}
      <Header />
      {/* Main content area for the task board */}
      {/* p-4: Adds padding of 1rem (16px if base font size is 16px) around the main content */}
      <main className="p-4">
        {/* Board component will display the task columns and cards */}
        <Board />
      </main>
    </div>
  );
}

export default App;
