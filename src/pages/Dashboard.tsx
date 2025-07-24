import { TrendingUp, Calendar, Clock, Settings2, Lock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ModernDashboardSidebar } from "@/components/dashboard/ModernDashboardSidebar";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { getTypographyClasses, getIconClasses, commonPatterns, spacingStandards } from "@/lib/ui-standards";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isPlatformAdmin, isDemo, organization } = useAuth();
  const { stats, loading, error } = useDashboardData();
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null);
  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    // Existing Dashboard Cards (already on dashboard)
    'compliance-chart', 'cybersecurity-news', 'assessment-progress', 'current-activities',
    // Default metric widgets
    'total-standards', 'total-requirements', 'total-assessments', 'compliance-score'
  ]);

  // Platform admins should see the Platform Admin Console, not customer dashboard
  useEffect(() => {
    if (isPlatformAdmin) {
      console.log("Platform admin detected, redirecting to admin console");
      navigate("/admin", { replace: true });
    }
  }, [isPlatformAdmin, navigate]);

  // Cleanup auto-scroll on component unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, []);

  const getUserGreeting = () => {
    if (isDemo) {
      return "Welcome Demo User";
    }
    
    const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    return `Welcome ${displayName}`;
  };

  // Auto-scroll state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Auto-scroll helper functions
  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const startAutoScroll = () => {
    const scrollThreshold = 80; // pixels from edge to start scrolling
    const scrollSpeed = 8; // pixels per scroll
    
    const handleAutoScroll = () => {
      const mouseY = mousePosition.y;
      const windowHeight = window.innerHeight;
      
      if (mouseY < scrollThreshold && mouseY > 0) {
        // Scroll up
        window.scrollBy(0, -scrollSpeed);
      } else if (mouseY > windowHeight - scrollThreshold && mouseY < windowHeight) {
        // Scroll down
        window.scrollBy(0, scrollSpeed);
      }
    };
    
    if (!autoScrollInterval) {
      // Add mouse move listener
      document.addEventListener('mousemove', handleMouseMove);
      const interval = setInterval(handleAutoScroll, 16); // ~60fps
      setAutoScrollInterval(interval);
    }
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval) {
      // Remove mouse move listener
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    if (!isDragMode) return;
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Initialize mouse position and start auto-scroll
    setMousePosition({ x: e.clientX, y: e.clientY });
    startAutoScroll();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDragMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    if (!isDragMode || !draggedWidget || draggedWidget === targetWidgetId) return;
    e.preventDefault();
    
    // Stop auto-scrolling
    stopAutoScroll();
    
    // Reorder widgets by moving dragged widget to target position
    const draggedIndex = activeWidgets.indexOf(draggedWidget);
    const targetIndex = activeWidgets.indexOf(targetWidgetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newWidgets = [...activeWidgets];
    newWidgets.splice(draggedIndex, 1); // Remove dragged widget
    newWidgets.splice(targetIndex, 0, draggedWidget); // Insert at target position
    
    setActiveWidgets(newWidgets);
    setDraggedWidget(null);
  };

  const handleDragEnd = () => {
    // Stop auto-scrolling
    stopAutoScroll();
    setDraggedWidget(null);
  };

  // Handle adding new widget from customization panel
  const handleAddWidget = (widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets([...activeWidgets, widgetId]);
    }
  };

  // Handle removing widget
  const handleRemoveWidget = (widgetId: string) => {
    setActiveWidgets(activeWidgets.filter(id => id !== widgetId));
  };

  // Handle toggling drag mode
  const handleToggleDragMode = () => {
    setIsDragMode(!isDragMode);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="pt-0 space-y-4 sm:space-y-6 pb-6 sm:pb-8 w-full px-2 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="pt-0 space-y-4 sm:space-y-6 pb-6 sm:pb-8 w-full px-2 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="mt-2 text-muted-foreground">Error loading dashboard: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full relative">
      {/* Main Dashboard Content */}
      <motion.div
        className={`pt-0 space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-2 sm:px-0 transition-all duration-300 ${
          isCustomizationOpen ? 'mr-[420px]' : 'w-full'
        }`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
      <div className={commonPatterns.pageHeader}>
        <div className="flex flex-col">
          <h1 className={getTypographyClasses('page-title')}>Compliance Dashboard</h1>
          <p className={`${getTypographyClasses('muted')} mt-1`}>
            Track your organization's compliance status and assessments across all standards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                spacingStandards.buttonSpacing,
                "text-muted-foreground hover:text-foreground transition-colors"
              )}
              onClick={() => setIsCustomizationOpen(!isCustomizationOpen)}
            >
              <Settings2 className={getIconClasses('sm')} />
              Customize Dashboard
            </Button>
            {isDragMode && (
              <Button 
                variant="default" 
                size="sm" 
                className={spacingStandards.buttonSpacing}
                onClick={() => setIsDragMode(false)}
              >
                <Lock className={getIconClasses('sm')} />
                Lock Layout
              </Button>
            )}
          </div>
          <div className="mt-1 md:mt-0 py-2 px-3 sm:py-1 sm:px-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
            <h2 className="text-sm sm:text-base font-medium text-blue-800 dark:text-blue-400">{getUserGreeting()}</h2>
          </div>
        </div>
      </div>

      {/* Re-added Recent Trend Card */}
      <motion.div
        variants={fadeInVariants}
        className="bg-gradient-to-r from-blue-50 via-background to-teal-50 dark:from-blue-950/30 dark:via-slate-900/60 dark:to-teal-950/30 rounded-xl p-4 shadow-lg w-full border border-border/70"
        data-card="true"
      >
        <div className="flex flex-col md:flex-row justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
              <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Recent Trend</h3>
              <p className="text-xs text-muted-foreground">Your compliance is improving by 5% since last month</p>
            </div>
          </div>

          <div className="flex flex-row gap-3">
            <div className="flex items-center gap-2 bg-background dark:bg-gray-800/60 p-2 rounded-lg shadow-sm">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-lg">
                <Calendar size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next assessment</p>
                <p className="text-sm font-medium">June 15, 2023</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-background dark:bg-gray-800/60 p-2 rounded-lg shadow-sm">
              <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded-lg">
                <Clock size={14} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Widget Grid - Metric Widgets + Additional Widgets */}
      <motion.div
        className={`${commonPatterns.statsGrid} w-full`}
        variants={itemVariants}
      >
        {/* First render the 4 core metric widgets */}
        {activeWidgets.filter(id => ['total-standards', 'total-requirements', 'total-assessments', 'compliance-score'].includes(id)).map((widgetId) => (
          <DashboardWidget
            key={widgetId}
            widgetId={widgetId}
            isDragMode={isDragMode}
            onRemove={handleRemoveWidget}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            realData={stats}
            onClick={() => {
              // Navigate based on widget ID
              if (!isDragMode) {
                switch(widgetId) {
                  case 'total-standards':
                    navigate('/app/standards');
                    break;
                  case 'total-requirements':
                    navigate('/app/requirements');
                    break;
                  case 'total-assessments':
                    navigate('/app/assessments');
                    break;
                  case 'compliance-score':
                    navigate('/app/compliance-monitoring');
                    break;
                }
              }
            }}
          />
        ))}
        
        {/* Then render any additional widgets added from sidebar */}
        {(() => {
          const predefinedLayoutWidgets = [
            'total-standards', 'total-requirements', 'total-assessments', 'compliance-score',
            'compliance-chart', 'cybersecurity-news', 'current-activities', 'assessment-progress'
          ];
          const additionalWidgets = activeWidgets.filter(id => !predefinedLayoutWidgets.includes(id));
          
          return additionalWidgets.map((widgetId) => (
            <DashboardWidget
              key={widgetId}
              widgetId={widgetId}
              isDragMode={isDragMode}
              onRemove={handleRemoveWidget}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              realData={stats}
            />
          ));
        })()}
      </motion.div>

      {/* Existing Dashboard Components Layout */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-6 gap-5 w-full"
        variants={itemVariants}
      >
        {/* Left Column - Compliance Chart and Current Activities */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Compliance Chart */}
          {activeWidgets.includes('compliance-chart') && (
            <DashboardWidget
              key="compliance-chart"
              widgetId="compliance-chart"
              isDragMode={isDragMode}
              onRemove={handleRemoveWidget}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              realData={stats}
            />
          )}

          {/* Current Activities */}
          {activeWidgets.includes('current-activities') && (
            <DashboardWidget
              key="current-activities"
              widgetId="current-activities"
              isDragMode={isDragMode}
              onRemove={handleRemoveWidget}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              realData={stats}
            />
          )}
        </div>

        {/* Right Column - Cybersecurity News */}
        {activeWidgets.includes('cybersecurity-news') && (
          <div className="lg:col-span-4">
            <DashboardWidget
              key="cybersecurity-news"
              widgetId="cybersecurity-news"
              isDragMode={isDragMode}
              onRemove={handleRemoveWidget}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              realData={stats}
            />
          </div>
        )}
      </motion.div>

      {/* Assessment Progress - Full Width Below */}
      {activeWidgets.includes('assessment-progress') && (
        <motion.div variants={itemVariants} className="w-full">
          <DashboardWidget
            key="assessment-progress"
            widgetId="assessment-progress"
            isDragMode={isDragMode}
            onRemove={handleRemoveWidget}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            realData={stats}
            onClick={() => !isDragMode && navigate('/app/assessments')}
          />
        </motion.div>
      )}



      </motion.div>

      {/* Modern Dashboard Sidebar */}
      <ModernDashboardSidebar
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        activeWidgets={activeWidgets}
        onAddWidget={handleAddWidget}
        onRemoveWidget={handleRemoveWidget}
        onToggleDragMode={handleToggleDragMode}
        isDragMode={isDragMode}
      />
    </div>
  );
};



export default Dashboard;
