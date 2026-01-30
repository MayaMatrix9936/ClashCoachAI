import React, { useState, useRef, useEffect } from 'react';
import { Target, Sword, Crosshair, ChevronRight, RefreshCw, Cpu, MessageSquare, PenTool } from 'lucide-react';
import FileUpload from './components/FileUpload';
import PlanDisplay from './components/PlanDisplay';
import LoadingOverlay from './components/LoadingOverlay';
import { generateAttackPlan } from './services/geminiService';
import { GoalType, AnalysisStatus, AttackPlanResponse } from './types';

const App: React.FC = () => {
  const [armyFile, setArmyFile] = useState<File | null>(null);
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [goal, setGoal] = useState<string>('Three Star / Destruction');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AttackPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const predefinedGoals: GoalType[] = [
    'Three Star / Destruction',
    'Loot Resources',
    'Trophy Push',
    'Safe Two Star'
  ];

  useEffect(() => {
    if (!baseFile) {
      setBaseImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(baseFile);
    setBaseImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [baseFile]);

  const isAdultContent = (text: string) => {
    const lower = text.toLowerCase();
    const adultKeywords = [
      'porn', 'sex', 'nude', 'nudes', 'nsfw', 'xxx', 'adult',
      'erotic', 'fetish', 'boobs', 'dick', 'vagina', 'blowjob',
      'onlyfans', 'hentai'
    ];
    return adultKeywords.some((keyword) => lower.includes(keyword));
  };

  const isClashRelated = (text: string) => {
    const lower = text.toLowerCase();
    const cocKeywords = [
      'clash of clans', 'clash', 'coc',
      'town hall', 'eagle artillery', 'inferno', 'scattershot', 'x-bow',
      'barbarian', 'archer', 'giant', 'goblin', 'wizard', 'healer',
      'dragon', 'baby dragon', 'pekka', 'golem', 'valkyrie', 'witch',
      'lava hound', 'bowler', 'miner', 'electro dragon', 'hog rider',
      'royal champion', 'grand warden', 'archer queen', 'barbarian king',
      'elixir', 'dark elixir', 'trophy', 'loot', 'three star', 'two star',
      'war', 'clan war', 'siege', 'blimp', 'stone slammer', 'wall wrecker'
    ];
    return cocKeywords.some((keyword) => lower.includes(keyword));
  };


  const handleGenerate = async () => {
    if (!armyFile || !baseFile) {
      setError("Please upload both an Army image and an Enemy Base image.");
      return;
    }
    if (!goal.trim()) {
      setError("Please specify a goal for the attack.");
      return;
    }
    if (isAdultContent(goal) || !isClashRelated(goal)) {
      const message = "This request isn't allowed. Please enter a Clash of Clans-related request, check your spelling, and try again.";
      window.alert(message);
      setError(message);
      setStatus(AnalysisStatus.ERROR);
      return;
    }

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult(null);
    setLoadingStep(0);

    try {
      const response = await generateAttackPlan(
        {
          armyImage: armyFile,
          baseImage: baseFile,
          goal,
        },
        { onProgress: setLoadingStep }
      );
      setResult(response);
      setStatus(AnalysisStatus.SUCCESS);
      // Scroll to results after a short delay to allow render
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const resetApp = () => {
    setArmyFile(null);
    setBaseFile(null);
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAnalyzing = status === AnalysisStatus.ANALYZING;

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-gaming-accent/30">
      {/* Loading Overlay */}
      {isAnalyzing && <LoadingOverlay currentStep={loadingStep} />}

      {/* Header */}
      <header className="border-b border-gaming-700 bg-gaming-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gaming-accent/10 rounded-lg">
                <Crosshair className="text-gaming-accent w-6 h-6" />
            </div>
            <span className="text-xl font-display font-bold tracking-wider text-white">CLASHCOACH <span className="text-gaming-accent">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-400">
             <span className="hover:text-white cursor-pointer transition-colors">History</span>
             <span className="hover:text-white cursor-pointer transition-colors">Settings</span>
             <div className="w-px h-4 bg-gaming-700"></div>
             <span className="text-gaming-accent flex items-center gap-1"><Cpu size={14} /> v1.0.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Intro Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gaming-accent to-emerald-600">Strategy</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Upload your army and enemy base to generate AI-optimized tactical plans tailored to your specific goals.
          </p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <FileUpload 
            id="army-upload"
            label="1. Upload Army Composition" 
            onFileSelect={setArmyFile} 
          />
          <FileUpload 
            id="base-upload"
            label="2. Upload Enemy Base" 
            onFileSelect={setBaseFile} 
          />
        </div>

        {/* Configuration Section */}
        <div className="bg-gaming-800/50 rounded-xl p-6 border border-gaming-700 mb-10">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3 font-display uppercase tracking-wider">
                <PenTool size={16} className="text-gaming-accent" />
                3. Define Tactical Goal
            </label>
            
            {/* Quick Select Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {predefinedGoals.map((type) => (
                <button
                  key={type}
                  onClick={() => setGoal(type)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                    ${goal === type 
                      ? 'bg-gaming-accent/20 border-gaming-accent text-gaming-accent' 
                      : 'bg-gaming-900 border-gaming-700 text-gray-400 hover:border-gray-500 hover:text-white'
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Custom Input Area */}
            <div className="relative group">
                <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Describe your goal (e.g., 'Get 3 stars but avoid the Eagle Artillery' or 'Farm Dark Elixir only')..."
                    className="w-full bg-gaming-900/50 border border-gaming-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent/50 transition-all duration-300 min-h-[100px] resize-y"
                />
                <div className="absolute bottom-3 right-3 text-gaming-700 group-focus-within:text-gaming-accent transition-colors">
                    <MessageSquare size={16} />
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Tip: You can select a preset above and then edit the text to add specific constraints (e.g., "My King is upgrading").
            </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center justify-center mb-16">
            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}
            
            <button
                onClick={handleGenerate}
                disabled={isAnalyzing || !armyFile || !baseFile}
                className={`
                    group relative px-8 py-4 rounded-full font-bold text-lg font-display tracking-widest uppercase overflow-hidden transition-all duration-300
                    ${isAnalyzing || !armyFile || !baseFile
                        ? 'bg-gaming-800 text-gray-600 cursor-not-allowed border border-gaming-700'
                        : 'bg-gaming-accent text-gaming-900 hover:shadow-[0_0_30px_rgba(0,220,130,0.4)] hover:scale-105'
                    }
                `}
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                <span className="flex items-center gap-3">
                    {isAnalyzing ? (
                        <>
                            <RefreshCw className="animate-spin" /> Analyzing...
                        </>
                    ) : (
                        <>
                            <Sword className={!armyFile || !baseFile ? "" : "animate-pulse"} /> Generate Attack Plan
                        </>
                    )}
                </span>
            </button>
        </div>

        {/* Results Section */}
        {status === AnalysisStatus.SUCCESS && result && (
            <div ref={resultsRef} className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                        <Target className="text-gaming-accent" />
                        Tactical Analysis Result
                    </h2>
                    <button 
                        onClick={resetApp}
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 hover:underline"
                    >
                        Start New Analysis <ChevronRight size={14} />
                    </button>
                </div>
                
                <PlanDisplay response={result} baseImageUrl={baseImageUrl} />
            </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-10 border-t border-gaming-800 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} ClashCoach AI. Optimized for strategic dominance.</p>
          <p className="mt-2 text-xs">AI recommendations should be used as guidance. Results may vary.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
