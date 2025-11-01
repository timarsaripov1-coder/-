import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  BookOpen, 
  Play, 
  Settings,
  BarChart3,
  Clock,
  FileText,
  Music,
  Image
} from 'lucide-react';
import { useStore } from '../store/useStore';

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { project } = useStore();

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Проект не найден</h2>
          <p className="text-white/70">Пожалуйста, выберите существующий проект или создайте новый.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: Users,
      label: 'Персонажи',
      value: project.characters.length,
      color: 'from-anime-pink to-anime-purple',
      link: `/project/${id}/characters`
    },
    {
      icon: MapPin,
      label: 'Локации',
      value: project.locations.length,
      color: 'from-anime-blue to-anime-green',
      link: `/project/${id}/locations`
    },
    {
      icon: BookOpen,
      label: 'Сцены',
      value: project.scenes.length,
      color: 'from-anime-orange to-anime-red',
      link: `/project/${id}/story`
    },
    {
      icon: Music,
      label: 'Аудио',
      value: project.audioTracks.length,
      color: 'from-anime-purple to-anime-blue',
      link: `/project/${id}/settings`
    }
  ];

  const quickActions = [
    {
      icon: Play,
      label: 'Воспроизведение',
      description: 'Тестировать новеллу',
      link: `/project/${id}/playback`,
      color: 'from-anime-green to-anime-blue'
    },
    {
      icon: BookOpen,
      label: 'Редактор сюжета',
      description: 'Создать сцены и диалоги',
      link: `/project/${id}/story`,
      color: 'from-anime-purple to-anime-pink'
    },
    {
      icon: Users,
      label: 'Персонажи',
      description: 'Управление персонажами',
      link: `/project/${id}/characters`,
      color: 'from-anime-pink to-anime-orange'
    },
    {
      icon: Settings,
      label: 'Настройки',
      description: 'Конфигурация проекта',
      link: `/project/${id}/settings`,
      color: 'from-anime-blue to-anime-purple'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Заголовок проекта */}
      <div className="mb-8">
        <h1 className="anime-title text-4xl mb-2">{project.name}</h1>
        <p className="text-white/70 text-lg mb-4">{project.description}</p>
        <div className="flex items-center space-x-6 text-sm text-white/60">
          <div className="flex items-center space-x-2">
            <Clock size={16} />
            <span>Создан: {new Date(project.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText size={16} />
            <span>Версия: {project.version}</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 size={16} />
            <span>Узлов сюжета: {project.storyNodes.length}</span>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="anime-card group hover:scale-105 transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse`}>
                <Icon size={24} className="text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/70">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Быстрые действия */}
      <div className="mb-12">
        <h2 className="anime-subtitle text-2xl mb-6">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className={`anime-card group hover:scale-105 transition-all duration-300 bg-gradient-to-br ${action.color} bg-opacity-20`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center group-hover:animate-pulse`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{action.label}</h3>
                    <p className="text-white/70 text-sm">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Последние изменения */}
      <div className="mb-12">
        <h2 className="anime-subtitle text-2xl mb-6">Последние изменения</h2>
        <div className="anime-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-anime-pink to-anime-purple rounded-full flex items-center justify-center">
                  <Users size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Добавлен персонаж</p>
                  <p className="text-white/60 text-sm">2 часа назад</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-anime-blue to-anime-green rounded-full flex items-center justify-center">
                  <MapPin size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Создана локация</p>
                  <p className="text-white/60 text-sm">5 часов назад</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-anime-orange to-anime-red rounded-full flex items-center justify-center">
                  <BookOpen size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Обновлен сюжет</p>
                  <p className="text-white/60 text-sm">1 день назад</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Прогресс проекта */}
      <div className="mb-12">
        <h2 className="anime-subtitle text-2xl mb-6">Прогресс проекта</h2>
        <div className="anime-card">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Персонажи</span>
                <span className="text-white/70">{project.characters.length}/10</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-anime-pink to-anime-purple h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((project.characters.length / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Локации</span>
                <span className="text-white/70">{project.locations.length}/5</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-anime-blue to-anime-green h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((project.locations.length / 5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Сцены</span>
                <span className="text-white/70">{project.scenes.length}/20</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-anime-orange to-anime-red h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((project.scenes.length / 20) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;