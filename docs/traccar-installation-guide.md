# ProMove GPS Telematics: Traccar Installation & Architecture Guide

This guide details all viable ways to install, run, and embed **[Traccar](https://github.com/traccar)** inside the **ProMove Fleet Management OS**.

---

## 1. Executive Architecture Overview

```
 ┌────────────────────────────────────────────────────────┐
 │        Ghana Commercial Fleet Trackers & Mobiles       │
 │   • Trotros & Taxis: Concox GT06 / Jimi IoT (Port 5013)│
 │   • Hauling Trucks & Coaches: Teltonika FMC130 (5027)  │
 │   • Budget Wire Trackers: Coban TK103 (Port 5001)      │
 │   • Smartphone Drivers: Traccar Client App (Port 5055) │
 └──────────────────────────┬─────────────────────────────┘
                            │ Raw Cellular Binary Packets (TCP/UDP)
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │         Traccar Telemetry Server (Port 8082)           │
 │   • Decodes 200+ hardware GPS protocols                │
 │   • Normalizes lat, lng, speed, heading, battery       │
 │   • Native forward.url JSON bridge configured          │
 └──────────────────────────┬─────────────────────────────┘
                            │ HTTP POST (Instant JSON Payload)
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │       ProMove Webhook (/api/gps/traccar-webhook)       │
 │   • Parameterized & spatial SQL sanitization           │
 │   • Correlates IMEI with Ghanaian vehicle plates       │
 │   • Stores trail into Neon Postgres 'positions' table  │
 │   • Emits real-time SSE to Leaflet Live GPS Map        │
 └────────────────────────────────────────────────────────┘
```

Traccar is a Java-based network service (built on Netty) designed to hold open thousands of persistent TCP/UDP socket connections from cellular GPS tracking hardware. It cannot be bundled as a pure JavaScript library alone, but can be seamlessly co-located, automated, and embedded inside ProMove.

---

## 2. The Four Ways to Install & Run Traccar with ProMove

### Option A: Native In-Project Runner (Zero-Docker, Uses Host Java 26)
*Recommended for local development, Windows workstations, or dedicated VPS servers without Docker.*

Because your system has Java installed (`java version "26.0.2"`), Traccar can be downloaded and run directly inside the project repository.

1. **Install Traccar into the project**:
   ```bash
   npm run traccar:setup
   ```
   *This automatically downloads `traccar-other-*.zip`, extracts the standalone `tracker-server.jar` into `./traccar`, and copies our pre-configured `docker/traccar/traccar.xml`.*

2. **Start the Traccar GPS Gateway**:
   ```bash
   npm run traccar:start
   ```
   - Traccar web interface will be accessible at: `http://localhost:8082`
   - Active hardware ports: `5013` (Concox), `5027` (Teltonika), `5001` (Coban), `5055` (OsmAnd)
   - Every received position is automatically forwarded to ProMove at: `http://localhost:3000/api/gps/traccar-webhook`

3. **Simulate a live Ghana vehicle ping**:
   ```bash
   npm run traccar:test
   ```

---

### Option B: In-App Embedded Console (`/telematics`)
*Allows fleet administrators to monitor and configure Traccar without ever leaving the ProMove application.*

We have provisioned a dedicated in-app page at [`/telematics`](file:///c:/Users/NewUser/Desktop/promove/src/app/(dashboard)/telematics/page.tsx):
- Located on the sidebar under **Fleet > GPS Gateway (Traccar)**.
- Embeds the Traccar Web UI inside a responsive viewport.
- Displays Ghana APN settings and SMS tracker configuration templates.
- Includes a live **Test GPS Ping** button to verify the webhook bridge with one click.

---

### Option C: Production Sidecar Deployment (Docker Compose)
*Recommended for production hosting on Linux VPS instances (DigitalOcean, AWS EC2, Hetzner, Linode).*

The repository includes a ready-to-deploy multi-container specification in [`docker-compose.telematics.yml`](file:///c:/Users/NewUser/Desktop/promove/docker-compose.telematics.yml):

```yaml
services:
  promove-web:
    build: .
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}

  traccar-server:
    image: traccar/traccar:latest
    ports:
      - "8082:8082"             # Web Console & REST API
      - "5013:5013/tcp"         # Concox / Jimi GT06
      - "5027:5027/tcp"         # Teltonika FMC130 / FMB920
      - "5001:5001/tcp"         # Coban / TK103
      - "5055:5055/tcp"         # OsmAnd / Mobile Traccar Client
    volumes:
      - ./docker/traccar/traccar.xml:/opt/traccar/conf/traccar.xml:ro
      - traccar-data:/opt/traccar/data:rw
      - traccar-logs:/opt/traccar/logs:rw
```

To run on your production server:
```bash
docker compose -f docker-compose.telematics.yml up -d
```

---

### Option D: Headless Mode (Deep REST API & WebSocket Client)
*Fleet operators interact 100% with ProMove; Traccar operates silently in the background.*

1. When an admin registers a vehicle in ProMove ([`/vehicles`](file:///c:/Users/NewUser/Desktop/promove/src/app/(dashboard)/vehicles/page.tsx)), ProMove automatically provisions the device in Traccar via its REST API:
   ```http
   POST http://localhost:8082/api/devices
   Authorization: Basic base64(admin:admin)
   Content-Type: application/json

   {
     "name": "GT-4921-20 (Trotro)",
     "uniqueId": "864201049281726"
   }
   ```
2. Traccar forwards live location pings to [`/api/gps/traccar-webhook`](file:///c:/Users/NewUser/Desktop/promove/src/app/api/gps/traccar-webhook/route.ts).
3. The ProMove **Live GPS Map** ([`/live-map`](file:///c:/Users/NewUser/Desktop/promove/src/app/(dashboard)/live-map/page.tsx)) immediately displays the trotro or bus traversing Ghanaian corridors (Tema Motorway, Circle Neoplan, Kasoa Barrier).

---

## 3. Ghana GPS Tracker Configuration Quick Reference

When outfitting Ghanaian commercial vehicles with SIM cards from MTN, Telecel, or AT, send the following SMS commands to each tracker's phone number:

### Concox / Jimi IoT (GT06 / WeTrack)
1. **Set Server IP & Port**: `SERVER,0,YOUR_PUBLIC_IP,5013,0#`
2. **Set APN**:
   - MTN Ghana: `APN,internet#`
   - Telecel: `APN,internet#`
   - AT: `APN,internet#`
3. **Set Upload Timer**: `TIMER,10#` (Reports every 10 seconds)
4. **Check Status**: `STATUS#`

### Teltonika (FMC130 / FMB920)
1. **Set APN**: `setparam 2001:internet`
2. **Set Server IP & Port**: `setparam 2004:YOUR_PUBLIC_IP;2005:5027;2006:0`
3. **Data Protocol**: `setparam 2007:0` (TCP mode)

### Smartphone Driver App (Traccar Client)
1. Download **Traccar Client** from Google Play Store or Apple App Store.
2. In app settings:
   - **Server URL**: `http://YOUR_PUBLIC_IP:5055`
   - **Device Identifier**: Vehicle Registration Plate (e.g. `GT-4921-20`) or Driver Code
   - **Frequency**: `10 seconds`
3. Toggle "Service status" to **ON**.

---

## 4. Verification & Testing

1. **Verify ProMove Ingestion Endpoint**:
   ```bash
   npm run traccar:test
   ```
2. **Check Database Recording**:
   Query Neon Postgres to verify that positions are recorded:
   ```sql
   SELECT vehicle_id, latitude, longitude, speed_kmh, recorded_at 
   FROM positions 
   ORDER BY recorded_at DESC 
   LIMIT 5;
   ```
3. **Verify Live Map**:
   Navigate to [`http://localhost:3000/live-map`](http://localhost:3000/live-map) to observe real-time movement and geofencing.
