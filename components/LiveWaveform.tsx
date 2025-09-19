import React, { useRef, useEffect } from 'react';

interface LiveWaveformProps {
  analyserNode: AnalyserNode | null;
  isPaused?: boolean;
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({ analyserNode, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get computed styles for colors to use in canvas
    const computedStyle = getComputedStyle(canvas);
    const bgColor = computedStyle.getPropertyValue('--theme-card-bg').trim() || '#1F2937';
    const waveColor = computedStyle.getPropertyValue('--theme-green').trim() || '#34D399';
    
    // Set canvas size for high-DPI displays
    const parent = canvas.parentElement;
    if (parent) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
        ctx.scale(dpr, dpr);
    }
    
    analyserNode.fftSize = 2048;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      
      const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
      
      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = waveColor;
      ctx.beginPath();
      
      if (isPaused) {
         // Draw a static flat line when paused
        ctx.moveTo(0, canvasHeight / 2);
        ctx.lineTo(canvasWidth, canvasHeight / 2);
        ctx.stroke();
        return;
      }
      
      // Use time domain data for a classic oscilloscope look
      analyserNode.getByteTimeDomainData(dataArray);

      const sliceWidth = canvasWidth / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // dataArray values are 0-255. 128 is the zero-crossing.
        const v = dataArray[i] / 128.0; // Normalize to a 0-2 range.
        const y = v * canvasHeight / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvasWidth, canvasHeight / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyserNode, isPaused]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};
