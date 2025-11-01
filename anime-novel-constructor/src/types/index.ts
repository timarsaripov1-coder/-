// Типы для персонажей
export interface Character {
  id: string;
  name: string;
  description: string;
  sprites: CharacterSprite[];
  voice?: string;
  personality: string[];
  age?: number;
  gender: 'male' | 'female' | 'other';
  color: string; // Цвет для UI
}

export interface CharacterSprite {
  id: string;
  name: string;
  emotion: Emotion;
  image: string;
  position: 'left' | 'center' | 'right';
  scale: number;
  offsetX: number;
  offsetY: number;
}

export type Emotion = 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'surprised' 
  | 'confused' 
  | 'worried' 
  | 'excited' 
  | 'shy' 
  | 'neutral' 
  | 'blushing' 
  | 'crying' 
  | 'laughing';

// Типы для локаций
export interface Location {
  id: string;
  name: string;
  description: string;
  background: string;
  music?: string;
  ambient?: string;
  lighting: 'bright' | 'dim' | 'dark' | 'mysterious';
  weather?: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'foggy';
}

// Типы для музыки и звуков
export interface AudioTrack {
  id: string;
  name: string;
  file: string;
  type: 'music' | 'sfx' | 'voice';
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

// Типы для диалогов и сюжета
export interface Dialogue {
  id: string;
  characterId: string;
  text: string;
  emotion: Emotion;
  position: 'left' | 'center' | 'right';
  voice?: string;
  effects?: DialogueEffect[];
}

export interface DialogueEffect {
  type: 'shake' | 'fade' | 'glow' | 'pulse' | 'slide';
  intensity: number;
  duration: number;
}

export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  conditions?: ChoiceCondition[];
}

export interface ChoiceCondition {
  variable: string;
  operator: 'equals' | 'greater' | 'less' | 'contains';
  value: any;
}

// Типы для узлов сюжета
export interface StoryNode {
  id: string;
  type: 'dialogue' | 'choice' | 'scene' | 'action' | 'condition' | 'variable';
  position: { x: number; y: number };
  data: any;
  nextNodes: string[];
  conditions?: StoryCondition[];
}

export interface StoryCondition {
  variable: string;
  operator: 'equals' | 'greater' | 'less' | 'contains';
  value: any;
}

// Типы для сцены
export interface Scene {
  id: string;
  name: string;
  locationId: string;
  characters: SceneCharacter[];
  background: string;
  music?: string;
  lighting: string;
  effects: SceneEffect[];
  duration?: number;
}

export interface SceneCharacter {
  characterId: string;
  spriteId: string;
  position: 'left' | 'center' | 'right';
  visible: boolean;
  animation?: string;
}

export interface SceneEffect {
  type: 'fade' | 'shake' | 'zoom' | 'slide' | 'glow' | 'particles';
  intensity: number;
  duration: number;
  target?: 'background' | 'character' | 'all';
}

// Типы для проекта
export interface Project {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  characters: Character[];
  locations: Location[];
  audioTracks: AudioTrack[];
  storyNodes: StoryNode[];
  scenes: Scene[];
  variables: ProjectVariable[];
  settings: ProjectSettings;
}

export interface ProjectVariable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  value: any;
  description?: string;
}

export interface ProjectSettings {
  resolution: { width: number; height: number };
  language: string;
  autoSave: boolean;
  autoSaveInterval: number;
  defaultFont: string;
  defaultTextSpeed: number;
  defaultMusicVolume: number;
  defaultSfxVolume: number;
}

// Типы для редактора
export interface EditorState {
  currentProject: Project | null;
  selectedNode: string | null;
  selectedCharacter: string | null;
  selectedLocation: string | null;
  isPlaying: boolean;
  currentScene: string | null;
  zoom: number;
  pan: { x: number; y: number };
}

// Типы для воспроизведения
export interface PlaybackState {
  isPlaying: boolean;
  currentScene: string | null;
  currentDialogue: string | null;
  currentChoice: string | null;
  variables: Record<string, any>;
  history: PlaybackHistoryItem[];
}

export interface PlaybackHistoryItem {
  type: 'dialogue' | 'choice' | 'scene';
  data: any;
  timestamp: Date;
}

// Типы для UI компонентов
export interface DragItem {
  type: 'character' | 'location' | 'audio' | 'node';
  data: any;
}

export interface DropTarget {
  type: 'scene' | 'timeline' | 'node-editor';
  accept: string[];
}

// Типы для экспорта
export interface ExportOptions {
  format: 'web' | 'exe' | 'apk' | 'ios';
  quality: 'low' | 'medium' | 'high';
  includeAssets: boolean;
  compressAudio: boolean;
  compressImages: boolean;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
  warnings?: string[];
}