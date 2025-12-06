import { createContext } from 'react';

interface SidebarContextType {
  toggleSidebar: boolean;
  setToggleSidebar: (value: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  toggleSidebar: false,
  setToggleSidebar: () => {},
});

