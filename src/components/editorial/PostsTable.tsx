import { Post, categoryLabels, categoryIcons, PostStatus } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Check, X, RotateCcw, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PostsTableProps {
  posts: Post[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete: (id: string) => void;
  showStatus?: boolean;
}

const categoryStyles: Record<string, string> = {
  stories: 'bg-stories/20 text-stories border-stories/30',
  poems: 'bg-poems/20 text-poems border-poems/30',
  drawings: 'bg-drawings/20 text-drawings border-drawings/30',
  news: 'bg-news/20 text-news border-news/30',
};

const statusStyles: Record<PostStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  published: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabels: Record<PostStatus, string> = {
  pending: '⏳ Pending',
  published: '✅ Published',
  rejected: '❌ Rejected',
};

export function PostsTable({
  posts,
  onApprove,
  onReject,
  onRestore,
  onDelete,
  showStatus = false,
}: PostsTableProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No posts to display</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Author</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            {showStatus && <TableHead className="font-semibold">Status</TableHead>}
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map(post => (
            <TableRow key={post.id} className="hover:bg-muted/30">
              <TableCell className="font-medium max-w-[200px] truncate">
                {post.title}
              </TableCell>
              <TableCell>{post.authorName}</TableCell>
              <TableCell>
                <Badge className={`${categoryStyles[post.category]} border text-xs`}>
                  {categoryIcons[post.category]} {categoryLabels[post.category]}
                </Badge>
              </TableCell>
              {showStatus && (
                <TableCell>
                  <Badge className={`${statusStyles[post.status]} border text-xs`}>
                    {statusLabels[post.status]}
                  </Badge>
                </TableCell>
              )}
              <TableCell className="text-muted-foreground text-sm">
                {format(post.publishedAt || post.createdAt, 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-display">{post.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`${categoryStyles[post.category]} border`}>
                            {categoryIcons[post.category]} {categoryLabels[post.category]}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            by {post.authorName}
                          </span>
                        </div>
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full rounded-xl"
                          />
                        )}
                        <p className="text-foreground whitespace-pre-line">{post.content}</p>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onApprove && post.status !== 'published' && (
                        <DropdownMenuItem onClick={() => onApprove(post.id)}>
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {onReject && post.status !== 'rejected' && (
                        <DropdownMenuItem onClick={() => onReject(post.id)}>
                          <X className="mr-2 h-4 w-4 text-red-600" />
                          Reject
                        </DropdownMenuItem>
                      )}
                      {onRestore && (
                        <DropdownMenuItem onClick={() => onRestore(post.id)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Move to Pending
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={e => e.preventDefault()}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{post.title}" by {post.authorName}.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(post.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
