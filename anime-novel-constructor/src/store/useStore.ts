import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Project, 
  Character, 
  Location, 
  AudioTrack, 
  StoryNode, 
  Scene, 
  EditorState, 
  PlaybackState,
  ProjectVariable,
  ProjectSettings
} from '../types';

interface AppStore {
  // Состояние редактора
  editor: EditorState;
  
  // Состояние воспроизведения
  playback: PlaybackState;
  
  // Проект
  project: Project | null;
  
  // Действия для редактора
  setCurrentProject: (project: Project | null) => void;
  selectNode: (nodeId: string | null) => void;
  selectCharacter: (characterId: string | null) => void;
  selectLocation: (locationId: string | null) => void;
  setPlaying: (isPlaying: boolean) => void;
  setCurrentScene: (sceneId: string | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  
  // Действия для проекта
  addCharacter: (character: Character) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  removeCharacter: (characterId: string) => void;
  
  addLocation: (location: Location) => void;
  updateLocation: (locationId: string, updates: Partial<Location>) => void;
  removeLocation: (locationId: string) => void;
  
  addAudioTrack: (audioTrack: AudioTrack) => void;
  updateAudioTrack: (audioTrackId: string, updates: Partial<AudioTrack>) => void;
  removeAudioTrack: (audioTrackId: string) => void;
  
  addStoryNode: (node: StoryNode) => void;
  updateStoryNode: (nodeId: string, updates: Partial<StoryNode>) => void;
  removeStoryNode: (nodeId: string) => void;
  
  addScene: (scene: Scene) => void;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  removeScene: (sceneId: string) => void;
  
  // Действия для воспроизведения
  startPlayback: () => void;
  stopPlayback: () => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  nextDialogue: () => void;
  previousDialogue: () => void;
  selectChoice: (choiceId: string) => void;
  
  // Действия для переменных
  setVariable: (name: string, value: any) => void;
  getVariable: (name: string) => any;
  
  // Действия для настроек
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  
  // Утилиты
  createNewProject: (name: string, description: string) => void;
  saveProject: () => void;
  loadProject: (projectData: Project) => void;
  exportProject: (format: string) => void;
}

const defaultProjectSettings: ProjectSettings = {
  resolution: { width: 1920, height: 1080 },
  language: 'ru',
  autoSave: true,
  autoSaveInterval: 30000, // 30 секунд
  defaultFont: 'anime',
  defaultTextSpeed: 50,
  defaultMusicVolume: 0.7,
  defaultSfxVolume: 0.8
};

const defaultEditorState: EditorState = {
  currentProject: null,
  selectedNode: null,
  selectedCharacter: null,
  selectedLocation: null,
  isPlaying: false,
  currentScene: null,
  zoom: 1,
  pan: { x: 0, y: 0 }
};

const defaultPlaybackState: PlaybackState = {
  isPlaying: false,
  currentScene: null,
  currentDialogue: null,
  currentChoice: null,
  variables: {},
  history: []
};

export const useStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Начальное состояние
      editor: defaultEditorState,
      playback: defaultPlaybackState,
      project: null,
      
      // Действия для редактора
      setCurrentProject: (project) => 
        set((state) => ({
          editor: { ...state.editor, currentProject: project },
          project
        })),
      
      selectNode: (nodeId) =>
        set((state) => ({
          editor: { ...state.editor, selectedNode: nodeId }
        })),
      
      selectCharacter: (characterId) =>
        set((state) => ({
          editor: { ...state.editor, selectedCharacter: characterId }
        })),
      
      selectLocation: (locationId) =>
        set((state) => ({
          editor: { ...state.editor, selectedLocation: locationId }
        })),
      
      setPlaying: (isPlaying) =>
        set((state) => ({
          editor: { ...state.editor, isPlaying },
          playback: { ...state.playback, isPlaying }
        })),
      
      setCurrentScene: (sceneId) =>
        set((state) => ({
          editor: { ...state.editor, currentScene: sceneId },
          playback: { ...state.playback, currentScene: sceneId }
        })),
      
      setZoom: (zoom) =>
        set((state) => ({
          editor: { ...state.editor, zoom }
        })),
      
      setPan: (pan) =>
        set((state) => ({
          editor: { ...state.editor, pan }
        })),
      
