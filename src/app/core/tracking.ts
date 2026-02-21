import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class Tracking {

  private socket!: Socket;

  connect(token: string) {

    if (this.socket && this.socket.connected) {
      console.log('Socket ya conectado');
      return;
    }

    this.socket = io('http://localhost:3000', {
      auth: { token },
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectado al websocket');
    });

    this.socket.on('disconnect', () => {
      console.log('⚠️ Socket desconectado');
    });
  }


  joinUnit(unitId: string) {
    if (this.socket) {
      console.log(`🚪 Uniendo a la unidad ${unitId}`);
      this.socket.emit('joinUnit', unitId);
    }
  }

  onLocation(callback: any) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.off('receiveLocation');
    this.socket.on('receiveLocation', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 Desconectado del websocket');
    }
  }
}
