import { check, sleep } from "k6";
import http from "k6/http";
import { browser } from "k6/experimental/browser";

export const appConstants = {
  domain: "trusaic.testinator.com",
  inbox: "qa",
  apiToken: "12b00439466e45ee855b3f3c64e4c612",
  mailUrl: "https://mailinator.com/api/v2/domains/",
  portalUrl: "https://portal-qa.trusaic.com",
  portalUser: "qa@Trusaic.testinator.com",
  portalPass: "Trusaic@12",
  memJson: "application/json",
};
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
        { target: 3, duration: "20s" },
        { target: 6, duration: "30s" },
        { target: 0, duration: "10s" },
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
        { target: 0, duration: "3s" },
      ],
      gracefulRampDown: "30s",
      exec: "apiCallTest",
    },
    portal_login: {
      executor: "per-vu-iterations",
      options: {
        browser: {
          type: "chromium",
        },
      },
      exec: "portalLogin",
      startTime: "1s",
      vus: 1,
      iterations: 1,
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
  const res2 = http.get(
    `${CONSTS.portalUrl}/css/login.css?v=638273698668208760`,
    {
      headers: { Accepts: CONSTS.memJson },
    }
  );
  check(res2, { "status is 200": (r) => r.status === 200 });
  sleep(1);

  const res3 = http.get(
    `${CONSTS.portalUrl}/css/global.css?v=638273698668208940`,
    {
      headers: { Accepts: CONSTS.memJson },
    }
  );
  check(res3, {
    "status is 200": (r) => r.status === 200,
    "response time is less than 200ms": (r) => r.timings.duration < 200,
  });
  sleep(1);
}

export async function portalLogin() {
  const page = browser.newPage();
  try {
    // --- Login page
    await page.goto(CONSTS.portalUrl);
    page.locator('input[name="Email"]').type(CONSTS.portalUser);
    page.locator('input[name="Password"]').type(CONSTS.portalPass);
    const submitButton = page.locator('button[id="trusaic-loginBtn"]');
    await Promise.all([page.waitForNavigation(), submitButton.click()]);
    /// Add delay before reading the code.
    sleep(3); // ms

    let mfaCode = getMfaCode(
      CONSTS.domain,
      CONSTS.inbox,
      CONSTS.mailUrl,
      CONSTS.apiToken
    );
    console.log(mfaCode);
    ///
    page.locator('input[name="Code"]').type(mfaCode);
    const mfaButton = page.locator('button[type="submit"]');
    ///
    await Promise.all([page.waitForNavigation(), mfaButton.click()]);
    await page.waitForNavigation();
    check(page, {
      header: (p) =>
        p.locator('span[class="Upload-Title"]').textContent() == "PayParity",
    });
    //
  } catch (e) {
    console.log("Error : portalLogin : " + e);
  } finally {
    page.close();
  }
}

export function getMfaCode(domain, inbox, mailUrl, apiToken) {
  // reading the mailbox and picking the first email.
  const resInbox = http.get(
    `${mailUrl}${domain}/inboxes/${inbox}/?limit=1&sort=descending&token=${apiToken}`
  );
  //console.log(inboxUrl);
  //console.log(resInbox.json("msgs"));
  const messageId = resInbox.json("msgs.0.id");
  console.log(messageId);
  //----------------------------------------------------------------------

  // reading the message and scan body for CODE
  const resMessage = http.get(
    `${mailUrl}${domain}/inboxes/${inbox}/messages/${messageId}/?token=${apiToken}`
  );
  const mail = resMessage.json("parts.0.body");
  // search message text
  const codeRegex =
    /Security code: <span class=\"security-code-span\" style=\"font-weight: 700; font-size: 105%;\">(\d+)/;
  const match = codeRegex.exec(mail);
  if (match) {
    return match[1];
  } else {
    throw new Error("Could not find 2FA code in email message");
  }
  //------------------------------------------------------------------------
}
