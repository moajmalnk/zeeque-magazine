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
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      label: 'Published',
      count: publishedCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Rejected',
      count: rejectedCount,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      label: 'Total Posts',
      count: totalCount,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(stat => (
        <Card
          key={stat.label}
          className={`${stat.bgColor} ${stat.borderColor} border-2`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
