"use client";

import React from "react";
import { useState } from "react";

const SomeComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4">
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(prev => prev + 1)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Increment
      </button>
    </div>
  );
};

export default SomeComponent;