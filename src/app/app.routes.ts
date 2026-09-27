import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/player-layout/player-layout').then(m => m.PlayerLayout),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', loadComponent: () => import('./features/dashboard/overview/overview').then(m => m.Overview) },
      { path: 'daily-quests', loadComponent: () => import('./features/dashboard/daily-quests/daily-quests').then(m => m.DailyQuests) },
      { path: 'quest-board', loadComponent: () => import('./features/dashboard/quest-board/quest-board').then(m => m.QuestBoard) },
      { path: 'stat-allocation', loadComponent: () => import('./features/dashboard/stat-allocation/stat-allocation').then(m => m.StatAllocation) },
      { path: 'achievements', loadComponent: () => import('./features/dashboard/achievements/achievements').then(m => m.Achievements) },
      { path: 'shop', loadComponent: () => import('./features/dashboard/shop/shop').then(m => m.Shop) },
      { path: 'history', loadComponent: () => import('./features/dashboard/history/history').then(m => m.History) },
    ],
  },

  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'user-management', pathMatch: 'full' },
      { path: 'user-management', loadComponent: () => import('./features/admin/user-management/user-management').then(m => m.UserManagement) },
      { path: 'quest-management', loadComponent: () => import('./features/admin/quest-management/quest-management').then(m => m.QuestManagement) },
      { path: 'analytics', loadComponent: () => import('./features/admin/analytics/analytics').then(m => m.Analytics) },
      { path: 'announcements', loadComponent: () => import('./features/admin/announcements/announcements').then(m => m.Announcements) },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
