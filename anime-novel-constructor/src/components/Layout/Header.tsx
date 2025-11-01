import React from 'react';
import { Play, Pause, Square, SkipBack, SkipForward } from 'lucide-react';
import { useStore } from '../../store/useStore';

const Header: React.FC = () => {
  const { playback, setPlaying, startPlayback, stopPlayback, pausePlayback, resumePlayback } = useStore();

  const handlePlayPause = () => {
    if (playback.isPlaying) {
      pausePlayback();
    } else {
      if (playback.currentScene) {
        resumePlayback();
      } else {
        startPlayback();
      }
    }
  };

  const handleStop = () => {
    stopPlayback();
  };

  return (
    <header className="h-16 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
      {/* Левая часть - навигация */}
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-white">
          Конструктор Аниме Новелл
        </h2>
      </div>

      {/* Центральная часть - элементы управления воспроизведением */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleStop}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
          title="Стоп"
        >
          <Square size={20} className="text-white" />
        </button>

        <button
          onClick={() => console.log('Previous')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
          title="Предыдущий"
        >
          <SkipBack size={20} className="text-white" />
        </button>

        <button
          onClick={handlePlayPause}
          className={`p-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
            playback.isPlaying
              ? 'bg-gradient-to-r from-anime-red to-anime-orange hover:from-anime-orange hover:to-anime-red'
              : 'bg-gradient-to-r from-anime-green to-anime-blue hover:from-anime-blue hover:to-anime-green'
          }`}
          title={playback.isPlaying ? 'Пауза' : 'Воспроизведение'}
        >
          {playback.isPlaying ? (
            <Pause size={24} className="text-white" />
          ) : (
            <Play size={24} className="text-white ml-1" />
          )}
        </button>

        <button
          onClick={() => console.log('Next')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
          title="Следующий"
        >
          <SkipForward size={20} className="text-white" />
        </button>
      </div>

      {/* Правая часть - статус и информация */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-white/80">
          {playback.currentScene ? (
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-anime-green rounded-full animate-pulse"></div>
              <span>Воспроизведение</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              <span>Остановлено</span>
            </span>
          )}
        </div>

        <div className="w-8 h-8 bg-gradient-to-r from-anime-pink to-anime-purple rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">AN</span>
        </div>
      </div>
    </header>
  );
};

export default Header;