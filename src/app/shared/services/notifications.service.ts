import { Injectable, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { appsettings } from '../../settings/appsettings';
import { AuthService } from './auth.service';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);

  private socket: Socket | null = null;
  private _notification$ = new Subject<AppNotification>();

  /** Emits every time a new notification arrives from the server */
  readonly notification$ = this._notification$.asObservable();

  connect(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.socket?.connected) return;

    const token = this.auth.getAccessToken();
    if (!token) return;

    this.socket = io(`${appsettings.wsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    this.socket.on('notification', (data: AppNotification) => {
      this._notification$.next(data);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
