import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  MapPin, 
  BookOpen, 
  Play, 
  Settings,
  Plus,
  FolderOpen,
  Save,
  Download
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { project, createNewProject, saveProject, exportProject } = useStore();

  const menuItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: project ? `/project/${project.id}` : '#', icon: FolderOpen, label: 'Проект', disabled: !project },
    { path: project ? `/project/${project.id}/characters` : '#', icon: Users, label: 'Персонажи', disabled: !project },
    { path: project ? `/project/${project.id}/locations` : '#', icon: MapPin, label: 'Локации', disabled: !project },
    { path: project ? `/project/${project.id}/story` : '#', icon: BookOpen, label: 'Сюжет', disabled: !project },
    { path: project ? `/project/${project.id}/playback` : '#', icon: Play, label: 'Воспроизведение', disabled: !project },
    { path: project ? `/project/${project.id}/settings` : '#', icon: Settings, label: 'Настройки', disabled: !project },
  ];

  const handleNewProject = () => {
    const name = prompt('Название проекта:');
    const description = prompt('Описание проекта:');
    if (name) {
      createNewProject(name, description || '');
    }
  };

  const handleSaveProject = () => {
    saveProject();
  };

  const handleExportProject = () => {
    exportProject('web');
  };

  return (
    <div className="w-64 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col">
      {/* Логотип */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-anime-pink to-anime-purple">
          Anime Novel
        </h1>
        <p className="text-sm text-white/70 mt-1">Конструктор</p>
      </div>

      {/* Информация о проекте */}
      {project && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-anime-pink mb-2">Текущий проект</h3>
          <div className="text-xs text-white/80">
            <p className="font-medium">{project.name}</p>
            <p className="text-white/60">{project.description}</p>
            <p className="text-white/60 mt-1">v{project.version}</p>
          </div>
        </div>
      )}

      {/* Меню навигации */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isDisabled = item.disabled;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-anime-pink to-anime-purple text-white shadow-lg' 
                      : isDisabled
                      ? 'text-white/40 cursor-not-allowed'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                  onClick={(e) => isDisabled && e.preventDefault()}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Действия с проектом */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={handleNewProject}
          className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-anime-blue to-anime-purple text-white rounded-xl hover:from-anime-purple hover:to-anime-pink transition-all duration-300 transform hover:scale-105"
        >
          <Plus size={20} />
          <span className="font-medium">Новый проект</span>
        </button>

        {project && (
          <>
            <button
              onClick={handleSaveProject}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <Save size={20} />
              <span className="font-medium">Сохранить</span>
            </button>

            <button
              onClick={handleExportProject}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <Download size={20} />
              <span className="font-medium">Экспорт</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;