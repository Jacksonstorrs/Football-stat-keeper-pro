"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

interface YardageInputProps {
  value: string;
  onChange: (val: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const YardageInput: React.FC<YardageInputProps> = ({ value, onChange, onConfirm, onCancel }) => {
  const handleKey = (key: string) => {
    if (key === 'C') {
      onChange('');
    } else if (key === '-') {
      if (value.startsWith('-')) {
        onChange(value.substring(1));
      } else {
        onChange('-' + value);
      }
    } else {
      if (value.length < 3) {
        onChange(value + key);
      }
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', 'C'];

  return (
    <div className="bg-slate-900 p-4 rounded-xl shadow-2xl border border-slate-700 w-full max-w-xs mx-auto animate-in fade-in zoom-in duration-200">
      <div className="flex justify-between items-center mb-4">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Enter Yards</span>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="bg-black/40 rounded-lg p-4 mb-4 text-center border border-white/10">
        <span className="text-4xl font-black text-white tabular-nums">
          {value || '0'}
          <span className="text-sm font-normal text-slate-500 ml-1">YDS</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <Button
            key={key}
            variant="secondary"
            className="h-14 text-xl font-bold bg-slate-800 hover:bg-slate-700 text-white border-none"
            onClick={() => handleKey(key)}
          >
            {key}
          </Button>
        ))}
      </div>

      <Button 
        className="w-full mt-4 h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
        onClick={onConfirm}
      >
        <Check className="w-5 h-5" />
        Confirm Play
      </Button>
    </div>
  );
};

export default YardageInput;