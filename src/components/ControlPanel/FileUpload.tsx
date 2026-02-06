import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
}

const ACCEPTED_FORMATS = '.fbx,.obj,.mtl,.gltf,.glb,.png,.jpg,.jpeg,.tga,.bmp';

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_FORMATS}
        className="hidden"
        onChange={handleChange}
      />
      <Button
        onClick={handleClick}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        Browse files
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        <strong>.fbx</strong>, <strong>.obj + .mtl</strong>, <strong>.gltf/.glb</strong>
      </p>
    </div>
  );
}
