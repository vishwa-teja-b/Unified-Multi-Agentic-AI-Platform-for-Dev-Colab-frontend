import { io, Socket } from "socket.io-client";

class SocketService {
    public socket: Socket | null = null;

    connect(url: string): Socket {
        if (this.socket) {
            return this.socket;
        }

        this.socket = io(url, {
            path: "/socket.io/",
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ["websocket"], // Force WebSocket
        });

        this.socket.on("connect", () => {
            console.log("✅ WebSocket Connected:", this.socket?.id);
        });

        this.socket.on("disconnect", (reason) => {
            console.log("❌ WebSocket Disconnected:", reason);
        });

        this.socket.on("connect_error", (err) => {
            console.error("⚠️ WebSocket Connection Error:", err);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // --- File Management ---
    createFile(roomId: string, fileName: string, language: string) {
        if (this.socket) {
            this.socket.emit("file_created", { roomId, fileName, language });
        }
    }

    deleteFile(roomId: string, fileId: string) {
        if (this.socket) {
            this.socket.emit("file_deleted", { roomId, fileId });
        }
    }

    emitFileChange(roomId: string, fileId: string, newContent: string) {
        if (this.socket) {
            this.socket.emit("file_updated", { roomId, fileId, newContent });
        }
    }

    // --- Execution ---
    async executeCode(language: string, content: string, version: string = "*") {
        // We use HTTP for execution to avoid blocking the socket with heavy tasks
        // and to keep execution stateless.
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/execution`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language,
                    version,
                    files: [{ name: 'main', content }]
                })
            });
            return await response.json();
        } catch (error) {
            console.error("Execution failed:", error);
            return { run: { output: "Error executing code" } };
        }
    }

    joinRoom(roomId: string, username: string, userId: string) {
        if (!this.socket) return;
        this.socket.emit("join_request", { roomId, username, userId });
    }

    // Generic Emit
    emit(event: string, data: any) {
        if (!this.socket) return;
        this.socket.emit(event, data);
    }

    // Generic Listen
    on(event: string, callback: (data: any) => void) {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    // Generic Off
    off(event: string, callback?: (...args: any[]) => void) {
        if (!this.socket) return;
        if (callback) {
            this.socket.off(event, callback);
        } else {
            this.socket.off(event);
        }
    }
}

const socketService = new SocketService();
export default socketService;
