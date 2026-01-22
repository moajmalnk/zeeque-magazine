import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { categoryIcons, categoryLabels } from "@/types/post";
import React from "react";
import { BookOpen, HelpCircle } from "lucide-react";

export function MainNav() {
    return (
        <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Read
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                                <NavigationMenuLink asChild>
                                    <Link
                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                                        to="/"
                                    >
                                        <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                                        <BookOpen className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                                        <div className="mb-2 mt-4 text-lg font-medium">
                                            All Creations
                                        </div>
                                        <p className="text-sm leading-tight text-muted-foreground group-hover:text-foreground transition-colors">
                                            Explore the latest stories, poems, and art from our community.
                                        </p>
                                    </Link>
                                </NavigationMenuLink>
                            </li>
                            <ListItem href="/?category=stories" title="Stories" icon={categoryIcons.stories}>
                                Imaginative tales and adventures.
                            </ListItem>
                            <ListItem href="/?category=poems" title="Poems" icon={categoryIcons.poems}>
                                Rhythmic verses and expressions.
                            </ListItem>
                            <ListItem href="/?category=drawings" title="Drawings" icon={categoryIcons.drawings}>
                                Visual art and sketches.
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <Link to="/guidelines">
                        <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 cursor-pointer")}>
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Guidelines
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, href, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    to={href || "/"}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group",
                        className
                    )}
                    {...props}
                >
                    <div className="flex items-center gap-2 text-sm font-medium leading-none group-hover:text-primary transition-colors">
                        {icon && <span className="text-base group-hover:scale-110 transition-transform">{icon}</span>}
                        {title}
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground group-hover:text-muted-foreground/80">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";
