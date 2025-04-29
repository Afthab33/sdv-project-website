import { useState, lazy, Suspense, useEffect } from 'react';
import { 
  Moon, 
  Zap, 
  Coffee, 
  Activity, 
  Smile, 
  Briefcase, 
  Battery, 
  BedDouble, 
  Utensils, 
  PieChart,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Grid,
  LayoutGrid,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Lazy load all chart components
const Chart1_SleepQualityVsTotalSleep = lazy(() => import('./Chart1_SleepQualityVsTotalSleep'));
const Chart2_MorningEnergyVsDeepSleep = lazy(() => import('./Chart2_MorningEnergyVsDeepSleep'));
const Chart3_CaffeineVsREMSleep = lazy(() => import('./Chart3_CaffeineVsREMSleep'));
const Chart4_ActivityTimingVsSleep = lazy(() => import('./Chart4_ActivityTimingVsSleep'));
const Chart5_MoodVsSleepStages = lazy(() => import('./Chart5_MoodVsSleepStages'));
const Chart6_WorkloadVsSleep = lazy(() => import('./Chart6_WorkloadVsSleep'));
const Chart7_AfternoonEnergyVsSleep = lazy(() => import('./Chart7_AfternoonEnergyVsSleep'));
const Chart8_NapVsSleep = lazy(() => import('./Chart8_NapVsSleep'));
const Chart9_DinnerTimeVsSleep = lazy(() => import('./Chart9_DinnerTimeVsSleep'));
const Chart10_SleepQualitySummary = lazy(() => import('./Chart10_SleepQualitySummary'));

const Dashboard = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    // Auto-enable compact mode on smaller screens
    if (window.innerWidth < 1024 && !compactMode) {
      setCompactMode(true);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [compactMode]);

  // Define all charts with titles and descriptions
  const charts = [
    {
      id: 1,
      title: "Sleep Quality vs Total Sleep",
      description: "This chart explores the relationship between how well-rested people feel and their actual total sleep duration. It helps identify whether more sleep consistently leads to feeling more rested.",
      component: Chart1_SleepQualityVsTotalSleep,
      icon: Moon
    },
    {
      id: 2,
      title: "Morning Energy vs Deep Sleep",
      description: "Examining how deep sleep hours affect morning energy levels. The bubble size represents total sleep duration, showing whether deep sleep or overall sleep duration has a stronger impact on morning energy.",
      component: Chart2_MorningEnergyVsDeepSleep,
      icon: Zap
    },
    {
      id: 3,
      title: "Caffeine Intake vs REM Sleep",
      description: "This analysis shows how caffeine consumption before bed affects REM sleep duration. The boxplot displays the distribution, median, and outliers for both groups.",
      component: Chart3_CaffeineVsREMSleep,
      icon: Coffee
    },
    {
      id: 4,
      title: "Activity Timing vs Sleep Duration",
      description: "Comparing average sleep duration based on when physical activity was performed (morning, afternoon, or evening). This helps determine the optimal time for exercise to improve sleep quality.",
      component: Chart4_ActivityTimingVsSleep,
      icon: Activity
    },
    {
      id: 5,
      title: "Mood vs Sleep Stages",
      description: "Analyzing how different sleep stages (REM, Deep, Core) contribute to mood after waking up. The stacked bars show the composition of sleep for different mood outcomes.",
      component: Chart5_MoodVsSleepStages,
      icon: Smile
    },
    {
      id: 6,
      title: "Workload vs Sleep Duration",
      description: "Exploring how work intensity affects sleep duration and quality. The visualization includes error bars to show the variability within each workload group.",
      component: Chart6_WorkloadVsSleep,
      icon: Briefcase
    },
    {
      id: 7,
      title: "Afternoon Energy vs Sleep",
      description: "Investigating the relationship between total sleep duration and afternoon energy levels. Larger circles indicate more data points with that specific combination.",
      component: Chart7_AfternoonEnergyVsSleep,
      icon: Battery
    },
    {
      id: 8,
      title: "Nap Need vs Sleep Duration",
      description: "Comparing sleep duration between people who feel the need to nap during the day and those who don't. This helps identify whether shorter night sleep leads to daytime nap needs.",
      component: Chart8_NapVsSleep,
      icon: BedDouble
    },
    {
      id: 9,
      title: "Dinner Time vs Sleep Quality",
      description: "Analyzing how the timing of dinner affects sleep duration and quality. This chart helps identify whether late dinners are associated with poorer sleep outcomes.",
      component: Chart9_DinnerTimeVsSleep,
      icon: Utensils
    },
    {
      id: 10,
      title: "Sleep Quality Distribution",
      description: "An overview of how sleep quality is distributed across the dataset. This donut chart shows the proportion of participants reporting different levels of feeling rested.",
      component: Chart10_SleepQualitySummary,
      icon: PieChart
    }
  ];

  // Navigate to previous slide
  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + charts.length) % charts.length);
  };

  // Navigate to next slide
  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % charts.length);
  };

  // Get the current active chart component
  const ActiveChartComponent = charts[activeSlide].component;
  const ActiveIcon = charts[activeSlide].icon;

  // Toggle compact mode
  const toggleCompactMode = () => {
    setCompactMode(!compactMode);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when selecting a chart on mobile
  const selectChart = (index) => {
    setActiveSlide(index);
    if (windowSize.width < 768) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-x-hidden">
      {/* Responsive Navbar */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600">
                <Moon size={windowSize.width < 768 ? 16 : 18} className="text-white" />
              </div>
              <h1 className={`font-semibold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent ${windowSize.width < 768 ? 'text-base' : 'text-lg'}`}>
                SleepInsights
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleCompactMode}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                title={compactMode ? "Expanded view" : "Compact view"}
              >
                {compactMode ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={toggleMenu}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Optional header - only show in expanded mode */}
      {!compactMode && (
        <header className="py-4 px-4 md:px-6 bg-gradient-to-r from-indigo-700 to-purple-800 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative">
            <div className="max-w-2xl">
              <h1 className={`font-bold text-white leading-tight ${windowSize.width < 768 ? 'text-xl' : 'text-2xl'}`}>
                Sleep Quality <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">Insights Dashboard</span>
              </h1>
              <p className="text-sm text-indigo-100 mt-1 leading-relaxed">
                Interactive visualizations exploring connections between daily habits and sleep patterns.
              </p>
            </div>
          </div>
        </header>
      )}

      {/* Mobile navigation drawer */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
           onClick={() => setMenuOpen(false)}>
        <div 
          className={`absolute right-0 top-0 h-full w-64 bg-white shadow-xl transition-transform transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">All Visualizations</h3>
          </div>
          <div className="overflow-y-auto h-[calc(100%-56px)]">
            {charts.map((chart, index) => {
              const ChartIcon = chart.icon;
              return (
                <button
                  key={chart.id}
                  onClick={() => selectChart(index)}
                  className={`flex items-center w-full p-3 transition-colors ${
                    index === activeSlide 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex-shrink-0 mr-3 ${
                    index === activeSlide 
                      ? 'text-indigo-600' 
                      : 'text-slate-400'
                  }`}>
                    <ChartIcon size={16} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className={`text-sm truncate ${
                      index === activeSlide 
                        ? 'font-medium' 
                        : 'font-normal text-slate-600'
                    }`}>
                      {chart.id}. {chart.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className={`max-w-7xl mx-auto px-4 ${compactMode ? 'pt-3 pb-6' : 'pt-6 pb-10'} relative`}>
        {/* Main chart area */}
        <div 
          className="mb-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border border-slate-100">
            <div className={`px-4 ${compactMode ? 'py-2.5' : 'py-4'} border-b border-slate-100`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
                    <ActiveIcon size={windowSize.width < 768 ? 16 : 18} strokeWidth={2} />
                  </div>
                  <h2 className={`font-bold text-slate-800 truncate ${windowSize.width < 768 ? 'text-base' : 'text-lg'}`}>
                    {charts[activeSlide].title}
                  </h2>
                </div>
                
                {/* Integrate navigation controls in header for better space usage */}
                <div className="flex items-center">
                  <button 
                    onClick={prevSlide}
                    className="p-1.5 rounded-md text-indigo-700 hover:bg-indigo-100 transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={windowSize.width < 768 ? 16 : 18} />
                  </button>
                  <span className="px-2 py-1 text-xs rounded-md bg-indigo-100 text-indigo-700 font-medium mx-1">
                    {activeSlide + 1} / {charts.length}
                  </span>
                  <button 
                    onClick={nextSlide}
                    className="p-1.5 rounded-md text-indigo-700 hover:bg-indigo-100 transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={windowSize.width < 768 ? 16 : 18} />
                  </button>
                </div>
              </div>
              
              {/* Only show description if not in compact mode */}
              {!compactMode && (
                <p className="text-slate-600 text-sm mt-2 line-clamp-2">
                  {charts[activeSlide].description}
                </p>
              )}
            </div>
            
            <div className={`${compactMode ? 'p-2' : 'p-4'}`}>
              <Suspense fallback={
                <div className={`w-full flex flex-col items-center justify-center ${compactMode ? 'h-[300px]' : 'h-[350px]'}`}>
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-500 mb-3"></div>
                  <p className="text-slate-500 text-sm animate-pulse">Loading visualization...</p>
                </div>
              }>
                <div className="rounded-lg overflow-hidden w-full flex items-center justify-center"
                     style={{ height: compactMode ? (windowSize.width < 768 ? '280px' : '300px') : (windowSize.width < 768 ? '300px' : '350px') }}>
                  <ActiveChartComponent />
                </div>
              </Suspense>
            </div>
          </div>
        </div>

        {/* Mini chart navigation - Only visible on tablet and desktop */}
        <div className="hidden md:block pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-700">All Visualizations</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {charts.map((chart, index) => {
              const ChartIcon = chart.icon;
              return (
                <button
                  key={chart.id}
                  onClick={() => setActiveSlide(index)}
                  className={`flex items-center p-2 h-[40px] rounded-lg transition-all ${
                    index === activeSlide 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 hover:bg-white/50 shadow-sm hover:shadow border border-slate-100'
                  }`}
                >
                  <div className={`flex-shrink-0 mr-2 ${
                    index === activeSlide 
                      ? 'text-white' 
                      : 'text-indigo-500'
                  }`}>
                    <ChartIcon size={14} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className={`text-xs truncate font-medium ${
                      index === activeSlide 
                        ? 'text-white' 
                        : 'text-slate-700'
                    }`}>
                      {chart.id}. {chart.title.split(' ').slice(0, 2).join(' ')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Mobile chart selection buttons - Only visible on small screens */}
        <div className="md:hidden flex flex-wrap gap-1.5 justify-center">
          {charts.map((chart, index) => (
            <button
              key={chart.id}
              onClick={() => setActiveSlide(index)}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                index === activeSlide 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {chart.id}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;