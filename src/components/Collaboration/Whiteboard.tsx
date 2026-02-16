"use client";
import React, { useEffect, useCallback } from "react";
import { Tldraw, useEditor } from "tldraw";
import "tldraw/tldraw.css";
import socketService from "@/services/socketService";

interface WhiteboardProps {
    roomId: string;
}

// Wrapper to access tldraw editor hooks
const WhiteboardLogic = ({ roomId }: WhiteboardProps) => {
    const editor = useEditor();

    useEffect(() => {
        if (!editor) return;

        // Listen for remote updates
        const handleRemoteUpdate = (data: any) => {
            if (data.snapshot) {
                editor.loadSnapshot(data.snapshot);
            }
        };

        socketService.on("drawing_update", handleRemoteUpdate);

        // Listen for local changes
        const cleanupListener = editor.store.listen((entry) => {
            // Creates a full snapshot for every change (Naive approach, optimize later with diffs)
            // 'entry' contains changes, but for simplicity we send snapshot
            // Throttle this in production!
            if (entry.source === 'user') {
                const snapshot = editor.getSnapshot();
                socketService.emit("drawing_update", {
                    roomId,
                    snapshot
                });
            }
        });

        return () => {
            socketService.off("drawing_update");
            cleanupListener();
        };
    }, [editor, roomId]);

    return null; // Logic only
};

const Whiteboard: React.FC<WhiteboardProps> = ({ roomId }) => {
    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Tldraw persistenceKey={`room-${roomId}`}>
                <WhiteboardLogic roomId={roomId} />
            </Tldraw>
        </div>
    );
};

export default Whiteboard;
