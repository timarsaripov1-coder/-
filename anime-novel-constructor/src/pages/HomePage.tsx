import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Plus, 
  FolderOpen, 
  Star, 
  Users, 
  BookOpen,
  Sparkles,
  Heart
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Project } from '../types';

const HomePage: React.FC = () => {
  const { createNewProject } = useStore();
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Загружаем недавние проекты из localStorage
    const saved = localStorage.getItem('anime-novel-project');
    if (saved) {
      try {
        const project = JSON.parse(saved);
        setRecentProjects([project]);
      } catch (error) {
        console.error('Error loading recent projects:', error);
      }
    }
  }, []);

  const handleNewProject = () => {
    const name = prompt('Название проекта:');
    const description = prompt('Описание проекта:');
    if (name) {
      createNewProject(name, description || '');
    }
  };

  const features = [
    {
      icon: Users,
      title: 'Персонажи',
      description: 'Создавайте уникальных персонажей с различными эмоциями и спрайтами',
      color: 'from-anime-pink to-anime-purple'
    },
    {
      icon: BookOpen,
      title: 'Сюжет',
      description: 'Визуальный редактор сюжета с узлами диалогов и выборов',
      color: 'from-anime-blue to-anime-green'
    },
    {
      icon: FolderOpen,
      title: 'Локации',
      description: 'Разнообразные фоны и локации для ваших сцен',
      color: 'from-anime-orange to-anime-red'
    },
    {
      icon: Play,
      title: 'Воспроизведение',
      description: 'Тестируйте и играйте в ваши созданные новеллы',
      color: 'from-anime-purple to-anime-blue'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Заголовок */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="text-anime-pink mr-4 animate-pulse" size={48} />
          <h1 className="anime-title text-6xl">
            Конструктор Аниме Новелл
          </h1>
          <Heart className="text-anime-pink ml-4 animate-bounce" size={48} />
        </div>
        <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
          Создавайте удивительные визуальные новеллы в аниме стиле! 
          Простой и интуитивный редактор для создания персонажей, сюжетов и интерактивных историй.
        </p>
      </div>

      {/* Основные действия */}
      <div className="flex justify-center space-x-6 mb-16">
        <button
          onClick={handleNewProject}
          className="anime-button text-xl px-8 py-4 flex items-center space-x-3"
        >
          <Plus size={28} />
          <span>Создать проект</span>
        </button>

        {recentProjects.length > 0 && (
          <Link
            to={`/project/${recentProjects[0].id}`}
            className="bg-gradient-to-r from-anime-blue to-anime-purple hover:from-anime-purple hover:to-anime-pink text-white font-bold py-4 px-8 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 text-xl flex items-center space-x-3"
          >
            <FolderOpen size={28} />
            <span>Продолжить работу</span>
          </Link>
        )}
      </div>

      {/* Особенности */}
      <div className="mb-16">
        <h2 className="anime-title text-4xl text-center mb-12">
          Возможности конструктора
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="anime-card group hover:scale-105 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse`}>
                  <Icon size={32} className="text-white" />
                </div>
                <h3 className="anime-subtitle text-xl mb-3">
                  {feature.title}
                </h3>
                <p className="anime-text">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Недавние проекты */}
      {recentProjects.length > 0 && (
        <div className="mb-16">
          <h2 className="anime-title text-4xl text-center mb-12">
            Недавние проекты
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="anime-card group hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-anime-pink transition-colors">
                    {project.name}
                  </h3>
                  <Star className="text-anime-pink" size={20} />
                </div>
                <p className="text-white/70 mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>v{project.version}</span>
                  <span>
                    {new Date(project.updatedAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Призыв к действию */}
      <div className="text-center">
        <div className="anime-card max-w-2xl mx-auto">
          <h2 className="anime-title text-3xl mb-6">
            Готовы создать свою историю?
          </h2>
          <p className="anime-text text-lg mb-8">
            Присоединяйтесь к сообществу создателей аниме новелл и поделитесь своими творениями с миром!
          </p>
          <button
            onClick={handleNewProject}
            className="anime-button text-xl px-8 py-4"
          >
            Начать создание
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;