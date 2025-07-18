import { User } from '../../pages/auth/login/login.model';
import { SidebarItem } from '../../common/components/sidebar/sidebar.model';

export interface DashboardState {
  sidebarCollapsed: boolean;
  currentUser: User | null;
  currentRoute: string;
  sidebarItems: SidebarItem[];
}
