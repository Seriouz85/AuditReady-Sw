import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Target, TrendingUp, Clock } from "lucide-react";
import { useTheme } from "next-themes";

export default function DashboardPreview() {
  const { theme } = useTheme();

  return (
    <>
      {/* Subtle divider */}
      <div className="relative">
        <div className={`absolute inset-0 flex items-center justify-center ${theme === 'light' ? 'opacity-30' : 'opacity-20'}`}>
          <div className={`h-px w-1/3 ${theme === 'light' ? 'bg-gradient-to-r from-transparent via-slate-300 to-transparent' : 'bg-gradient-to-r from-transparent via-slate-600 to-transparent'}`}></div>
        </div>
      </div>

      <section className="py-16 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Powerful Features
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
              Your Command Center for Compliance
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-2xl mx-auto`}>
              Get a bird's-eye view of your compliance status across all frameworks.
              Monitor, track, and improve your security posture in real-time.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative mx-auto max-w-4xl sm:max-w-6xl">
            <div className={`relative rounded-lg overflow-hidden shadow-2xl ${theme === 'light' ? 'border border-slate-200' : 'border border-slate-600'}`}>
              <div className={`${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'} p-2 flex items-center gap-2`}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className={`${theme === 'light' ? 'bg-white' : 'bg-slate-800'} p-6`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={`${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700/70 border-slate-600'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold`}>Compliance Score</h3>
                        <div className="relative">
                          <div className={`absolute -inset-1 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-400 to-indigo-400'} opacity-25 blur animate-spin`} style={{ animationDuration: '8s' }}></div>
                          <Gauge className={`relative h-5 w-5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                        </div>
                      </div>
                      <div className={`text-3xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`}>87%</div>
                      <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} text-sm mt-2`}>+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className={`${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700/70 border-slate-600'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold`}>Active Assessments</h3>
                        <div className="relative">
                          <div className={`absolute -inset-1 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} opacity-20 blur animate-pulse`}></div>
                          <Target className={`relative h-5 w-5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                        </div>
                      </div>
                      <div className={`text-3xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`}>12</div>
                      <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} text-sm mt-2`}>3 due this week</p>
                    </CardContent>
                  </Card>
                  <Card className={`${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700/70 border-slate-600'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold`}>Risk Trend</h3>
                        <div className="relative">
                          <div className={`absolute -inset-1 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-green-400 to-emerald-400'} opacity-20 blur animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
                          <TrendingUp className={`relative h-5 w-5 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`} />
                        </div>
                      </div>
                      <div className={`text-3xl font-bold ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`}>-18%</div>
                      <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} text-sm mt-2`}>Improved security</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
