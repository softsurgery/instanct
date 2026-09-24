import os from "node:os";

export function getAllowedDevOrigins() {
  const fromEnv = (process.env.ALLOWED_DEV_ORIGINS ?? "")
    .split(",")
    .map((value) => {
      const trimmed = value.trim();
      if (!trimmed) return null;
      try {
        return new URL(trimmed.includes("://") ? trimmed : `http://${trimmed}`)
          .hostname;
      } catch {
        return trimmed;
      }
    })
    .filter((value): value is string => Boolean(value));

  const fromNetwork = Object.values(os.networkInterfaces())
    .flatMap((ifaces) => ifaces ?? [])
    .filter((iface) => !iface.internal)
    .map((iface) => iface.address.split("%")[0]);

  return [
    ...new Set([
      ...fromEnv,
      ...fromNetwork,
      "localhost",
      "app-dev.instanct.com",
      "api-dev.instanct.com",
      "landing-dev.instanct.com",
    ]),
  ];
}
