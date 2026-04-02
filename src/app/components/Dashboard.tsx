import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion as Motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { 
  Users, 
  Crown, 
  DollarSign, 
  Sparkles, 
  Calendar as CalendarIcon
} from 'lucide-react';
import { format, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "./ui/utils";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart,
  Line, 
  XAxis,
  YAxis, 
  CartesianGrid
} from 'recharts';
import { toast } from 'sonner';
import { FormattedNumber } from './FormattedNumber';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

const MOCK_REVENUE_DATA = [
  { name: 'Mon', revenue: 150 },
  { name: 'Tue', revenue: 230 },
  { name: 'Wed', revenue: 180 },
  { name: 'Thu', revenue: 290 },
  { name: 'Fri', revenue: 350 },
  { name: 'Sat', revenue: 420 },
  { name: 'Sun', revenue: 380 },
];

const MOCK_ELEMENTS_DATA = [
  { name: 'Wood', value: 35, color: '#22c55e' },
  { name: 'Fire', value: 25, color: '#ef4444' },
  { name: 'Earth', value: 20, color: '#eab308' },
  { name: 'Metal', value: 10, color: '#94a3b8' },
  { name: 'Water', value: 10, color: '#3b82f6' },
];

const MOCK_MISSING_DATA = [
  { name: 'Fire', value: 40, color: '#ef4444' },
  { name: 'Water', value: 30, color: '#3b82f6' },
  { name: 'Wood', value: 15, color: '#22c55e' },
  { name: 'Metal', value: 10, color: '#94a3b8' },
  { name: 'Earth', value: 5, color: '#eab308' },
];

