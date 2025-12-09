"use client";

import {
  ComponentPropsWithoutRef,
  useEffect,
  useId,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface AnimatedGridPatternProps
  extends ComponentPropsWithoutRef<"svg"> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatdelay?: number; // custom prop, do not pass to DOM
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatdelay, // extracted to avoid DOM prop warnings
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // ------------------------------
  // POSITION GENERATOR (tuple-safe)
  // ------------------------------
  const getPos = useCallback(
    (): [number, number] => {
      return [
        Math.floor((Math.random() * dimensions.width) / width),
        Math.floor((Math.random() * dimensions.height) / height),
      ] as [number, number];
    },
    [dimensions.width, dimensions.height, width, height]
  );

  // ------------------------------
  // INITIAL STATE CREATION
  // ------------------------------
  const [squares, setSquares] = useState(() =>
    Array.from({ length: numSquares }).map((_, i) => ({
      id: i,
      pos: [0, 0] as [number, number],
    }))
  );

  // ------------------------------
  // SQUARE GENERATOR (stable)
  // ------------------------------
  const generateSquares = useCallback(
    (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        pos: getPos(),
      }));
    },
    [getPos]
  );

  // ------------------------------
  // SINGLE SQUARE UPDATE
  // ------------------------------
  const updateSquarePosition = (id: number) => {
    setSquares((current) =>
      current.map((sq) =>
        sq.id === id
          ? {
              ...sq,
              pos: getPos(),
            }
          : sq
      )
    );
  };

  // ------------------------------
  // REGENERATE SQUARES ON RESIZE
  // ------------------------------
  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares));
    }
  }, [dimensions, numSquares, generateSquares]);

  // ------------------------------
  // RESIZE OBSERVER (no re-render loops)
  // ------------------------------
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props} // repeatdelay not included here → no DOM warning
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${id})`} />

      {/* Animated squares */}
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [xPos, yPos], id }, index) => (
          <motion.rect
            key={`${id}-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.1,
              repeatType: "reverse",
            }}
            onAnimationComplete={() => updateSquarePosition(id)}
            width={width - 1}
            height={height - 1}
            x={xPos * width + 1}
            y={yPos * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}
