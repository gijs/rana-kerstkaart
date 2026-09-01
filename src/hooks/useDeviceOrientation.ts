import { useCallback, useEffect, useRef, useState } from "react";

type OrientationPermissionState = "unknown" | "not-needed" | "needed" | "granted" | "denied";

interface UseDeviceOrientationOptions {
  /** normalized (x, y) gravity direction derived from left/right roll (gamma) */
  onTilt?: (x: number, y: number) => void;
  /** signed degrees turned since the previous reading, derived from compass heading (alpha) */
  onRotate?: (deltaDeg: number) => void;
  /** how far (degrees of roll) it takes to reach full sideways gravity */
  maxTiltDeg?: number;
}

function detectPermissionNeed(): OrientationPermissionState {
  if (typeof DeviceOrientationEvent === "undefined") return "not-needed";
  const needsPermission =
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown })
      .requestPermission === "function";
  return needsPermission ? "needed" : "not-needed";
}

export function useDeviceOrientation({
  onTilt,
  onRotate,
  maxTiltDeg = 45,
}: UseDeviceOrientationOptions) {
  const [permission, setPermission] = useState<OrientationPermissionState>(detectPermissionNeed);
  const lastAlphaRef = useRef<number | null>(null);

  useEffect(() => {
    if (permission !== "not-needed" && permission !== "granted") return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (onTilt && typeof e.gamma === "number" && !Number.isNaN(e.gamma)) {
        const gamma = Math.max(-maxTiltDeg, Math.min(maxTiltDeg, e.gamma));
        const angle = (gamma * Math.PI) / 180;
        onTilt(Math.sin(angle), Math.cos(angle));
      }

      if (onRotate && typeof e.alpha === "number" && !Number.isNaN(e.alpha)) {
        const alpha = e.alpha;
        if (lastAlphaRef.current !== null) {
          let delta = alpha - lastAlphaRef.current;
          // shortest path across the 0/360 wrap
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          onRotate(delta);
        }
        lastAlphaRef.current = alpha;
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      lastAlphaRef.current = null;
    };
  }, [permission, onTilt, onRotate, maxTiltDeg]);

  const requestPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (typeof DOE.requestPermission !== "function") {
      setPermission("not-needed");
      return;
    }
    try {
      const result = await DOE.requestPermission();
      setPermission(result === "granted" ? "granted" : "denied");
    } catch {
      setPermission("denied");
    }
  }, []);

  return { permission, requestPermission };
}
