export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  isActive?: boolean;
  badge?: string;
  badgeColor?: string;
}