      // Действия для проекта
      addCharacter: (character) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              characters: [...state.project.characters, character]
            }
          };
        }),
      
      updateCharacter: (characterId, updates) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              characters: state.project.characters.map(char =>
                char.id === characterId ? { ...char, ...updates } : char
              )
            }
          };
        }),
      
      removeCharacter: (characterId) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              characters: state.project.characters.filter(char => char.id !== characterId)
            }
          };
        }),
      
      addLocation: (location) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              locations: [...state.project.locations, location]
            }
          };
        }),
      
      updateLocation: (locationId, updates) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              locations: state.project.locations.map(loc =>
                loc.id === locationId ? { ...loc, ...updates } : loc
              )
            }
          };
        }),
      
      removeLocation: (locationId) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              locations: state.project.locations.filter(loc => loc.id !== locationId)
            }
          };
        }),
      
      addAudioTrack: (audioTrack) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              audioTracks: [...state.project.audioTracks, audioTrack]
            }
          };
        }),
      
      updateAudioTrack: (audioTrackId, updates) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              audioTracks: state.project.audioTracks.map(track =>
                track.id === audioTrackId ? { ...track, ...updates } : track
              )
            }
          };
        }),
      
      removeAudioTrack: (audioTrackId) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              audioTracks: state.project.audioTracks.filter(track => track.id !== audioTrackId)
            }
          };
        }),
      
      addStoryNode: (node) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              storyNodes: [...state.project.storyNodes, node]
            }
          };
        }),
      
      updateStoryNode: (nodeId, updates) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              storyNodes: state.project.storyNodes.map(node =>
                node.id === nodeId ? { ...node, ...updates } : node
              )
            }
          };
        }),
      
      removeStoryNode: (nodeId) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              storyNodes: state.project.storyNodes.filter(node => node.id !== nodeId)
            }
          };
        }),
      
      addScene: (scene) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scenes: [...state.project.scenes, scene]
            }
          };
        }),
      
      updateScene: (sceneId, updates) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scenes: state.project.scenes.map(scene =>
                scene.id === sceneId ? { ...scene, ...updates } : scene
              )
            }
          };
        }),
      
      removeScene: (sceneId) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scenes: state.project.scenes.filter(scene => scene.id !== sceneId)
            }
          };
        }),
      
      // Действия для воспроизведения
      startPlayback: () =>
        set((state) => ({
          playback: { ...state.playback, isPlaying: true }
        })),
      
      stopPlayback: () =>
        set((state) => ({
          playback: { ...state.playback, isPlaying: false, currentScene: null, currentDialogue: null }
        })),
      
      pausePlayback: () =>
        set((state) => ({
          playback: { ...state.playback, isPlaying: false }
        })),
      
      resumePlayback: () =>
        set((state) => ({
          playback: { ...state.playback, isPlaying: true }
        })),
      
      nextDialogue: () => {
        // Логика перехода к следующему диалогу
        console.log('Next dialogue');
      },
      
      previousDialogue: () => {
        // Логика перехода к предыдущему диалогу
        console.log('Previous dialogue');
      },
      
      selectChoice: (choiceId) => {
        // Логика выбора варианта ответа
        console.log('Choice selected:', choiceId);
      },
      
      // Действия для переменных
      setVariable: (name, value) =>
        set((state) => {
          if (!state.project) return state;
          const existingVar = state.project.variables.find(v => v.name === name);
          if (existingVar) {
            return {
              project: {
                ...state.project,
                variables: state.project.variables.map(v =>
                  v.name === name ? { ...v, value } : v
                )
              }
            };
          } else {
            return {
              project: {
                ...state.project,
                variables: [...state.project.variables, { name, type: typeof value, value }]
              }
            };
          }
        }),
      
      getVariable: (name) => {
        const state = get();
        if (!state.project) return undefined;
        const variable = state.project.variables.find(v => v.name === name);
        return variable?.value;
      },
      
      // Действия для настроек
      updateSettings: (settings) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              settings: { ...state.project.settings, ...settings }
            }
          };
        }),
      
      // Утилиты
      createNewProject: (name, description) => {
        const newProject: Project = {
          id: crypto.randomUUID(),
          name,
          description,
          version: '1.0.0',
          createdAt: new Date(),
          updatedAt: new Date(),
          characters: [],
          locations: [],
          audioTracks: [],
          storyNodes: [],
          scenes: [],
          variables: [],
          settings: defaultProjectSettings
        };
        
        set({
          project: newProject,
          editor: { ...defaultEditorState, currentProject: newProject }
        });
      },
      
      saveProject: () => {
        const state = get();
        if (!state.project) return;
        
        // Сохранение в localStorage
        localStorage.setItem('anime-novel-project', JSON.stringify(state.project));
        console.log('Project saved');
      },
      
      loadProject: (projectData) => {
        set({
          project: projectData,
          editor: { ...defaultEditorState, currentProject: projectData }
        });
      },
      
      exportProject: (format) => {
        const state = get();
        if (!state.project) return;
        
        console.log('Exporting project in format:', format);
        // Здесь будет логика экспорта
      }
    }),
    {
      name: 'anime-novel-store'
    }
  )
);