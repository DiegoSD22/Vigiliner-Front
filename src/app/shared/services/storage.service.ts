import { Injectable } from '@angular/core';

/**
 * Abstracción de almacenamiento seguro
 * Facilita cambios entre localStorage, sessionStorage, etc.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly PREFIX = 'vigiliner_';

  set(key: string, value: string | Record<string, unknown> | unknown[]): void {
    const prefixedKey = this.PREFIX + key;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(prefixedKey, serialized);
  }

  get(key: string): string | null {
    const prefixedKey = this.PREFIX + key;
    return localStorage.getItem(prefixedKey);
  }

  getObject<T>(key: string): T | null {
    const value = this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    const prefixedKey = this.PREFIX + key;
    localStorage.removeItem(prefixedKey);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}