export const Dashboard: React.FC = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [stats, setStats] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [dataElements, setDataElements] = useState<any[]>([]);
  const [dataMissingElements, setDataMissingElements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setIsClient(true);
    return () => {
      setIsClient(false);
    };
  }, []);

  const fetchData = async () => {
    try {
      if (isMountedRef.current) setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isMountedRef.current) return;

      setRevenueData(MOCK_REVENUE_DATA);
      setDataElements(MOCK_ELEMENTS_DATA);
      setDataMissingElements(MOCK_MISSING_DATA);
      
      const statsData = [
        {
          title: "Users",
          rawValue: 1245,
          change: "+12.5%",
          trend: "up",
          icon: Users,
          color: "text-chart-5",
          bg: "bg-chart-5/10"
        },
        {
          title: "Subscribers",
          rawValue: 320,
          change: "+8.2%",
          trend: "up",
          icon: Crown,
          color: "text-primary",
          bg: "bg-primary/10"
        },
        {
          title: "Revenue",
          rawValue: 15280,
          prefix: "$",
          change: "+23.1%",
          trend: "up",
          icon: DollarSign,
          color: "text-chart-4",
          bg: "bg-chart-4/10"
        },
        {
          title: "Fortune",
          rawValue: 85,
          suffix: "%",
          change: "-0.5%",
          trend: "down",
          icon: Sparkles,
          color: "text-chart-3",
          bg: "bg-chart-3/10"
        }
      ];
      setStats(statsData);
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch dashboard data', error);
        toast.error('Failed to load dashboard data');
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [timeRange, date]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your Feng Shui platform performance.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center p-1 bg-secondary/30 border border-white/5 rounded-xl gap-1">
            <Button 
              variant={timeRange === 'today' ? 'primary' : 'ghost'} 
              size="sm" 
              onClick={() => setTimeRange('today')}
              className={cn(
                "h-8 px-3",
                timeRange === 'today' ? "shadow-sm" : "text-muted-foreground hover:text-primary hover:bg-white/5"
              )}
            >
              Today
            </Button>
            <Button 
              variant={timeRange === 'week' ? 'primary' : 'ghost'} 
              size="sm" 
              onClick={() => setTimeRange('week')}
              className={cn(
                "h-8 px-3",
                timeRange === 'week' ? "shadow-sm" : "text-muted-foreground hover:text-primary hover:bg-white/5"
              )}
            >
              Week
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'primary' : 'ghost'} 
              size="sm" 
              onClick={() => setTimeRange('month')}
              className={cn(
                "h-8 px-3",
                timeRange === 'month' ? "shadow-sm" : "text-muted-foreground hover:text-primary hover:bg-white/5"
              )}
            >
              Month
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={timeRange === 'custom' ? 'primary' : 'ghost'}
                  size="sm"
                  className={cn(
                    "h-8 px-3 justify-start text-left font-normal",
                    timeRange === 'custom' ? "shadow-sm" : "text-muted-foreground hover:text-primary hover:bg-white/5",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    if (newDate) {
                      setTimeRange('custom');
                    }
                  }}
                  numberOfMonths={1}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => (
          <Motion.div
            key={`stat-${stat.title}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full relative overflow-hidden border-white/10 bg-card/40 dark:bg-black/40 backdrop-blur-xl shadow-lg transition-all duration-300 group">
              <CardContent className="p-[10px]">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg border border-white/5 ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-sm font-medium text-muted-foreground tracking-wide">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">
                    <FormattedNumber 
                      value={stat.rawValue} 
                      prefix={stat.prefix} 
                      suffix={stat.suffix} 
                    />
                  </h3>
                </div>
                {/* Decorative bg element */}
                <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full ${stat.bg} blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
              </CardContent>
            </Card>
          </Motion.div>
        ))}
      </Motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Daily revenue from subscriptions and fortune unlocks.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !isClient ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse">Loading chart...</div>
            ) : (
              <div className="h-[300px] w-full min-w-[200px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={200}>
                  <LineChart id="revenue-line-chart" data={revenueData}>
                      <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis key="xaxis" dataKey="name" stroke="var(--muted-foreground)" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                      <YAxis key="yaxis" stroke="var(--muted-foreground)" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                      <Tooltip 
                        key="tooltip"
                        contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', color: 'var(--popover-foreground)', borderRadius: 'var(--radius)' }}
                        itemStyle={{ color: 'var(--popover-foreground)' }}
                      />
                      <Line 
                        key="line"
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="var(--chart-1)" 
                        strokeWidth={3}
                        dot={{ fill: 'var(--chart-1)', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fortune Status Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Fortune generation pipeline health.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { label: 'Daily Fortunes', status: 'Operational', color: 'bg-emerald-500' },
                { label: 'Monthly Predictions', status: 'Generating...', color: 'bg-amber-500' },
                { label: 'Yearly Analysis', status: 'Scheduled', color: 'bg-blue-500' },
                { label: 'Email Notifications', status: 'Operational', color: 'bg-emerald-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_8px_currentColor]`} />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </div>
              ))}
              
              <div className="pt-4 border-t border-border mt-4">
                <div className="bg-secondary/30 rounded-lg p-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Server Load</span>
                    <span className="text-foreground font-bold">42%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-chart-2 to-chart-1 w-[42%]" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Master Elements Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Master Elements</CardTitle>
            <CardDescription>Distribution of Day Masters across user base.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !isClient ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse">Loading distribution...</div>
            ) : (
              <div className="h-[300px] w-full min-w-[200px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={200}>
                  <PieChart id="master-elements-pie-chart">
                    <Pie
                      key="pie-master"
                      name="Master Elements"
                      data={dataElements}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dataElements.map((entry) => (
                        <Cell key={`cell-elements-${entry.name}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      key="tooltip-master"
                      contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: 'var(--radius)', color: 'var(--popover-foreground)' }}
                      itemStyle={{ color: 'var(--popover-foreground)' }}
                    />
                    <Legend key="legend-master" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Missing Elements Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Missing Elements Analysis</CardTitle>
            <CardDescription>Most common missing elements (needs remedies).</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !isClient ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse">Loading analysis...</div>
            ) : (
              <div className="h-[300px] w-full min-w-[200px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={200}>
                  <PieChart id="missing-elements-pie-chart">
                    <Pie
                      key="pie-missing"
                      name="Missing Elements"
                      data={dataMissingElements}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dataMissingElements.map((entry) => (
                        <Cell key={`cell-missing-${entry.name}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      key="tooltip-missing"
                      contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: 'var(--radius)', color: 'var(--popover-foreground)' }}
                      itemStyle={{ color: 'var(--popover-foreground)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};