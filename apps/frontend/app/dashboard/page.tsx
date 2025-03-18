'use client'

import React from 'react';
import { 
  RefreshCcw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Settings, 
  Plus,
  ExternalLink
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWebsites } from '@/hooks/useWebsite';

// Enums to match Prisma schema
enum WebsiteStatus {
  Good = 'Good',
  Bad = 'Bad'
}

// Updated TypeScript interfaces to match Prisma schema
interface WebsiteTick {
  id: string;
  websiteId: string;
  validatorId: string;
  status: WebsiteStatus;
  latency: number | null;
  createdAt: Date;
  disabled: boolean;
}

interface Website {
  id: string;
  url: string;
  userId: string;
  disabled: boolean;
  ticks: WebsiteTick[];
}

const UptimeDashboard: React.FC = () => {
  // Use the hook to fetch websites from the API
  const websites = useWebsites();

  // Handle loading state
  if (!websites) {
    return (
      <div className="pt-20 pb-10 min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="contndainer mx-auto px-4 flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCcw size={24} className="animate-spin text-slate-400" />
            <p className="text-slate-500 dark:text-slate-400">Loading website data...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: WebsiteStatus): string => {
    return status === WebsiteStatus.Good ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-red-500 dark:bg-red-600';
  };

  const getStatusBadge = (status: WebsiteStatus) => {
    if (status === WebsiteStatus.Good) {
      return <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">Operational</Badge>;
    }
    return <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">Down</Badge>;
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLatencyColor = (latency: number | null): string => {
    if (!latency) return 'text-gray-400 dark:text-gray-500';
    if (latency < 200) return 'text-emerald-600 dark:text-emerald-400';
    if (latency < 500) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatLatency = (latency: number | null): string => {
    return latency ? `${Math.round(latency)}ms` : 'N/A';
  };

  const getLatestActiveTick = (website: Website): WebsiteTick | null => {
    if (!website.ticks || website.ticks.length === 0) return null;
    
    // Filter out disabled ticks and sort by creation date (newest first)
    const activeTicks = website.ticks
      .filter(tick => !tick.disabled)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return activeTicks.length > 0 ? activeTicks[0] : null;
  };

  const getLatestStatus = (website: Website): WebsiteStatus => {
    const latestTick = getLatestActiveTick(website);
    return latestTick ? latestTick.status : WebsiteStatus.Bad;
  };

  const getAverageLatency = (website: Website): number => {
    if (!website.ticks || website.ticks.length === 0) return 0;
    
    const validLatencies = website.ticks
      .filter(tick => !tick.disabled && tick.latency !== null)
      .map(tick => tick.latency as number);
    
    if (validLatencies.length === 0) return 0;
    return Math.round(validLatencies.reduce((sum, latency) => sum + latency, 0) / validLatencies.length);
  };

  const getUptimePercentage = (website: Website): number => {
    if (!website.ticks || website.ticks.length === 0) return 0;
    
    const activeTicks = website.ticks.filter(tick => !tick.disabled);
    if (activeTicks.length === 0) return 0;
    
    const goodTicks = activeTicks.filter(tick => tick.status === WebsiteStatus.Good).length;
    return Math.round((goodTicks / activeTicks.length) * 100);
  };

  const getActiveTicks = (website: Website): WebsiteTick[] => {
    return website.ticks
      .filter(tick => !tick.disabled)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  return (
    <div className="pt-20 pb-10 min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Website Monitoring</h1>
              <p className="text-slate-500 dark:text-slate-400">Track the uptime and performance of your websites</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  // This will trigger the refreshWebsites function in the hook
                  window.location.reload();
                }}
              >
                <RefreshCcw size={14} />
                <span>Refresh</span>
              </Button>
              <Button size="sm" className="flex items-center gap-1">
                <Plus size={14} />
                <span>Add Website</span>
              </Button>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Websites</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{websites.length}</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Operational</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {websites.filter(w => !w.disabled && getLatestStatus(w) === WebsiteStatus.Good).length}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Issues</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {websites.filter(w => !w.disabled && getLatestStatus(w) === WebsiteStatus.Bad).length}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex justify-between items-center">
                <CardTitle className="text-slate-900 dark:text-white text-lg">Monitored Websites</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input 
                      type="text" 
                      placeholder="Search websites..." 
                      className="pl-8 h-9 w-[200px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-6 py-2 border-b border-slate-200 dark:border-slate-800">
                  <TabsList className="bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="operational">Operational</TabsTrigger>
                    <TabsTrigger value="issues">Issues</TabsTrigger>
                    <TabsTrigger value="disabled">Disabled</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all" className="m-0">
                  <ScrollArea className="h-[60vh]">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {websites.map((website) => {
                        const latestTick = getLatestActiveTick(website);
                        const activeTicks = getActiveTicks(website);
                        
                        return (
                          <div key={website.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${website.disabled ? 'opacity-60' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-slate-900 dark:text-white">{website.url}</h3>
                                    <a href={`https://${website.url}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                      <ExternalLink size={14} />
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    {getStatusBadge(getLatestStatus(website))}
                                    
                                    {latestTick && (
                                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Clock size={12} />
                                        Last checked: {formatTime(latestTick.createdAt)}
                                      </span>
                                    )}
                                    
                                    {website.disabled && (
                                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                        Monitoring Disabled
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Avg Latency</p>
                                  <p className={`text-sm font-medium ${getLatencyColor(getAverageLatency(website))}`}>
                                    {formatLatency(getAverageLatency(website))}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Uptime</p>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {getUptimePercentage(website)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {activeTicks.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <TooltipProvider>
                                  {activeTicks.map((tick) => (
                                    <Tooltip key={tick.id}>
                                      <TooltipTrigger asChild>
                                        <div 
                                          className={`relative h-10 w-10 rounded-md flex items-center justify-center ${getStatusColor(tick.status)}`}
                                        >
                                          {tick.status === WebsiteStatus.Good ? 
                                            <CheckCircle size={16} className="text-white" /> : 
                                            <XCircle size={16} className="text-white" />
                                          }
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="bg-slate-900 dark:bg-slate-700 text-white p-3 rounded-md">
                                        <p className="font-medium">{formatTime(tick.createdAt)}</p>
                                        <p className="text-xs text-slate-300">Status: {tick.status}</p>
                                        <p className="text-xs text-slate-300">Latency: {formatLatency(tick.latency)}</p>
                                        <p className="text-xs text-slate-300">Validator ID: {tick.validatorId}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                </TooltipProvider>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="operational" className="m-0">
                  <ScrollArea className="h-[60vh]">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {websites
                        .filter(w => !w.disabled && getLatestStatus(w) === WebsiteStatus.Good)
                        .map((website) => {
                          const latestTick = getLatestActiveTick(website);
                          const activeTicks = getActiveTicks(website);
                          
                          return (
                            <div key={website.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-slate-900 dark:text-white">{website.url}</h3>
                                      <a href={`https://${website.url}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        <ExternalLink size={14} />
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      {getStatusBadge(getLatestStatus(website))}
                                      
                                      {latestTick && (
                                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <Clock size={12} />
                                          Last checked: {formatTime(latestTick.createdAt)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Avg Latency</p>
                                    <p className={`text-sm font-medium ${getLatencyColor(getAverageLatency(website))}`}>
                                      {formatLatency(getAverageLatency(website))}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Uptime</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                      {getUptimePercentage(website)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {activeTicks.length > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <TooltipProvider>
                                    {activeTicks.map((tick) => (
                                      <Tooltip key={tick.id}>
                                        <TooltipTrigger asChild>
                                          <div 
                                            className={`relative h-10 w-10 rounded-md flex items-center justify-center ${getStatusColor(tick.status)}`}
                                          >
                                            {tick.status === WebsiteStatus.Good ? 
                                              <CheckCircle size={16} className="text-white" /> : 
                                              <XCircle size={16} className="text-white" />
                                            }
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="bg-slate-900 dark:bg-slate-700 text-white p-3 rounded-md">
                                          <p className="font-medium">{formatTime(tick.createdAt)}</p>
                                          <p className="text-xs text-slate-300">Status: {tick.status}</p>
                                          <p className="text-xs text-slate-300">Latency: {formatLatency(tick.latency)}</p>
                                          <p className="text-xs text-slate-300">Validator ID: {tick.validatorId}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                  </TooltipProvider>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="issues" className="m-0">
                  <ScrollArea className="h-[60vh]">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {websites
                        .filter(w => !w.disabled && getLatestStatus(w) === WebsiteStatus.Bad)
                        .map((website) => {
                          const latestTick = getLatestActiveTick(website);
                          const activeTicks = getActiveTicks(website);
                          
                          return (
                            <div key={website.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-slate-900 dark:text-white">{website.url}</h3>
                                      <a href={`https://${website.url}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        <ExternalLink size={14} />
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      {getStatusBadge(getLatestStatus(website))}
                                      
                                      {latestTick && (
                                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <Clock size={12} />
                                          Last checked: {formatTime(latestTick.createdAt)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Avg Latency</p>
                                    <p className={`text-sm font-medium ${getLatencyColor(getAverageLatency(website))}`}>
                                      {formatLatency(getAverageLatency(website))}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Uptime</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                      {getUptimePercentage(website)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {activeTicks.length > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <TooltipProvider>
                                    {activeTicks.map((tick) => (
                                      <Tooltip key={tick.id}>
                                        <TooltipTrigger asChild>
                                          <div 
                                            className={`relative h-10 w-10 rounded-md flex items-center justify-center ${getStatusColor(tick.status)}`}
                                          >
                                            {tick.status === WebsiteStatus.Good ? 
                                              <CheckCircle size={16} className="text-white" /> : 
                                              <XCircle size={16} className="text-white" />
                                            }
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="bg-slate-900 dark:bg-slate-700 text-white p-3 rounded-md">
                                          <p className="font-medium">{formatTime(tick.createdAt)}</p>
                                          <p className="text-xs text-slate-300">Status: {tick.status}</p>
                                          <p className="text-xs text-slate-300">Latency: {formatLatency(tick.latency)}</p>
                                          <p className="text-xs text-slate-300">Validator ID: {tick.validatorId}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                  </TooltipProvider>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="disabled" className="m-0">
                  <ScrollArea className="h-[60vh]">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {websites
                        .filter(w => w.disabled)
                        .map((website) => {
                          const latestTick = getLatestActiveTick(website);
                          const activeTicks = getActiveTicks(website);
                          
                          return (
                            <div key={website.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors opacity-60">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-slate-900 dark:text-white">{website.url}</h3>
                                      <a href={`https://${website.url}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        <ExternalLink size={14} />
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                        Monitoring Disabled
                                      </Badge>
                                      
                                      {latestTick && (
                                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <Clock size={12} />
                                          Last checked: {formatTime(latestTick.createdAt)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Avg Latency</p>
                                    <p className={`text-sm font-medium ${getLatencyColor(getAverageLatency(website))}`}>
                                      {formatLatency(getAverageLatency(website))}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Uptime</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                      {getUptimePercentage(website)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {activeTicks.length > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <TooltipProvider>
                                    {activeTicks.map((tick) => (
                                      <Tooltip key={tick.id}>
                                        <TooltipTrigger asChild>
                                          <div 
                                            className={`relative h-10 w-10 rounded-md flex items-center justify-center ${getStatusColor(tick.status)}`}
                                          >
                                            {tick.status === WebsiteStatus.Good ? 
                                              <CheckCircle size={16} className="text-white" /> : 
                                              <XCircle size={16} className="text-white" />
                                            }
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="bg-slate-900 dark:bg-slate-700 text-white p-3 rounded-md">
                                          <p className="font-medium">{formatTime(tick.createdAt)}</p>
                                          <p className="text-xs text-slate-300">Status: {tick.status}</p>
                                          <p className="text-xs text-slate-300">Latency: {formatLatency(tick.latency)}</p>
                                          <p className="text-xs text-slate-300">Validator ID: {tick.validatorId}</p>
                                        </TooltipContent>
                                        </Tooltip>
                                    ))}
                                  </TooltipProvider>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UptimeDashboard;