import { sleep } from "k6";
import http from "k6/http";

export const options = {
  ext: {
    loadimpact: {
      distribution: {
        "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 50 },
        "amazon:gb:london": { loadZone: "amazon:gb:london", percent: 50 },
      },
      apm: [
        {
          provider: "prometheus",
          remoteWriteURL:
            "https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom/push",
          credentials: {
            token:
              "glc_eyJvIjoiOTU1MzE1IiwibiI6InN0YWNrLTc1MjA3NC1obS1yZWFkLXFhdHJ1c2FpY2s2YXp1cmVjaWNkIiwiayI6IjBwOXZ2OTFhWTZESDdUNGdzRjhpM2QxZyIsIm0iOnsiciI6InByb2QtdXMtZWFzdC0wIn19",
          },
          includeDefaultMetrics: true,
          includeTestRunId: false,
          resampleRate: 3,
        },
      ],
    },
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 20, duration: "1m" },
        { target: 20, duration: "3m30s" },
        { target: 0, duration: "1m" },
      ],
      gracefulRampDown: "30s",
      exec: "scenario_1",
    },
  },
};

export function scenario_1() {
  let response;
  // Get homepage
  response = http.get("https://test.k6.io/");
  // Automatically added sleep
  sleep(1);
}
