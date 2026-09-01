import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { SnowCanvas, type SnowCanvasHandle } from "./SnowCanvas";
import { SnowScene } from "./SnowScene";
import { useDeviceOrientation } from "../hooks/useDeviceOrientation";

interface SnowGlobeProps {
  size?: number;
}

interface DragState {
  dragging: boolean;
  lastAngle: number;
  lastTime: number;
  velocity: number; // deg/ms, smoothed
}

const KEYBOARD_NUDGE_DEG = 15;

function angleFromCenter(clientX: number, clientY: number, el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
}

export function SnowGlobe({ size = 320 }: SnowGlobeProps) {
  const canvasHandleRef = useRef<SnowCanvasHandle>(null);
  const [hint, setHint] = useState(true);

  const rotation = useMotionValue(0);
  const dragRef = useRef<DragState>({ dragging: false, lastAngle: 0, lastTime: 0, velocity: 0 });
  const inertiaRafRef = useRef<number | null>(null);

  const stopInertia = useCallback(() => {
    if (inertiaRafRef.current !== null) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
  }, []);

  useEffect(() => stopInertia, [stopInertia]);

  const startInertia = useCallback(
    (initialVelocity: number) => {
      if (Math.abs(initialVelocity) < 0.01) return;
      canvasHandleRef.current?.shake(Math.min(1, Math.abs(initialVelocity) * 4));

      let velocity = initialVelocity;
      const step = () => {
        rotation.set(rotation.get() + velocity * 16);
        velocity *= 0.92;
        if (Math.abs(velocity) > 0.002) {
          inertiaRafRef.current = requestAnimationFrame(step);
        } else {
          inertiaRafRef.current = null;
        }
      };
      inertiaRafRef.current = requestAnimationFrame(step);
    },
    [rotation],
  );

  const handleTilt = useCallback((x: number, y: number) => {
    canvasHandleRef.current?.setGravity(x, y);
  }, []);

  const handleDeviceRotate = useCallback(
    (deltaDeg: number) => {
      if (dragRef.current.dragging) return; // manual drag takes priority
      stopInertia();
      rotation.set(rotation.get() + deltaDeg);
      if (Math.abs(deltaDeg) > 1.2) {
        canvasHandleRef.current?.shake(Math.min(1, Math.abs(deltaDeg) / 25));
        setHint(false);
      }
    },
    [rotation, stopInertia],
  );

  const { permission: orientationPermission, requestPermission: requestOrientationPermission } =
    useDeviceOrientation({ onTilt: handleTilt, onRotate: handleDeviceRotate });

  const handleEnableMotion = () => {
    void requestOrientationPermission();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    stopInertia();
    dragRef.current = {
      dragging: true,
      lastAngle: angleFromCenter(e.clientX, e.clientY, e.currentTarget),
      lastTime: performance.now(),
      velocity: 0,
    };
    if (orientationPermission === "needed") {
      void requestOrientationPermission();
    }
    setHint(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.dragging) return;

    const angle = angleFromCenter(e.clientX, e.clientY, e.currentTarget);
    const now = performance.now();
    let delta = angle - drag.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const dt = Math.max(1, now - drag.lastTime);
    const instantVelocity = delta / dt;
    drag.velocity = drag.velocity * 0.7 + instantVelocity * 0.3;

    rotation.set(rotation.get() + delta);
    if (Math.abs(delta) > 0.6) {
      canvasHandleRef.current?.shake(Math.min(1, Math.abs(instantVelocity) * 6));
    }

    drag.lastAngle = angle;
    drag.lastTime = now;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const drag = dragRef.current;
    if (!drag.dragging) return;
    drag.dragging = false;
    startInertia(drag.velocity);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const dir = e.key === "ArrowLeft" ? -1 : 1;
      stopInertia();
      rotation.set(rotation.get() + dir * KEYBOARD_NUDGE_DEG);
      canvasHandleRef.current?.shake(0.3);
      setHint(false);
    }
  };

  return (
    <div className="snowglobe-wrap">
      <div className="globe-pivot" style={{ width: size, height: size }}>
        {/* dome scene + base rotate together as one rigid body, pivoting on the dome's own center */}
        <motion.div className="globe-rotator" style={{ rotate: rotation }}>
          <div className="dome-scene-clip">
            <SnowScene size={size} />
          </div>
          <div className="globe-base" style={{ width: size * 0.62 }}>
            <div className="globe-base-top" />
          </div>
        </motion.div>

        {/* snow + glass shine stay fixed so snow always falls straight down and reflections don't spin */}
        <div
          className="snowglobe"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          role="button"
          aria-label="Sleep om de sneeuwbol te draaien"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="glass-dome">
            <SnowCanvas ref={canvasHandleRef} size={size} />
            <div className="glass-highlight" />
            <div className="glass-rim" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hint && (
          <motion.p
            className="interact-hint"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.4 }}
          >
            Sleep om de bol te draaien{orientationPermission !== "needed" && ", of draai je telefoon"} ✦
          </motion.p>
        )}
      </AnimatePresence>

      {orientationPermission === "needed" && (
        <motion.button
          type="button"
          className="enable-motion-btn"
          onClick={handleEnableMotion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          Sta bewegingssensor toe, om te draaien met je telefoon
        </motion.button>
      )}
      {orientationPermission === "denied" && (
        <p className="permission-denied-note">
          Bewegingssensor geweigerd — sleep de bol om ‘m te draaien.
        </p>
      )}
    </div>
  );
}
