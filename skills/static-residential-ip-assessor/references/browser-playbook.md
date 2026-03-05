# Browser Playbook

Guide for querying IP intelligence sources via Playwright / Chrome DevTools MCP.

## Query Order

Execute in this order to optimize for speed and reliability:

1. **ipinfo.io** — Fast, no auth needed for basic, rate limit generous
2. **ip-api.com** — Fast, no auth, good geo data
3. **AbuseIPDB** — Moderate speed, no login for basic lookup
4. **Scamalytics** — Moderate speed, no login needed
5. **IPQS** — Slowest, may have Cloudflare challenge, most valuable
6. **BGP Hurricane Electric** — Supplementary, fast
7. **RDAP / WHOIS** — Supplementary, fast

Rationale: Start with fast/reliable sources. By the time you reach IPQS, you already have fallback data if it fails.

## Source Details

### 1. ipinfo.io

- **URL**: `https://ipinfo.io/{IP}`
- **Auth**: No login needed for basic lookup
- **Key fields to extract**:
  - `org` (ASN + organization name)
  - `city`, `region`, `country`, `timezone`
  - Privacy section: `vpn`, `proxy`, `tor`, `relay`, `hosting`
- **Page structure**: JSON-like display on the main page. Look for the info card with IP details.
- **Rate limit**: ~1000/day for unauthenticated visits
- **Fallback**: ip-api.com covers similar data

### 2. ip-api.com

- **URL**: `https://ip-api.com/{IP}` (web page) or check JSON at `http://ip-api.com/json/{IP}`
- **Auth**: None
- **Key fields to extract**:
  - `isp`, `org`, `as` (ASN)
  - `city`, `regionName`, `country`, `timezone`
  - `proxy`, `hosting`, `mobile`
- **Rate limit**: 45 requests/minute for the JSON API
- **Note**: The JSON endpoint is HTTP only (not HTTPS) for free tier. Use the web page for browser automation.
- **Fallback**: ipinfo.io covers similar data

### 3. AbuseIPDB

- **URL**: `https://www.abuseipdb.com/check/{IP}`
- **Auth**: No login needed for basic page view
- **Key fields to extract**:
  - `Abuse Confidence Score` (percentage, displayed prominently)
  - `Total Reports` count
  - `ISP` name
  - `Usage Type` (e.g., "Fixed Line ISP", "Data Center/Web Hosting")
  - Recent report categories if any
- **Page structure**: Main score displayed in a colored circle/badge at top. Details in a table below.
- **Rate limit**: Generous for manual page views. Aggressive scraping may trigger Cloudflare.
- **Anti-crawl notes**: Has Cloudflare protection. If challenged, wait 5 seconds and retry.
- **Fallback**: If unavailable, note as missing. This source is supplementary to IPQS.

### 4. Scamalytics

- **URL**: `https://scamalytics.com/ip/{IP}`
- **Auth**: None
- **Key fields to extract**:
  - `Fraud Score` (0-100, displayed prominently)
  - `Risk Level` (Very Low / Low / Medium / High)
  - IP details: `ISP Name`, `Organization Name`, `Connection type`
  - Flags: `Anonymizing VPN`, `Tor Exit Node`, `Server`, `Public Proxy`, `Web Proxy`
- **Page structure**: Score shown in a colored bar at top. Detailed breakdown in tables below.
- **Rate limit**: Moderate. No known aggressive blocking.
- **Important**: This is the PRIMARY fallback if IPQS is unavailable. Extract the Fraud Score carefully.
- **Fallback**: N/A (this IS a fallback source)

### 5. IPQS (IPQualityScore)

- **URL**: `https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/{IP}`
- **Auth**: No login needed for free lookup page
- **Key fields to extract**:
  - `Fraud Score` (0-100)
  - `Proxy` (Yes/No)
  - `VPN` (Yes/No)
  - `Tor` (Yes/No)
  - `Recent Abuse` (Yes/No)
  - `Bot Status` (Yes/No)
  - `Mobile` (Yes/No)
  - `Connection Type`
  - `ISP`, `Organization`, `ASN`
