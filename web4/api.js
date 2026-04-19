class WindAPI {
    constructor(onDataReceived, onStatusChanged) {
        this.onDataReceived = onDataReceived;
        this.onStatusChanged = onStatusChanged;
    }

    connect() {
        this.socket = new WebSocket('ws://localhost:8080');
        
        this.socket.onopen = () => this.onStatusChanged('Онлайн', 'status-online');
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.onDataReceived(data);
        };

        this.socket.onclose = () => {
            this.onStatusChanged('Офлайн', 'status-offline');
            setTimeout(() => this.connect(), 5000);
        };
    }
}