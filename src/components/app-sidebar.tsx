import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Users, Drumstick, PiggyBank, Bird, Wheat, ShoppingCart, Receipt,
  Coins, Pill, UserCog, Camera, Truck, LogOut, UserCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";

const mainItems = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mon profil", url: "/profile", icon: UserCircle },
];

const opsItems = [
  { title: "Employés", url: "/employees", icon: Users },
  { title: "Réception", url: "/receptions", icon: Truck },
  { title: "Production", url: "/productions", icon: Drumstick },
  { title: "Provenderie", url: "/feed-mill", icon: Wheat },
  { title: "Médicaments", url: "/medicines", icon: Pill },
];

const bizItems = [
  { title: "Clients", url: "/clients", icon: PiggyBank },
  { title: "Ventes", url: "/sales", icon: ShoppingCart },
  { title: "Achats", url: "/purchases", icon: Receipt },
  { title: "Dépenses", url: "/expenses", icon: Coins },
];

const sysItems = [
  { title: "Vidéosurveillance", url: "/surveillance", icon: Camera },
];

const adminItems = [{ title: "Utilisateurs & Rôles", url: "/users", icon: UserCog }];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin } = useCurrentUser();
  const navigate = useNavigate();

  const isActive = (url: string) => path === url;

  const renderGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((it) => (
            <SidebarMenuItem key={it.url}>
              <SidebarMenuButton asChild isActive={isActive(it.url)}>
                <Link to={it.url} className="flex items-center gap-2">
                  <it.icon className="h-4 w-4" />
                  {!collapsed && <span>{it.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 p-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">SF</div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-sidebar-foreground">Suiss Ferme</div>
              <div className="text-[10px] text-sidebar-foreground/70">Cameroun</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Général", mainItems)}
        {renderGroup("Opérations", opsItems)}
        {renderGroup("Commercial", bizItems)}
        {renderGroup("Système", sysItems)}
        {isAdmin && renderGroup("Administration", adminItems)}
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && user && (
          <div className="px-2 pb-2 text-xs text-sidebar-foreground/80 truncate">{user.email}</div>
        )}
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-start text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" />{!collapsed && <span className="ml-2">Se déconnecter</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}