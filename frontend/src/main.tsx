import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Your main CSS file with Tailwind directives
import { BoardProvider } from './context/BoardContext.tsx'; // Import the BoardProvider

// Get the root element from the DOM.
const rootElement = document.getElementById('root');

// Ensure the root element exists before trying to render the React app into it.
// This resolves the `@typescript-eslint/no-non-null-assertion` error.
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    // <React.StrictMode>
    <BoardProvider>
      <App />
    </BoardProvider>
    // </React.StrictMode>,
  );
} else {
  // Log an error if the root element is not found, which would prevent the app from mounting.
  console.error(
    'Failed to find the root element with ID "root". The React app will not be mounted.'
  );
}
