import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

interface CommentItemProps {
    comment: any;
    postId: string;
    variant?: "default" | "bubble";
    getRoleColor?: (role: any) => any;
    getInitials?: (name: any) => string;
}

export const CommentItem = ({ comment, postId, variant = "default", getRoleColor, getInitials }: CommentItemProps) => {
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const editMutation = useMutation({
        mutationFn: async (newContent: string) => {
            const response = await api.put(`/posts/${postId}/update_comment/${comment.id}/`, { content: newContent });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            setIsEditing(false);
            toast.success("Comment updated");
        },
        onError: () => {
            toast.error("Failed to update comment");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/posts/${postId}/delete_comment/${comment.id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            setIsDeleteDialogOpen(false);
            toast.success("Comment deleted");
        },
        onError: () => {
            toast.error("Failed to delete comment");
        },
    });

    const handleSave = () => {
        if (!editText.trim() || editText === comment.content) {
            setIsEditing(false);
            return;
        }
        editMutation.mutate(editText);
    };

    const roleStyles = getRoleColor ? getRoleColor(comment.user?.role) : null;
    const borderClass = roleStyles?.border || "border-slate-200";
    const initials = getInitials ? getInitials(comment.user?.username || "U") : (comment.user?.username?.[0]?.toUpperCase() || "U");

    const isCommentOwner = comment.is_owner;
    const canDelete = isCommentOwner || currentUser?.role === "ADMIN" || currentUser?.role === "EDITORIAL";
    const canEdit = isCommentOwner;

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_URL}${path}`;
    };

    if (isEditing) {
        return (
            <div className="flex gap-3 py-2 animate-in fade-in duration-200">
                <Avatar className={cn("w-8 h-8 shrink-0 border-2", borderClass)}>
                    <AvatarImage src={getImageUrl(comment.user?.profile_image)} />
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[80px] text-sm rounded-xl resize-none bg-slate-50 dark:bg-zinc-900 border-border"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                            className="h-8 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={editMutation.isPending}
                            className="h-8 rounded-lg"
                        >
                            {editMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-3 group relative animate-in fade-in duration-300">
            <Avatar className={cn(
                variant === "bubble" ? "w-10 h-10 rounded-xl" : "w-8 h-8",
                "shrink-0 border-2 shadow-sm",
                borderClass
            )}>
                <AvatarImage src={getImageUrl(comment.user?.profile_image)} />
                <AvatarFallback className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500">
                    {initials}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className={cn(
                    "relative",
                    variant === "bubble" ? "space-y-1" : "bg-slate-50 dark:bg-zinc-900 p-3 rounded-2xl rounded-tl-none"
                )}>
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-foreground truncate">
                            {comment.user?.username}
                        </span>

                        {(canEdit || canDelete) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32 z-[110]">
                                    {canEdit && (
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                    )}
                                    {canDelete && (
                                        <DropdownMenuItem
                                            onClick={() => setIsDeleteDialogOpen(true)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <p className={cn(
                        "text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words",
                        variant === "bubble" ? "" : "text-xs"
                    )}>
                        {comment.content}
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-1 ml-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                        {new Date(comment.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                    <button className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-bold uppercase">Reply</button>
                </div>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="z-[200]">
                    <DialogHeader>
                        <DialogTitle>Delete Comment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
