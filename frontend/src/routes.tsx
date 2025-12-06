import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdShoppingCart,
  MdInventory,
  MdBarChart,
  MdPerson,
} from 'react-icons/md';

// Import actual pages
import ProductsListPage from './views/admin/products/ProductsListPage';
import ReportsPage from './views/admin/reports/ReportsPage';

// Placeholder components - will be created later
const Sales = () => <div>Sales</div>;
const Profile = () => <div>Profile</div>;

export interface RouteType {
  name: string;
  layout: string;
  path: string;
  icon: React.ReactElement;
  component: React.ComponentType | React.LazyExoticComponent<React.ComponentType>;
  secondary?: boolean;
  collapse?: boolean;
  category?: string;
  items?: RouteType[];
}

const routes: RouteType[] = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: null as any, // Will be set in AdminLayout
  },
  {
    name: 'Products',
    layout: '/admin',
    path: '/products',
    icon: <Icon as={MdInventory} width="20px" height="20px" color="inherit" />,
    component: null as any, // Defined manually in AdminLayout to avoid duplicate routes
  },
  {
    name: 'Sales',
    layout: '/admin',
    path: '/sales',
    icon: <Icon as={MdShoppingCart} width="20px" height="20px" color="inherit" />,
    component: Sales,
  },
  {
    name: 'Reports',
    layout: '/admin',
    path: '/reports',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: ReportsPage,
  },
  {
    name: 'Profile',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Profile,
  },
];

export default routes;

