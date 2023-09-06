import http from "k6/http";
import { check, sleep } from "k6";

const isNumeric = (value) => /^\d+$/.test(value);

const default_vus = 10;

const target_vus_env = `${__ENV.TARGET_VUS}`;
const target_vus = isNumeric(target_vus_env)
  ? Number(target_vus_env)
  : default_vus;

export let options = {
  stages: [
    // Ramp-up from 1 to TARGET_VUS virtual users (VUs) in 5s
    { duration: "5s", target: target_vus },

    // Stay at rest on TARGET_VUS VUs for 10s
    { duration: "10s", target: target_vus },

    // Ramp-down from TARGET_VUS to 0 VUs for 5s
    { duration: "5s", target: 0 },
  ],
};

export default function () {
  const res1 = http.get("https://timesofindia.indiatimes.com/");
  check(res1, {
    "status is 200": (r) => r.status === 200,
  });
  sleep(1);

  const res2 = http.get("https://timesofindia.indiatimes.com/travel/");
  check(res2, {
    "verify homepage text": (r) => r.body.includes("Destinations"),
  });
  sleep(1);

  const res3 = http.get("https://swapi.dev/api/people/30/", {
    headers: { Accepts: "application/json" },
  });
  check(res3, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}
