"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  maxSize = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  className = ""
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback((file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use JPEG, PNG, or WebP.`;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB.`;
    }

    return null;
  }, [acceptedTypes, maxSize]);

  const handleFiles = useCallback(async (files: FileList) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];
    const filesToProcess = Array.from(files).slice(0, maxImages - images.length);

    // Validate files first
    for (const file of filesToProcess) {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);

    // Compress and add valid files
    try {
      const compressedFiles = await Promise.all(
        validFiles.map(file => compressImage(file))
      );

      onImagesChange([...images, ...compressedFiles]);
    } catch (error) {
      console.error("Error processing images:", error);
      setErrors(["Error processing images. Please try again."]);
    }
  }, [images, maxImages, validateFile, compressImage, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-red-500 bg-red-500/10"
            : "border-gray-700 hover:border-gray-600"
        } ${images.length >= maxImages ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={images.length < maxImages ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        
        <div className="flex flex-col items-center">
          <Upload className={`h-12 w-12 mb-4 ${
            isDragging ? "text-red-500" : "text-gray-400"
          }`} />
          
          <div className="text-white font-medium mb-2">
            {images.length >= maxImages
              ? `Maximum ${maxImages} images reached`
              : isDragging
              ? "Drop images here"
              : "Click to upload or drag and drop"
            }
          </div>
          
          <div className="text-gray-400 text-sm">
            {acceptedTypes.map(type => type.split("/")[1].toUpperCase()).join(", ")} up to {maxSize}MB each
          </div>
          
          <div className="text-gray-500 text-xs mt-2">
            {images.length}/{maxImages} images uploaded
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-red-500 font-medium mb-1">Upload Errors</h4>
              <ul className="text-red-400 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Uploaded Images</h4>
            <Badge variant="secondary" className="bg-gray-700 text-white">
              {images.length} image{images.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
                
                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-xs truncate">
                    {image.name}
                  </div>
                  <div className="text-gray-300 text-xs">
                    {(image.size / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Upload Tips</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Upload clear screenshots of your account stats, rank, and items</li>
          <li>• Include proof of ownership (account settings, purchase history)</li>
          <li>• Show rare items, skins, or achievements prominently</li>
          <li>• Images are automatically compressed for faster loading</li>
        </ul>
      </div>
    </div>
  );
}
