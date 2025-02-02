// src/HighlightExample.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
    Viewer,
    PdfJs,
    DocumentLoadEvent,
    Button,
    PrimaryButton,
    Tooltip,
    Position,
} from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import {
    highlightPlugin,
    MessageIcon,
    RenderHighlightContentProps,
    RenderHighlightTargetProps,
    RenderHighlightsProps,
    HighlightArea,
} from '@react-pdf-viewer/highlight';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';

interface Note {
    id: number;
    content: string;
    highlightAreas: HighlightArea[];
    quote: string;
}

interface HighlightExampleProps {
    fileUrl: string;
}

const HighlightExample: React.FC<HighlightExampleProps> = ({ fileUrl }) => {
    const [message, setMessage] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);
    const notesContainerRef = useRef<HTMLDivElement | null>(null);
    const noteIdRef = useRef(0);

    const noteEles = useRef(new Map<number, HTMLElement>()).current;
    const [currentDoc, setCurrentDoc] = useState<PdfJs.PdfDocument | null>(null);

    const handleDocumentLoad = (e: DocumentLoadEvent) => {
        setCurrentDoc(e.doc);
        // Clear notes when a new document is loaded
        setNotes([]);
    };

    const renderHighlightTarget = (props: RenderHighlightTargetProps) => (
        <div
            style={{
                background: '#eee',
                display: 'flex',
                position: 'absolute',
                left: `${props.selectionRegion.left}%`,
                top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
                transform: 'translate(0, 8px)',
                zIndex: 1,
            }}
        >
            <Tooltip
                position={Position.TopCenter}
                target={
                    <Button onClick={props.toggle}>
                        <MessageIcon />
                    </Button>
                }
                content={() => <div style={{ width: '100px' }}>Add a note</div>}
                offset={{ left: 0, top: -8 }}
            />
        </div>
    );

    const renderHighlightContent = (props: RenderHighlightContentProps) => {
        const addNote = () => {
            if (message !== '') {
                noteIdRef.current += 1;
                const note: Note = {
                    id: noteIdRef.current,
                    content: message,
                    highlightAreas: props.highlightAreas,
                    quote: props.selectedText,
                };
                setNotes((prevNotes) => [...prevNotes, note]);
                setMessage('');
                props.cancel();
            }
        };

        return (
            <div
                style={{
                    background: '#fff',
                    border: '1px solid rgba(0, 0, 0, .3)',
                    borderRadius: '2px',
                    padding: '8px',
                    position: 'absolute',
                    left: `${props.selectionRegion.left}%`,
                    top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
                    zIndex: 1,
                }}
            >
                <div>
                    <textarea
                        rows={3}
                        style={{
                            border: '1px solid rgba(0, 0, 0, .3)',
                            width: '100%',
                        }}
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                    ></textarea>
                </div>
                <div
                    style={{
                        display: 'flex',
                        marginTop: '8px',
                    }}
                >
                    <div style={{ marginRight: '8px' }}>
                        <PrimaryButton onClick={addNote}>Add</PrimaryButton>
                    </div>
                    <Button onClick={props.cancel}>Cancel</Button>
                </div>
            </div>
        );
    };

    const jumpToNote = (note: Note) => {
        activateTab(3); // Adjust the tab index if necessary
        const notesContainer = notesContainerRef.current;
        const noteElement = noteEles.get(note.id);
        if (noteElement && notesContainer) {
            notesContainer.scrollTop = noteElement.offsetTop;
        }
    };

    const renderHighlights = (props: RenderHighlightsProps) => (
        <div>
            {notes.map((note) => (
                <React.Fragment key={note.id}>
                    {note.highlightAreas
                        .filter((area) => area.pageIndex === props.pageIndex)
                        .map((area, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: 'yellow',
                                    opacity: 0.4,
                                    position: 'absolute',
                                    left: `${area.left}%`,
                                    top: `${area.top}%`,
                                    width: `${area.width}%`,
                                    height: `${area.height}%`,
                                    cursor: 'pointer',
                                }}
                                onClick={() => jumpToNote(note)}
                            />
                        ))}
                </React.Fragment>
            ))}
        </div>
    );

    const highlightPluginInstance = highlightPlugin({
        renderHighlightTarget,
        renderHighlightContent,
        renderHighlights,
    });

    const { jumpToHighlightArea } = highlightPluginInstance;

    useEffect(() => {
        return () => {
            noteEles.clear();
        };
    }, [noteEles]);

    const sidebarNotes = (
        <div
            ref={notesContainerRef}
            style={{
                overflow: 'auto',
                width: '100%',
            }}
        >
            {notes.length === 0 && (
                <div style={{ textAlign: 'center' }}>There is no note</div>
            )}
            {notes.map((note) => {
                return (
                    <div
                        key={note.id}
                        style={{
                            borderBottom: '1px solid rgba(0, 0, 0, .3)',
                            cursor: 'pointer',
                            padding: '8px',
                        }}
                        onClick={() => jumpToHighlightArea(note.highlightAreas[0])}
                        ref={(ref): void => {
                            if (ref) {
                                noteEles.set(note.id, ref);
                            }
                        }}
                    >
                        <blockquote
                            style={{
                                borderLeft: '2px solid rgba(0, 0, 0, 0.2)',
                                fontSize: '.75rem',
                                lineHeight: 1.5,
                                margin: '0 0 8px 0',
                                paddingLeft: '8px',
                                textAlign: 'justify',
                            }}
                        >
                            {note.quote}
                        </blockquote>
                        {note.content}
                    </div>
                );
            })}
        </div>
    );

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) =>
            defaultTabs.concat({
                //id: 'notes',
                content: sidebarNotes,
                icon: <MessageIcon />,
                title: 'Notes',
            }),
    });

    const { activateTab } = defaultLayoutPluginInstance;

    return (
        <Viewer
            fileUrl={fileUrl}
            plugins={[highlightPluginInstance, defaultLayoutPluginInstance]}
            onDocumentLoad={handleDocumentLoad}
        />
    );
};

export default HighlightExample;
