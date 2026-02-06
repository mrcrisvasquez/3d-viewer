import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFilesDropped: (files: FileList) => void;
  children: React.ReactNode;
}

export function DropZone({ onFilesDropped, children }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide if leaving the window
    if (e.relatedTarget === null) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      onFilesDropped(e.dataTransfer.files);
    }
  }, [onFilesDropped]);

  return (
    <div
      className="relative w-full h-full"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      
      {/* Drop overlay */}
      <div
        className={cn(
          "fixed inset-0 pointer-events-none flex items-center justify-center z-50",
          "border-4 border-dashed transition-all duration-300",
          isDragging ? "drop-zone-active" : "border-transparent"
        )}
      >
        <div
          className={cn(
            "text-foreground text-2xl font-semibold px-8 py-4 rounded-2xl",
            "bg-secondary/90 backdrop-blur-sm transition-opacity duration-300",
            isDragging ? "opacity-100" : "opacity-0"
          )}
        >
          📁 Drop files here
        </div>
      </div>
    </div>
  );
}
