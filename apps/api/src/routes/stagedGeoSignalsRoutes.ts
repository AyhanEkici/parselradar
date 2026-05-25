import { Router, type Request, type Response } from "express";
import { queryStagedSignalsFromPostgis } from "../geodata/stagedSignalAdapter";

const router = Router();

function isDevOnlyAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

router.get("/", async (req: Request, res: Response) => {
  if (!isDevOnlyAllowed()) {
    return res.status(403).json({
      status: "FORBIDDEN",
      guard: "DEV_ONLY",
      detail: "P2.GEO-9 staged signal endpoint is disabled in production.",
      productionSwapUsed: false,
      productionTablesQueried: false,
      officialVerification: false,
    });
  }

  const latRaw = req.query.lat;
  const lonRaw = req.query.lon;

  const lat =
    typeof latRaw === "string" && Number.isFinite(Number(latRaw))
      ? Number(latRaw)
      : undefined;

  const lon =
    typeof lonRaw === "string" && Number.isFinite(Number(lonRaw))
      ? Number(lonRaw)
      : undefined;

  const result = await queryStagedSignalsFromPostgis({
    lat,
    lon,
    label: "P2.GEO-9 dev endpoint staged signal query",
  });

  const statusCode =
    result.status === "PASS"
      ? 200
      : result.status === "CONFIG_REQUIRED"
        ? 200
        : result.status === "STAGED_IMPORT_REQUIRED"
          ? 409
          : 500;

  return res.status(statusCode).json({
    ...result,
    endpoint: {
      route: "/api/dev/staged-geo-signals",
      guard: "DEV_ONLY",
      productionBlocked: process.env.NODE_ENV === "production",
      adminOrDevGuard: true,
    },
  });
});

export default router;