- **Page structure**: Results displayed in a table/card format after the lookup completes. May need to wait for JavaScript rendering.
- **Anti-crawl notes**:
  - **Cloudflare protected** — May present a challenge page. If challenged:
    1. Wait for the challenge to auto-resolve (usually 5-10 seconds)
    2. If it doesn't resolve, try once more
    3. If still blocked, mark IPQS as unavailable and use degraded scoring
  - **Daily limit**: Free lookups are limited (~varies, approximately 5-10/day without account)
  - **Page may require JS rendering**: Ensure you wait for the results table to appear, not just page load
- **Rate limit**: Very limited for free tier. Space queries at least 10 seconds apart.
- **Fallback**: When IPQS fails, activate degraded scoring mode (see scoring-rubric.md § 5).

### 6. BGP Hurricane Electric

- **URL**: `https://bgp.he.net/ip/{IP}`
- **Auth**: None
- **Key fields to extract**:
  - Origin AS number and name
  - Prefix being announced
  - Whether the IP is within an announced prefix
- **Page structure**: Simple table layout. AS info shown prominently.
- **Rate limit**: Generous
- **Fallback**: Can also use `https://bgp.tools/prefix/{IP}` or Team Cymru whois

### 7. RDAP / WHOIS

- **URL**: `https://rdap.arin.net/registry/ip/{IP}` (for ARIN region)
  - For RIPE: `https://rdap.db.ripe.net/ip/{IP}`
  - For APNIC: `https://rdap.apnic.net/ip/{IP}`
- **Auth**: None
- **Key fields to extract**:
  - `name` (network name)
  - `handle` (registration handle)
  - Organization/registrant details
  - Address range / CIDR
  - Registration and last update dates
- **Note**: RDAP returns JSON. Can be parsed directly from page or via curl.
- **Alternative**: Use command line `whois {IP}` or `dig -x {IP}` for PTR records.
- **Fallback**: If RDAP fails, try the web WHOIS lookup at the relevant RIR's website.

## PTR / rDNS Lookup

- **Method**: Use terminal command `dig -x {IP}` or `host {IP}`
- **What to look for**:
  - Stable residential naming patterns (e.g., `xx-xx-xx-xx.res.spectrum.com`)
  - Cloud/hosting patterns (e.g., `ec2-xx-xx-xx-xx.compute.amazonaws.com`)
  - No PTR record (common for some residential ISPs, not conclusive either way)
- **Adjacent IP sampling**: Check 3-5 nearby IPs (e.g., if target is `.100`, check `.98`, `.99`, `.101`, `.102`) to see if PTR patterns are consistent.

## Failure Handling

### If a source is completely unavailable:

1. Log it as `unavailable` with reason (timeout / Cloudflare block / rate limit / site down)
2. Continue with remaining sources
3. In the final report, clearly mark which sources were checked and which were unavailable
4. Apply degraded scoring if IPQS is the one that failed (see scoring-rubric.md § 5)

### If a source returns partial data:

1. Extract what's available
2. Note which fields are missing
3. Do NOT infer missing fields — report them as missing

### Minimum viable evidence set:

At minimum, you need data from **at least 3 of the 7 sources** to produce a credible report. If fewer than 3 sources are available, output a "provisional" report and explicitly state the evidence gap.

## General Browser Automation Tips

1. **Wait for rendering**: Many of these sites use JavaScript to render results. Wait for the result elements to appear, not just `DOMContentLoaded`.
2. **Screenshot as evidence**: Take a screenshot of each source's result page as backup evidence.
3. **Rate limiting**: Space queries at least 3-5 seconds apart. IPQS needs 10+ seconds between queries.
4. **Cookie/session**: Some sites set cookies on first visit. If you get a blank result, try reloading once.
5. **User-Agent**: Use a standard browser User-Agent. The default Playwright/Chrome DevTools UA is fine.
