import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class Tracking {

  private socket!: Socket;

  connect(deviceId: string) {
    this.socket = io('http://localhost:3000', {
      auth: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NzU3YWZkMC05NDI1LTQwOTAtOTE4MC1lMzgyOGYxYTM4NjEiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3MTM0NjQ2OCwiZXhwIjoxNzcxNDMyODY4fQ.PaZ12i_lu0VmjKnFOtKxKuWovCEjhd1Z5bAfC0MQpLY',
      },
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectado al websocket');

      // 👇 unirse al room del dispositivo
      this.socket.emit('joinDevice', deviceId);
    });
  }

  onLocation(callback: (data: any) => void) {
    this.socket.on('receiveLocation', callback);
  }
}
