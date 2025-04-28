import { useState, lazy, Suspense } from 'react';
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
  ChevronRight
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Improved Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600">
                <Moon size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                SleepInsights
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Reduced Header */}
      <header className="pt-20 pb-10 px-6 bg-gradient-to-r from-indigo-700 to-purple-800 relative overflow-hidden">
        {/* Simplified decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-300/10 rounded-full translate-y-1/3"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              Sleep Quality <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">Insights Dashboard</span>
            </h1>
            
            <p className="text-base text-indigo-100 leading-relaxed">
              Interactive visualizations exploring connections between daily habits and sleep patterns.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-16 relative">
        {/* Current chart with title and description - improved */}
        <div 
          className="mb-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <ActiveIcon size={22} strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{charts[activeSlide].title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">{charts[activeSlide].description}</p>
            </div>
            <div className="p-6">
              <Suspense fallback={
                <div className="w-full h-[400px] flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
                  <p className="text-slate-500 animate-pulse">Loading visualization...</p>
                </div>
              }>
                <div className="rounded-xl overflow-hidden aspect-[16/9] h-[400px] w-full flex items-center justify-center">
                  <ActiveChartComponent />
                </div>
              </Suspense>
            </div>
          </div>
        </div>

        {/* Navigation controls moved below the chart */}
        <div className="flex items-center justify-center mb-8">
          <button 
            onClick={prevSlide}
            className="p-2.5 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 py-2 rounded-md bg-indigo-100 text-indigo-700 font-medium mx-4">
            {activeSlide + 1} / {charts.length}
          </span>
          <button 
            onClick={nextSlide}
            className="p-2.5 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Mini chart navigation - improved */}
        <div className="pb-12">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">All Visualizations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {charts.map((chart, index) => {
              const ChartIcon = chart.icon;
              return (
                <button
                  key={chart.id}
                  onClick={() => setActiveSlide(index)}
                  className={`flex items-center p-4 h-24 rounded-xl transition-all group ${
                    index === activeSlide 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-white text-slate-600 hover:bg-white/50 shadow-sm hover:shadow border border-slate-100'
                  }`}
                >
                  <div className={`flex-shrink-0 mr-3 ${
                    index === activeSlide 
                      ? 'text-white' 
                      : 'text-indigo-500 group-hover:text-indigo-600'
                  }`}>
                    <ChartIcon size={20} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className={`font-medium truncate ${
                      index === activeSlide 
                        ? 'text-white' 
                        : 'text-slate-700 group-hover:text-slate-900'
                    }`}>
                      {chart.id}. {chart.title.split(' ').slice(0, 2).join(' ')}...
                    </div>
                    <div className={`text-xs mt-1 ${
                      index === activeSlide 
                        ? 'text-indigo-100' 
                        : 'text-slate-500'
                    }`}>
                      View chart
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;