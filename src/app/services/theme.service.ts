import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    this.initializeTheme();
  }

  initializeTheme() {
    const userPrefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme =
      localStorage.getItem('theme') || (userPrefersDark ? 'dark' : 'light');
    this.setTheme(currentTheme);
  }

  setTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    const currentTheme =
      localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
    this.setTheme(currentTheme);
  }
}
