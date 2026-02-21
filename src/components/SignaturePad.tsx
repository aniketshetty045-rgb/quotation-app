import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  initialValue?: string;
  onSave: (dataUrl: string) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ initialValue, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && initialValue) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0);
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      onSave('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onSave(dataUrl);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
             ctx?.clearRect(0, 0, canvas.width, canvas.height);
             // Maintain aspect ratio or fill canvas
             ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-white border-2 border-slate-100 rounded-3xl overflow-hidden aspect-[16/9] shadow-inner">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          onTouchStart={(e) => { e.preventDefault(); startDrawing(e); }}
          onTouchEnd={(e) => { e.preventDefault(); stopDrawing(); }}
          onTouchMove={(e) => { e.preventDefault(); draw(e); }}
        />
        
        <label
          className="absolute top-4 left-4 bg-slate-900 text-white px-4 py-2 text-[10px] font-black rounded-full shadow-lg active:scale-95 transition-all uppercase tracking-widest cursor-pointer"
        >
          UPLOAD
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        </label>

        <button
          type="button"
          onClick={clear}
          className="absolute top-4 right-4 bg-slate-900 text-white px-4 py-2 text-[10px] font-black rounded-full shadow-lg active:scale-95 transition-all uppercase tracking-widest"
        >
          CLEAR
        </button>
      </div>
    </div>
  );
};
