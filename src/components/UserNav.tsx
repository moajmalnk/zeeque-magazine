import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { FileText, LogOut, User } from "lucide-react";

export function UserNav() {
    const { email, logout } = useAuth();
    const initials = email?.substring(0, 2).toUpperCase() || "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`} alt={email || "User"} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Account</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link to="/editorial/dashboard" className="cursor-pointer w-full group">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mr-2 group-hover:bg-primary/20 transition-colors">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span>Editorial Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link to="/editorial/profile" className="cursor-pointer w-full group">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted mr-2 group-hover:bg-muted/80 transition-colors">
                                <User className="h-4 w-4" />
                            </div>
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
