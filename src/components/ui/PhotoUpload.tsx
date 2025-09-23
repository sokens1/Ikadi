import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Camera, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoUploadProps {
  onFileSelect: (file: File | null) => void;
  currentFile?: File | null;
  currentUrl?: string;
  className?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onFileSelect,
  currentFile,
  currentUrl,
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide');
      return;
    }

    // Validation de la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille du fichier ne doit pas dépasser 5MB');
      return;
    }

    // Créer la preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Photo du votant
      </label>
      
      <Card className={`border-2 border-dashed transition-colors ${
        dragActive 
          ? 'border-blue-400 bg-blue-50' 
          : preview 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
      }`}>
        <CardContent className="p-6">
          {preview ? (
            // Aperçu de l'image
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-white shadow-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeFile}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Photo sélectionnée</span>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openFileDialog}
                  className="flex-1"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Changer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          ) : (
            // Zone de drop/upload
            <div
              className="text-center cursor-pointer"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {dragActive ? (
                    <Upload className="h-8 w-8 text-blue-500" />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {dragActive ? 'Déposez votre photo ici' : 'Ajouter une photo'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Glissez-déposez une image ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF jusqu'à 5MB
                  </p>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="mx-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir un fichier
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      
      {preview && (
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <AlertCircle className="h-3 w-3" />
          <span>L'image sera automatiquement redimensionnée et optimisée</span>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;




