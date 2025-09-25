import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface Activity {
  id: string;
  type: 'election' | 'voter' | 'center' | 'candidate' | 'system';
  action: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  className?: string;
  loading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 5,
  className,
  loading = false
}) => {
  const displayActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <Card className={cn("election-card", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("election-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-1 bg-[#1e40af]/10 rounded">
            <div className="h-4 w-4 text-[#1e40af]">📊</div>
          </div>
          Activités Récentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📭</div>
              <p className="text-gray-500 text-sm">Aucune activité récente</p>
            </div>
          ) : (
            displayActivities.map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className={cn(
                  "p-2 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-200",
                  activity.color
                )}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                    {activity.status && (
                      <Badge 
                        variant={activity.status === 'success' ? 'default' : 
                                activity.status === 'warning' ? 'secondary' : 
                                activity.status === 'error' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{activity.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
