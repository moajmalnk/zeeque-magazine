import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

interface DashboardStatsProps {
  pendingCount: number;
  publishedCount: number;
  rejectedCount: number;
}

export function DashboardStats({
  pendingCount,
  publishedCount,
  rejectedCount,
}: DashboardStatsProps) {
  const totalCount = pendingCount + publishedCount + rejectedCount;

  const stats = [
    {
      label: 'Pending Review',
      count: pendingCount,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800/50',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    },
    {
      label: 'Published',
      count: publishedCount,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800/50',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
    },
    {
      label: 'Rejected',
      count: rejectedCount,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800/50',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
    },
    {
      label: 'Total Posts',
      count: totalCount,
      icon: FileText,
      color: 'text-primary dark:text-primary',
      bgColor: 'bg-primary/5 dark:bg-primary/10',
      borderColor: 'border-primary/20 dark:border-primary/30',
      iconBg: 'bg-primary/10 dark:bg-primary/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(stat => (
        <Card
          key={stat.label}
          className={`${stat.bgColor} ${stat.borderColor} border-2 shadow-card hover:shadow-hover transition-all duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`${stat.iconBg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold font-display text-foreground">{stat.count}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
