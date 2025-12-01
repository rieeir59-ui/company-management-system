'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UploadedFile = {
    id: string;
    category: string;
    bankName?: string;
    customName: string;
    originalName: string;
    fileType: string;
    size: number;
    createdAt: Date;
    employeeName: string;
    employeeId: string;
    fileUrl?: string; // This will be a blob URL for local preview
};

type FileContextType = {
  fileRecords: UploadedFile[];
  addFileRecord: (record: UploadedFile) => void;
  updateFileRecord: (id: string, updatedData: Partial<UploadedFile>) => void;
  deleteFileRecord: (id: string) => void;
  isLoading: boolean;
  error: string | null;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [fileRecords, setFileRecords] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on client-side mount
    try {
        const savedFiles = localStorage.getItem('fileRecords');
        if (savedFiles) {
            const parsedFiles = JSON.parse(savedFiles).map((f: any) => ({...f, createdAt: new Date(f.createdAt)}));
            setFileRecords(parsedFiles);
        }
    } catch (e) {
        console.error("Failed to load files from localStorage", e);
        setError("Could not load saved file records.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Save to localStorage whenever fileRecords change
    try {
        localStorage.setItem('fileRecords', JSON.stringify(fileRecords));
    } catch (e) {
        console.error("Failed to save files to localStorage", e);
        setError("Could not save file records.");
    }
  }, [fileRecords]);

  const addFileRecord = (record: UploadedFile) => {
    setFileRecords(prev => [record, ...prev]);
  };

  const updateFileRecord = (id: string, updatedData: Partial<UploadedFile>) => {
    setFileRecords(prev => prev.map(rec => rec.id === id ? { ...rec, ...updatedData } : rec));
  };

  const deleteFileRecord = (id: string) => {
    setFileRecords(prev => prev.filter(rec => rec.id !== id));
  };

  return (
    <FileContext.Provider value={{ fileRecords, addFileRecord, updateFileRecord, deleteFileRecord, isLoading, error }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileRecords = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileRecords must be used within a FileProvider');
  }
  return context;
};
