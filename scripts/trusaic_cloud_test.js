import { check, sleep } from "k6";
import http from "k6/http";
import { appConstants } from "./general/constants.js";

const CONSTS = appConstants;

export const options = {
  ext: {
    loadimpact: {
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
    portal_availability: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 5, duration: "20s" },
        { target: 10, duration: "30s" },
        { target: 0, duration: "10m" },
      ],
      gracefulRampDown: "30s",
      exec: "availabilityTest",
    },
    portal_apitest: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 2, duration: "5s" },
        { target: 5, duration: "10s" },
        { target: 0, duration: "3m" },
      ],
      gracefulRampDown: "30s",
      exec: "apiCallTest",
    },
  },
};

export function availabilityTest() {
  const res = http.get(CONSTS.portalUrl, {
    tags: { my_custom_tag: "portal_availability" },
  });
  check(res, {
    "status is 200": (r) => r.status == 200,
  });
  sleep(1);
}

export function apiCallTest() {
  const payload = JSON.stringify({
    name: "lorem",
    surname: "ipsum",
  });
  const headers = { "Content-Type": "application/json" };
  http.post("https://httpbin.test.k6.io/post", payload, { headers });
  sleep(1);
}
