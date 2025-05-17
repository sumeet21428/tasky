import ReactDOM from 'react-dom/client'; 
import App from './App.tsx'; 
import './index.css'; 
import { BoardProvider } from './context/BoardContext.tsx'; 

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    // <React.StrictMode>
      <BoardProvider>
        <App />
      </BoardProvider>
    // </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element with ID "root". The React app will not be mounted.');
}
