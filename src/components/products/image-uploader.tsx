"use client";

import { useRef, useState } from "react";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";

export type ImageAsset = {
  id: string; // uuid for new files, or the database ID for existing ones
  url: string; // object URL or absolute URL
  file?: File; // undefined if it is a pre-existing image fetched from the DB
  isExisting?: boolean; // flag to easily know if it's already in DB
};

export function ImageUploader({
  images,
  onChange,
}: {
  images: ImageAsset[];
  onChange: (newImages: ImageAsset[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      // reset the input so you can select the same file again if deleted
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const processFiles = (files: File[]) => {
    const newImages = files.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file), 
      file,
    }));
    onChange([...images, ...newImages]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    onChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-dashed rounded-[8px] flex flex-col items-center justify-center p-8 cursor-pointer transition-colors ${
          isDragging 
            ? "border-text-primary bg-bg-tertiary" 
            : "border-border-default hover:bg-bg-tertiary hover:border-text-hint"
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          multiple 
          accept="image/*" 
          className="hidden" 
        />
        <div className="h-10 w-10 rounded-full bg-bg-primary flex items-center justify-center border border-border-default shadow-sm mb-3">
          <IconUpload size={20} className="text-text-secondary" />
        </div>
        <p className="text-[13px] font-medium text-text-primary text-center">
          Click to upload <span className="font-normal text-text-muted">or drag and drop</span>
        </p>
        <p className="text-[11px] text-text-hint text-center mt-1">
          SVG, PNG, JPG or GIF (max. 800x400px)
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={img.id} className="relative group aspect-square rounded-[8px] border border-border-default overflow-hidden bg-bg-primary flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  type="button" 
                  onClick={(e) => removeImage(img.id, e)}
                  className="bg-bg-primary border border-border-default rounded-full p-1 text-text-secondary hover:text-[#A32D2D] shadow-sm"
                >
                  <IconX size={14} />
                </button>
              </div>

              {index === 0 && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-bg-primary border border-border-default rounded-[4px] px-2 py-1 flex items-center justify-center gap-1 shadow-sm">
                    <IconPhoto size={12} className="text-text-primary" />
                    <span className="text-[10px] font-medium text-text-primary uppercase">Primary</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}