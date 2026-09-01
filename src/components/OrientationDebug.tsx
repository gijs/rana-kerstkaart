import { useEffect, useState } from "react";

interface Reading {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  count: number;
  lastAt: number;
}

/** Diagnostic overlay for device-orientation issues on real hardware. Enable with ?debug=1. */
export function OrientationDebug() {
  const [reading, setReading] = useState<Reading>({
    alpha: null,
    beta: null,
    gamma: null,
    count: 0,
    lastAt: 0,
  });
  const [, forceTick] = useState(0);

  const hasApi = typeof DeviceOrientationEvent !== "undefined";
  const needsPermission =
    hasApi &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown })
      .requestPermission === "function";

  useEffect(() => {
    const onOrientation = (e: DeviceOrientationEvent) => {
      setReading((r) => ({
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma,
        count: r.count + 1,
        lastAt: Date.now(),
      }));
    };
    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, []);

  // re-render every second so "time since last event" stays fresh
  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsSince = reading.lastAt ? ((Date.now() - reading.lastAt) / 1000).toFixed(1) : "—";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        left: 8,
        right: 8,
        zIndex: 9999,
        background: "rgba(20,44,71,0.92)",
        color: "#fff",
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 1.6,
        padding: "10px 12px",
        borderRadius: 8,
        pointerEvents: "none",
      }}
    >
      <div>DeviceOrientationEvent supported: {String(hasApi)}</div>
      <div>requestPermission() present: {String(needsPermission)}</div>
      <div>events received: {reading.count}</div>
      <div>last event: {secondsSince}s ago</div>
      <div>
        alpha: {reading.alpha?.toFixed(1) ?? "null"} · beta: {reading.beta?.toFixed(1) ?? "null"}{" "}
        · gamma: {reading.gamma?.toFixed(1) ?? "null"}
      </div>
    </div>
  );
}
