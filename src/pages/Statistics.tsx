
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllEntries } from "@/utils/storage";
import { MOODS, MoodType } from "@/types/mood";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const Statistics = () => {
  const navigate = useNavigate();
  const entries = getAllEntries();
  
  // Get mood distribution
  const moodCounts = Object.keys(MOODS).reduce((acc, mood) => {
    acc[mood] = entries.filter(entry => entry.mood === mood).length;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      name: MOODS[mood as MoodType].label,
      value: count,
      color: MOODS[mood as MoodType].color,
    }))
    .filter(item => item.value > 0); // Only show moods that have entries

  // Get daily mood trends for current month
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dailyMoodData = daysInMonth.map(day => {
    const dayEntries = entries.filter(entry => 
      format(new Date(entry.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
    
    return {
      date: format(day, 'dd MMM'),
      count: dayEntries.length,
      happy: dayEntries.filter(e => e.mood === 'happy').length,
      excited: dayEntries.filter(e => e.mood === 'excited').length,
      neutral: dayEntries.filter(e => e.mood === 'neutral').length,
      sad: dayEntries.filter(e => e.mood === 'sad').length,
      angry: dayEntries.filter(e => e.mood === 'angry').length,
    };
  });

  // Create a custom pie chart label renderer that prevents overlapping
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    // Skip labels for very small slices (less than 5%)
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2; // Position label outside the pie
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={pieChartData[index].color}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mood Statistics</h1>
        <Button onClick={() => navigate('/entries')}>Back to Entries</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    labelLine={true}
                    label={renderCustomizedLabel}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  <Tooltip formatter={(value, name) => [`${value} entries`, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No mood entries yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Mood Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyMoodData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="happy" stackId="a" fill={MOODS.happy.color} name="Happy" />
                <Bar dataKey="excited" stackId="a" fill={MOODS.excited.color} name="Excited" />
                <Bar dataKey="neutral" stackId="a" fill={MOODS.neutral.color} name="Neutral" />
                <Bar dataKey="sad" stackId="a" fill={MOODS.sad.color} name="Sad" />
                <Bar dataKey="angry" stackId="a" fill={MOODS.angry.color} name="Angry" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mood Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(MOODS).map(([mood, info]) => (
              <div key={mood} className="text-center p-4 rounded-lg bg-card">
                <div className="text-4xl mb-2">{info.emoji}</div>
                <div className="font-medium">{info.label}</div>
                <div className="text-2xl font-bold mt-2">
                  {moodCounts[mood] || 0}
                </div>
                <div className="text-sm text-muted-foreground">entries</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
