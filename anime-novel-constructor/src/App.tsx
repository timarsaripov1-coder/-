import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster } from 'react-hot-toast';

// Компоненты
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import CharacterEditor from './pages/CharacterEditor';
import LocationEditor from './pages/LocationEditor';
import StoryEditor from './pages/StoryEditor';
import PlaybackPage from './pages/PlaybackPage';
import SettingsPage from './pages/SettingsPage';

// Стили
import './index.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-anime-purple via-anime-blue to-anime-pink">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/project/:id" element={<ProjectPage />} />
              <Route path="/project/:id/characters" element={<CharacterEditor />} />
              <Route path="/project/:id/locations" element={<LocationEditor />} />
              <Route path="/project/:id/story" element={<StoryEditor />} />
              <Route path="/project/:id/playback" element={<PlaybackPage />} />
              <Route path="/project/:id/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                border: '1px solid rgba(255, 105, 180, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }
            }}
          />
        </div>
      </Router>
    </DndProvider>
  );
}

export default App;