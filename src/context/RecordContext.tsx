'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type SavedRecord = {
    id: string;
    employeeId: string;
    employeeName: string;
    fileName: string;
    projectName: string;
    createdAt: string; // Storing as ISO string in localStorage
    data: any; // Can be more specific if needed
};

type RecordContextType = {
  records: SavedRecord[];
  addRecord: (record: Omit<SavedRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, updatedData: Partial<SavedRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordById: (id: string) => SavedRecord | undefined;
  isLoading: boolean;
  error: string | null;
};

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export const RecordProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
        const savedRecords = localStorage.getItem('savedRecords');
        if (savedRecords) {
            const parsedRecords = JSON.parse(savedRecords) as SavedRecord[];
            setRecords(parsedRecords);
        }
    } catch (e) {
        console.error("Failed to load records from localStorage", e);
        setError("Could not load saved records.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) { // Only save when not initially loading
        try {
            localStorage.setItem('savedRecords', JSON.stringify(records));
        } catch (e) {
            console.error("Failed to save records to localStorage", e);
            setError("Could not save records.");
        }
    }
  }, [records, isLoading]);

  const addRecord = (recordData: Omit<SavedRecord, 'id' | 'createdAt'>) => {
    const newRecord: SavedRecord = {
        ...recordData,
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
    };
    setRecords(prev => [newRecord, ...prev]);
    toast({ title: "Record Saved", description: `"${recordData.projectName}" has been saved.` });
  };

  const updateRecord = (id: string, updatedData: Partial<SavedRecord>) => {
    setRecords(prev => prev.map(rec => rec.id === id ? { ...rec, ...updatedData } : rec));
    toast({ title: "Record Updated", description: "The record has been successfully updated." });
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(rec => rec.id !== id));
    toast({ title: "Record Deleted", description: "The record has been removed." });
  };
  
  const getRecordById = (id: string) => {
    return records.find(rec => rec.id === id);
  };

  return (
    <RecordContext.Provider value={{ records, addRecord, updateRecord, deleteRecord, getRecordById, isLoading, error }}>
      {children}
    </RecordContext.Provider>
  );
};

export const useRecords = () => {
  const context = useContext(RecordContext);
  if (context === undefined) {
    throw new Error('useRecords must be used within a RecordProvider');
  }
  return context;
};
