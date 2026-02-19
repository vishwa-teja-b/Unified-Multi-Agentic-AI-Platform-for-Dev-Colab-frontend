"use client";
import React, { useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from "react";
import { Tldraw, useEditor } from "tldraw";
import "tldraw/tldraw.css";
import socketService from "@/services/socketService";

export interface WhiteboardRef {
    getSnapshot: () => any | null;
}

interface WhiteboardProps {
    roomId: string;
    savedSnapshot?: any;
}

// Wrapper to access tldraw editor hooks
const WhiteboardLogic = forwardRef<WhiteboardRef, WhiteboardProps>(({ roomId, savedSnapshot }, ref) => {
    const editor = useEditor();
    const hasLoadedSaved = useRef(false);

    // Expose getSnapshot to parent
    useImperativeHandle(ref, () => ({
        getSnapshot: () => {
            if (!editor) return null;
            return editor.getSnapshot();
        },
    }), [editor]);

    useEffect(() => {
        if (!editor) return;

        // Load saved snapshot on first mount (only once)
        if (savedSnapshot && !hasLoadedSaved.current) {
            try {
                editor.loadSnapshot(savedSnapshot);
                hasLoadedSaved.current = true;
            } catch (err) {
                console.warn("Failed to load saved whiteboard snapshot", err);
            }
        }

        // Listen for remote updates
        const handleRemoteUpdate = (data: any) => {
            if (data.changes) {
                try {
                    editor.store.mergeRemoteChanges(() => {
                        const { added, updated, removed } = data.changes;

                        // Handle added records
                        if (added) {
                            for (const record of Object.values(added)) {
                                editor.store.put([record as any]);
                            }
                        }

                        // Handle updated records
                        if (updated) {
                            for (const [_, to] of Object.values(updated) as any) {
                                editor.store.put([to]);
                            }
                        }

                        // Handle removed records
                        if (removed) {
                            for (const record of Object.values(removed) as any) {
                                editor.store.remove([record.id]);
                            }
                        }
                    });
                } catch (e) {
                    console.error("Error merging remote changes", e);
                }
            } else if (data.snapshot) {
                try {
                    editor.loadSnapshot(data.snapshot);
                } catch (e) {
                    console.error("Error loading snapshot", e);
                }
            }
        };

        socketService.on("drawing_update", handleRemoteUpdate);

        // Listen for local changes
        const cleanupListener = editor.store.listen((entry) => {
            if (entry.source === 'user') {
                const { changes } = entry;
                // Broadcast changes (deltas) instead of full snapshot
                socketService.emit("drawing_update", {
                    roomId,
                    changes
                });
            }
        });

        return () => {
            socketService.off("drawing_update");
            cleanupListener();
        };
    }, [editor, roomId, savedSnapshot]);

    return null; // Logic only
});

WhiteboardLogic.displayName = "WhiteboardLogic";

const Whiteboard = forwardRef<WhiteboardRef, WhiteboardProps>(({ roomId, savedSnapshot }, ref) => {
    const logicRef = useRef<WhiteboardRef>(null);

    // Forward the ref from WhiteboardLogic up
    useImperativeHandle(ref, () => ({
        getSnapshot: () => logicRef.current?.getSnapshot() ?? null,
    }), []);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Tldraw persistenceKey={`room-${roomId}`}>
                <WhiteboardLogic ref={logicRef} roomId={roomId} savedSnapshot={savedSnapshot} />
            </Tldraw>
        </div>
    );
});

Whiteboard.displayName = "Whiteboard";

export default Whiteboard;
