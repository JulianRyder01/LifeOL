import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import StatsOverview from './components/StatsOverview.tsx';
import AttributeCard from './components/AttributeCard.tsx';
import EventList from './components/EventList.tsx';
import EventModal from './components/EventModal.tsx';
import AchievementModal from './components/AchievementModal.tsx';
import { saveAttributes, loadAttributes, saveEvents, loadEvents, getInitialAttributes } from './utils/storage.ts';
import { calculateLevel } from './utils/calculations.ts';
import { checkAchievements, saveAchievements, loadAchievements, getInitialAchievements, checkAttributeDecay } from './utils/achievements.ts';
import { Attributes, Event, Achievement } from './types/app.types.ts';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">出现了一些问题</h1>
            <p className="text-gray-600 mb-4">很抱歉，发生了意外错误。</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [attributes, setAttributes] = useState<Attributes>(() => {
      return loadAttributes() || getInitialAttributes();
    });
    
    const [events, setEvents] = useState<Event[]>(() => {
      return loadEvents() || [];
    });
    
    const [achievements, setAchievements] = useState<Achievement[]>(() => {
      return loadAchievements() || getInitialAchievements();
    });
    
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAchievementModal, setShowAchievementModal] = useState(false);

    useEffect(() => {
      saveAttributes(attributes);
    }, [attributes]);

    useEffect(() => {
      saveEvents(events);
    }, [events]);

    useEffect(() => {
      saveAchievements(achievements);
    }, [achievements]);

    // Check for attribute decay on app load and periodically
    useEffect(() => {
      const checkDecay = () => {
        const { updatedAttributes, warnings } = checkAttributeDecay(attributes, events);
        if (warnings.length > 0) {
          setAttributes(updatedAttributes);
          // Could show decay notifications here
          warnings.forEach(warning => {
            console.log(`属性衰减: ${warning.attribute} 减少了 ${warning.decayAmount} 经验值`);
          });
        }
      };

      checkDecay();
      // Check decay every hour
      const interval = setInterval(checkDecay, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, [attributes, events]);

    const handleAddEvent = (eventData: { title: string; description: string; expGains: Record<string, number> }) => {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...eventData,
        timestamp: new Date().toISOString()
      };
      
      setEvents(prev => [newEvent, ...prev]);
      
      // Update attributes with gained EXP
      const updatedAttributes = { ...attributes };
      Object.entries(eventData.expGains).forEach(([attr, exp]) => {
        if (exp > 0) {
          updatedAttributes[attr as keyof Attributes] = {
            ...updatedAttributes[attr as keyof Attributes],
            exp: updatedAttributes[attr as keyof Attributes].exp + exp,
            level: calculateLevel(updatedAttributes[attr as keyof Attributes].exp + exp)
          };
        }
      });
      setAttributes(updatedAttributes);
      
      // Check for new achievements
      const newAchievements = checkAchievements(updatedAttributes, [newEvent, ...events], achievements);
      if (newAchievements.length > 0) {
        setAchievements(prev => [...prev, ...newAchievements]);
      }
      
      setShowEventModal(false);
    };

    const handleAddCustomAchievement = (achievementData: Partial<Achievement>) => {
      const newAchievement: Achievement = {
        id: Date.now().toString(),
        ...achievementData,
        isCustom: true,
        unlockedAt: achievementData.triggerType === 'manual' ? new Date().toISOString() : null
      } as Achievement;
      
      // Add custom condition function if not manual
      if (achievementData.triggerType !== 'manual' && achievementData.triggerCondition) {
        newAchievement.condition = createCustomCondition(achievementData.triggerType!, achievementData.triggerCondition);
      }
      
      setAchievements(prev => [...prev, newAchievement]);
      setShowAchievementModal(false);
    };

    // Helper function to create custom achievement conditions
    const createCustomCondition = (triggerType: string, condition: string) => {
      switch (triggerType) {
        case 'level':
          const [attr, level] = condition.split(':');
          return (attributes: Attributes) => attributes[attr as keyof Attributes] && attributes[attr as keyof Attributes].level >= parseInt(level);
        
        case 'events':
          const count = parseInt(condition);
          return (attributes: Attributes, events: Event[]) => events.length >= count;
        
        case 'keyword':
          const keywords = condition.split(',').map(k => k.trim());
          return (attributes: Attributes, events: Event[]) => events.some(event => 
            keywords.some(keyword => 
              event.title.includes(keyword) || event.description.includes(keyword)
            )
          );
        
        case 'streak':
          const days = parseInt(condition);
          return (attributes: Attributes, events: Event[]) => {
            const today = new Date();
            for (let i = 0; i < days; i++) {
              const targetDate = new Date(today);
              targetDate.setDate(today.getDate() - i);
              const hasEventOnDate = events.some(event => {
                const eventDate = new Date(event.timestamp);
                return eventDate.toDateString() === targetDate.toDateString();
              });
              if (!hasEventOnDate) return false;
            }
            return true;
          };
        
        default:
          return () => false;
      }
    };

    return (
      <div className="min-h-screen bg-[var(--bg-secondary)]" data-name="app" data-file="app.js">
        <Header 
          onAddEvent={() => setShowEventModal(true)} 
          onShowAchievements={() => setShowAchievementModal(true)}
          achievements={achievements}
        />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <StatsOverview attributes={attributes} achievements={achievements} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(attributes).map(([key, attr]) => (
                  <AttributeCard 
                    key={key} 
                    attributeKey={key} 
                    attribute={attr} 
                  />
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <EventList events={events} />
            </div>
          </div>
        </main>

        {showEventModal && (
          <EventModal 
            onClose={() => setShowEventModal(false)}
            onSubmit={handleAddEvent}
          />
        )}

        {showAchievementModal && (
          <AchievementModal 
            onClose={() => setShowAchievementModal(false)}
            onSubmit={handleAddCustomAchievement}
            achievements={achievements}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

export default App;