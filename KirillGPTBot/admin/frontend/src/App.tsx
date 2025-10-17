import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginForm } from '@/components/auth/LoginForm';
import { Layout } from '@/components/layout/Layout';

// Page imports (will be created in next tasks)
import { Dashboard } from '@/pages/Dashboard';
import { ChatList } from '@/pages/ChatList';
import { MessageFlow } from '@/pages/MessageFlow';
import { PresetManagement } from '@/pages/PresetManagement';
import { ChatSettings } from '@/pages/ChatSettings';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="chats" element={<ChatList />} />
          <Route path="chats/:chatId" element={<MessageFlow />} />
          <Route path="chats/:chatId/settings" element={<ChatSettings />} />
          <Route path="messages" element={<MessageFlow />} />
          <Route path="presets" element={<PresetManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;