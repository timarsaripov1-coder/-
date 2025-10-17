import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Character, CharacterSprite, Emotion } from '../types';
import { v4 as uuidv4 } from 'uuid';

const CharacterEditor: React.FC = () => {
  const { project, addCharacter, updateCharacter, removeCharacter } = useStore();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCharacterForm, setShowCharacterForm] = useState(false);

  const emotions: Emotion[] = [
    'happy', 'sad', 'angry', 'surprised', 'confused', 
    'worried', 'excited', 'shy', 'neutral', 'blushing', 
    'crying', 'laughing'
  ];

  const emotionLabels: Record<Emotion, string> = {
    happy: 'Счастливый',
    sad: 'Грустный',
    angry: 'Злой',
    surprised: 'Удивленный',
    confused: 'Запутанный',
    worried: 'Волнующийся',
    excited: 'Взволнованный',
    shy: 'Застенчивый',
    neutral: 'Нейтральный',
    blushing: 'Краснеющий',
    crying: 'Плачущий',
    laughing: 'Смеющийся'
  };

  const handleCreateCharacter = () => {
    const newCharacter: Character = {
      id: uuidv4(),
      name: '',
      description: '',
      sprites: [],
      personality: [],
      gender: 'other',
      color: '#FF69B4'
    };
    setSelectedCharacter(newCharacter);
    setIsEditing(true);
    setShowCharacterForm(true);
  };

  const handleSaveCharacter = () => {
    if (!selectedCharacter) return;
    
    if (isEditing) {
      updateCharacter(selectedCharacter.id, selectedCharacter);
    } else {
      addCharacter(selectedCharacter);
    }
    
    setSelectedCharacter(null);
    setIsEditing(false);
    setShowCharacterForm(false);
  };

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setIsEditing(true);
    setShowCharacterForm(true);
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого персонажа?')) {
      removeCharacter(characterId);
      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(null);
      }
    }
  };

  const handleAddSprite = () => {
    if (!selectedCharacter) return;
    
    const newSprite: CharacterSprite = {
      id: uuidv4(),
      name: '',
      emotion: 'neutral',
      image: '',
      position: 'center',
      scale: 1,
      offsetX: 0,
      offsetY: 0
    };
    
    updateCharacter(selectedCharacter.id, {
      sprites: [...selectedCharacter.sprites, newSprite]
    });
  };

  const handleUpdateSprite = (spriteId: string, updates: Partial<CharacterSprite>) => {
    if (!selectedCharacter) return;
    
    const updatedSprites = selectedCharacter.sprites.map(sprite =>
      sprite.id === spriteId ? { ...sprite, ...updates } : sprite
    );
    
    updateCharacter(selectedCharacter.id, {
      sprites: updatedSprites
    });
  };

  const handleRemoveSprite = (spriteId: string) => {
    if (!selectedCharacter) return;
    
    const updatedSprites = selectedCharacter.sprites.filter(sprite => sprite.id !== spriteId);
    updateCharacter(selectedCharacter.id, {
      sprites: updatedSprites
    });
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Проект не найден</h2>
          <p className="text-white/70">Пожалуйста, выберите существующий проект.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Список персонажей */}
      <div className="w-1/3 bg-black/20 backdrop-blur-md border-r border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="anime-subtitle text-2xl">Персонажи</h2>
          <button
            onClick={handleCreateCharacter}
            className="anime-button flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Добавить</span>
          </button>
        </div>

        <div className="space-y-4">
          {project.characters.map((character) => (
            <div
              key={character.id}
              className={`anime-card cursor-pointer transition-all duration-300 ${
                selectedCharacter?.id === character.id ? 'ring-2 ring-anime-pink' : ''
              }`}
              onClick={() => setSelectedCharacter(character)}
            >
              <div className="flex items-center space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: character.color }}
                >
                  {character.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {character.name || 'Без имени'}
                  </h3>
                  <p className="text-white/70 text-sm line-clamp-2">
                    {character.description || 'Без описания'}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-white/60">
                      {character.sprites.length} спрайтов
                    </span>
                    <span className="text-xs text-white/60">
                      {character.gender}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCharacter(character);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
                  >
                    <Edit size={16} className="text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCharacter(character.id);
                    }}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-300"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Редактор персонажа */}
      <div className="flex-1 p-6">
        {selectedCharacter ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="anime-subtitle text-2xl">
                {isEditing ? 'Редактирование персонажа' : 'Просмотр персонажа'}
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="anime-button flex items-center space-x-2"
                >
                  <Edit size={20} />
                  <span>{isEditing ? 'Просмотр' : 'Редактировать'}</span>
                </button>
                {isEditing && (
                  <button
                    onClick={handleSaveCharacter}
                    className="bg-gradient-to-r from-anime-green to-anime-blue hover:from-anime-blue hover:to-anime-green text-white font-bold py-3 px-6 rounded-full transform transition-all duration-300 hover:scale-105"
                  >
                    Сохранить
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Основная информация */}
              <div className="space-y-6">
                <div className="anime-card">
                  <h3 className="anime-subtitle text-lg mb-4">Основная информация</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 mb-2">Имя</label>
                      <input
                        type="text"
                        value={selectedCharacter.name}
                        onChange={(e) => updateCharacter(selectedCharacter.id, { name: e.target.value })}
                        disabled={!isEditing}
                        className="anime-input w-full"
                        placeholder="Введите имя персонажа"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Описание</label>
                      <textarea
                        value={selectedCharacter.description}
                        onChange={(e) => updateCharacter(selectedCharacter.id, { description: e.target.value })}
                        disabled={!isEditing}
                        className="anime-input w-full h-24 resize-none"
                        placeholder="Опишите персонажа"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 mb-2">Пол</label>
                        <select
                          value={selectedCharacter.gender}
                          onChange={(e) => updateCharacter(selectedCharacter.id, { gender: e.target.value as any })}
                          disabled={!isEditing}
                          className="anime-input w-full"
                        >
                          <option value="male">Мужской</option>
                          <option value="female">Женский</option>
                          <option value="other">Другой</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">Цвет</label>
                        <input
                          type="color"
                          value={selectedCharacter.color}
                          onChange={(e) => updateCharacter(selectedCharacter.id, { color: e.target.value })}
                          disabled={!isEditing}
                          className="w-full h-10 rounded-lg border border-white/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Спрайты */}
                <div className="anime-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="anime-subtitle text-lg">Спрайты</h3>
                    {isEditing && (
                      <button
                        onClick={handleAddSprite}
                        className="anime-button text-sm px-4 py-2"
                      >
                        <Plus size={16} className="mr-2" />
                        Добавить спрайт
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedCharacter.sprites.map((sprite) => (
                      <div key={sprite.id} className="bg-white/5 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-white/80 mb-2">Название</label>
                            <input
                              type="text"
                              value={sprite.name}
                              onChange={(e) => handleUpdateSprite(sprite.id, { name: e.target.value })}
                              disabled={!isEditing}
                              className="anime-input w-full"
                              placeholder="Название спрайта"
                            />
                          </div>

                          <div>
                            <label className="block text-white/80 mb-2">Эмоция</label>
                            <select
                              value={sprite.emotion}
                              onChange={(e) => handleUpdateSprite(sprite.id, { emotion: e.target.value as Emotion })}
                              disabled={!isEditing}
                              className="anime-input w-full"
                            >
                              {emotions.map((emotion) => (
                                <option key={emotion} value={emotion}>
                                  {emotionLabels[emotion]}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-white/80 mb-2">Позиция</label>
                            <select
                              value={sprite.position}
                              onChange={(e) => handleUpdateSprite(sprite.id, { position: e.target.value as any })}
                              disabled={!isEditing}
                              className="anime-input w-full"
                            >
                              <option value="left">Слева</option>
                              <option value="center">По центру</option>
                              <option value="right">Справа</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-white/80 mb-2">Масштаб</label>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.1"
                              value={sprite.scale}
                              onChange={(e) => handleUpdateSprite(sprite.id, { scale: parseFloat(e.target.value) })}
                              disabled={!isEditing}
                              className="w-full"
                            />
                            <span className="text-white/60 text-sm">{sprite.scale}x</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-white/80 mb-2">Изображение</label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/*"
                              disabled={!isEditing}
                              className="anime-input flex-1"
                            />
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveSprite(sprite.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-300"
                              >
                                <Trash2 size={16} className="text-red-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Предварительный просмотр */}
              <div className="anime-card">
                <h3 className="anime-subtitle text-lg mb-4">Предварительный просмотр</h3>
                
                <div className="bg-gradient-to-b from-anime-purple to-anime-blue rounded-xl p-6 h-96 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Фон сцены */}
                  <div className="absolute inset-0 bg-gradient-to-br from-anime-pink/20 to-anime-blue/20"></div>
                  
                  {/* Персонаж */}
                  {selectedCharacter.sprites.length > 0 && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div
                        className="character-sprite"
                        style={{
                          transform: `scale(${selectedCharacter.sprites[0].scale})`,
                          transformOrigin: 'bottom center'
                        }}
                      >
                        <div
                          className="w-32 h-48 bg-white/20 rounded-lg flex items-center justify-center text-white/60"
                          style={{ backgroundColor: selectedCharacter.color + '40' }}
                        >
                          <span className="text-sm">Спрайт</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Имя персонажа */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span className="text-white font-semibold">
                        {selectedCharacter.name || 'Без имени'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Спрайтов:</span>
                    <span className="text-white">{selectedCharacter.sprites.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Пол:</span>
                    <span className="text-white capitalize">{selectedCharacter.gender}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Цвет:</span>
                    <div 
                      className="w-6 h-6 rounded-full border border-white/30"
                      style={{ backgroundColor: selectedCharacter.color }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Выберите персонажа</h2>
              <p className="text-white/70 mb-6">Выберите персонажа из списка слева для редактирования</p>
              <button
                onClick={handleCreateCharacter}
                className="anime-button"
              >
                Создать нового персонажа
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterEditor;