'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Navigation,
  Server,
  Radio,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  Activity,
  ArrowRight,
  RefreshCw,
  Cpu,
  Smartphone,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TelematicsPage() {
  const [activeTab, setActiveTab] = useState<'console' | 'hardware-setup' | 'bridge-status'>('console');
  const [traccarUrl, setTraccarUrl] = useState('http://localhost:8082');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestPing = async () => {
    setTestingPing(true);
    setPingResult(null);

    try {
      const res = await fetch('/api/gps/traccar-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: {
            deviceId: 'GH-TRO-4821',
            protocol: 'gt06',
            latitude: 5.6037, // Accra, Ghana
            longitude: -0.1870,
            speed: 34.2, // ~63 km/h
            course: 110,
            altitude: 42,
            fixTime: new Date().toISOString(),
            attributes: {
              ignition: true,
              batteryLevel: 94,
              power: 12.8,
            },
          },
          device: {
            name: 'GT-4821-20',
            uniqueId: '864000000000001',
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPingResult({
          success: true,
          message: `GPS packet ingested! Vehicle: ${data.plateNumber || 'GT-4821-20'}, Status: ${data.status}, Speed: ${data.speedKmh?.toFixed(1)} km/h`,
        });
      } else {
        setPingResult({
          success: false,
          message: data.error || 'Webhook returned error status.',
        });
      }
    } catch (err: any) {
      setPingResult({
        success: false,
        message: err.message || 'Failed to reach ProMove GPS webhook.',
      });
    } finally {
      setTestingPing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-[var(--pm-text-muted)] font-medium mb-1">
            <Link href="/live-map" className="hover:underline flex items-center gap-1">
              <Navigation size={14} /> Live GPS Map
            </Link>
            <span>/</span>
            <span>Traccar Telematics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--pm-text)]">
            Traccar GPS Gateway & Hardware Bridge
          </h1>
          <p className="text-sm text-[var(--pm-text-secondary)]">
            Ingest real-time telematics from hardware GPS trackers (Concox, Teltonika, Coban) and smartphone clients across Ghana.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestPing}
            disabled={testingPing}
            className="flex items-center gap-2"
          >
            <Activity size={15} className={testingPing ? 'animate-spin' : 'text-[var(--pm-blue-600)]'} />
            <span>{testingPing ? 'Ingesting...' : 'Test GPS Ping'}</span>
          </Button>

          <a
            href={traccarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pm-btn pm-btn-primary pm-btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <span>Open Standalone Console</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Ping Result Alert */}
      {pingResult && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            pingResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3 text-sm">
            {pingResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{pingResult.message}</span>
          </div>
          <Link href="/live-map" className="text-xs font-bold underline hover:opacity-80">
            View on Live Map &rarr;
          </Link>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--pm-border)] space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('console')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'console'
              ? 'border-[var(--pm-blue-600)] text-[var(--pm-blue-600)]'
              : 'border-transparent text-[var(--pm-text-muted)] hover:text-[var(--pm-text)]'
          }`}
        >
          <Server size={16} />
          <span>In-App Traccar Console</span>
        </button>

        <button
          onClick={() => setActiveTab('hardware-setup')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'hardware-setup'
              ? 'border-[var(--pm-blue-600)] text-[var(--pm-blue-600)]'
              : 'border-transparent text-[var(--pm-text-muted)] hover:text-[var(--pm-text)]'
          }`}
        >
          <Radio size={16} />
          <span>Ghana Hardware Trackers & SMS Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('bridge-status')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'bridge-status'
              ? 'border-[var(--pm-blue-600)] text-[var(--pm-blue-600)]'
              : 'border-transparent text-[var(--pm-text-muted)] hover:text-[var(--pm-text)]'
          }`}
        >
          <Layers size={16} />
          <span>Architecture & Forwarding Bridge</span>
        </button>
      </div>

      {/* Tab 1: In-App Embedded Console */}
      {activeTab === 'console' && (
        <div className="space-y-4">
          <Card className="border-[var(--pm-border)]">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--pm-surface)]">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-xs">
                  <span className="font-semibold text-[var(--pm-text)]">Active Traccar Endpoint: </span>
                  <span className="font-mono text-[var(--pm-text-muted)]">{traccarUrl}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={traccarUrl}
                  onChange={(e) => setTraccarUrl(e.target.value)}
                  className="pm-input text-xs"
                  style={{ height: 32, width: 220, padding: '4px 8px' }}
                  placeholder="http://localhost:8082"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const iframe = document.getElementById('traccar-iframe') as HTMLIFrameElement;
                    if (iframe) iframe.src = traccarUrl;
                  }}
                  className="text-xs h-8"
                >
                  <RefreshCw size={13} className="mr-1" /> Reload
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Embedded Iframe Container */}
          <div className="rounded-xl border border-[var(--pm-border)] overflow-hidden shadow-lg bg-slate-900 min-h-[640px] relative">
            <iframe
              id="traccar-iframe"
              src={traccarUrl}
              className="w-full h-[680px] border-0"
              title="Traccar GPS Telemetry Console"
              allow="geolocation"
            />
            {/* Fallback overlay if Traccar is not started yet */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs text-slate-300 max-w-md shadow-2xl">
              <div className="font-semibold text-white mb-1 flex items-center gap-2">
                <Terminal size={14} className="text-[var(--pm-blue-400)]" />
                Need to start Traccar locally?
              </div>
              <p className="mb-2">
                Run the bundled native runner in your terminal:
              </p>
              <div className="bg-slate-950 p-2 rounded font-mono text-emerald-400 flex items-center justify-between">
                <span>npm run traccar:start</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('npm run traccar:start', 'npm-start')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedCode === 'npm-start' ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hardware Trackers & SMS Setup Guide */}
      {activeTab === 'hardware-setup' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Concox / Jimi GT06 */}
          <Card className="border-[var(--pm-border)]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold">
                    GT06
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--pm-text)]">Concox / Jimi IoT (GT06 / WeTrack)</h3>
                    <p className="text-xs text-[var(--pm-text-muted)]">Port: 5013 (TCP) • Standard for Trotros & Taxis</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                  Most Popular in Ghana
                </span>
              </div>

              <p className="text-xs text-[var(--pm-text-secondary)] leading-relaxed">
                Insert a SIM card with data (MTN, Telecel, or AT). Send these SMS commands from your phone to the tracker SIM:
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded bg-[var(--pm-bg-subtle)] border border-[var(--pm-border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-[var(--pm-text-muted)]">1. Set Server IP & Port: </span>
                    <strong className="text-[var(--pm-text)]">SERVER,0,YOUR_SERVER_IP,5013,0#</strong>
                  </div>
                  <button onClick={() => copyToClipboard('SERVER,0,YOUR_SERVER_IP,5013,0#', 'concox-1')} className="text-xs text-[var(--pm-text-muted)] hover:text-[var(--pm-text)]">
                    {copiedCode === 'concox-1' ? 'Copied' : <Copy size={14} />}
                  </button>
                </div>

                <div className="p-2.5 rounded bg-[var(--pm-bg-subtle)] border border-[var(--pm-border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-[var(--pm-text-muted)]">2. MTN Ghana APN: </span>
                    <strong className="text-[var(--pm-text)]">APN,internet#</strong>
                  </div>
                  <button onClick={() => copyToClipboard('APN,internet#', 'concox-2')} className="text-xs text-[var(--pm-text-muted)] hover:text-[var(--pm-text)]">
                    {copiedCode === 'concox-2' ? 'Copied' : <Copy size={14} />}
                  </button>
                </div>

                <div className="p-2.5 rounded bg-[var(--pm-bg-subtle)] border border-[var(--pm-border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-[var(--pm-text-muted)]">3. Report Interval: </span>
                    <strong className="text-[var(--pm-text)]">TIMER,10#</strong>
                  </div>
                  <button onClick={() => copyToClipboard('TIMER,10#', 'concox-3')} className="text-xs text-[var(--pm-text-muted)] hover:text-[var(--pm-text)]">
                    {copiedCode === 'concox-3' ? 'Copied' : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teltonika FMC130 / FMB920 */}
          <Card className="border-[var(--pm-border)]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
                    TEL
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--pm-text)]">Teltonika (FMC130 / FMB920)</h3>
                    <p className="text-xs text-[var(--pm-text-muted)]">Port: 5027 (TCP) • Standard for Hauling & Long-haul Buses</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                  Commercial Fleet Grade
                </span>
              </div>

              <p className="text-xs text-[var(--pm-text-secondary)] leading-relaxed">
                Configure via Teltonika Configurator software or SMS commands with admin authentication:
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded bg-[var(--pm-bg-subtle)] border border-[var(--pm-border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-[var(--pm-text-muted)]">1. GPRS APN: </span>
                    <strong className="text-[var(--pm-text)]">setparam 2001:internet</strong>
                  </div>
                  <button onClick={() => copyToClipboard('setparam 2001:internet', 'tel-1')} className="text-xs text-[var(--pm-text-muted)] hover:text-[var(--pm-text)]">
                    {copiedCode === 'tel-1' ? 'Copied' : <Copy size={14} />}
                  </button>
                </div>

                <div className="p-2.5 rounded bg-[var(--pm-bg-subtle)] border border-[var(--pm-border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-[var(--pm-text-muted)]">2. Server IP & Port: </span>
                    <strong className="text-[var(--pm-text)]">setparam 2004:YOUR_IP;2005:5027</strong>
                  </div>
                  <button onClick={() => copyToClipboard('setparam 2004:YOUR_IP;2005:5027', 'tel-2')} className="text-xs text-[var(--pm-text-muted)] hover:text-[var(--pm-text)]">
                    {copiedCode === 'tel-2' ? 'Copied' : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traccar Client Mobile App (Driver Phone GPS) */}
          <Card className="border-[var(--pm-border)]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--pm-text)]">Traccar Client (Smartphone Android / iOS)</h3>
                  <p className="text-xs text-[var(--pm-text-muted)]">Port: 5055 (HTTP OsmAnd) • Turn any Android phone into tracker</p>
                </div>
              </div>

              <p className="text-xs text-[var(--pm-text-secondary)] leading-relaxed">
                Download <strong>Traccar Client</strong> from Google Play Store or Apple App Store onto the driver&apos;s phone:
              </p>

              <div className="p-3 rounded-lg bg-[var(--pm-bg-subtle)] text-xs space-y-1.5 border border-[var(--pm-border-subtle)]">
                <div><strong>Server URL:</strong> <span className="font-mono text-[var(--pm-blue-600)]">http://YOUR_SERVER_IP:5055</span></div>
                <div><strong>Device Identifier:</strong> Enter the Vehicle Plate Number (e.g. <span className="font-mono">GT-4921-20</span>) or IMEI</div>
                <div><strong>Location Accuracy:</strong> High</div>
                <div><strong>Frequency:</strong> 10 seconds</div>
              </div>
            </CardContent>
          </Card>

          {/* Ghana Telco APN Reference */}
          <Card className="border-[var(--pm-border)]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
                  🇬🇭
                </div>
                <div>
                  <h3 className="font-bold text-[var(--pm-text)]">Ghana Telecom APN Settings</h3>
                  <p className="text-xs text-[var(--pm-text-muted)]">Ensure tracker SIM cards have active data packages</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="p-2.5 rounded bg-[var(--pm-bg-subtle)] border border-[var(--pm-border-subtle)]">
                  <div className="font-bold text-amber-600">MTN Ghana</div>
                  <div className="font-mono text-[11px] mt-1">internet</div>
                </div>
                <div className="p-2.5 rounded bg-[var(--pm-bg-subtle)] border border-[var(--pm-border-subtle)]">
                  <div className="font-bold text-red-600">Telecel</div>
                  <div className="font-mono text-[11px] mt-1">internet</div>
                </div>
                <div className="p-2.5 rounded bg-[var(--pm-bg-subtle)] border border-[var(--pm-border-subtle)]">
                  <div className="font-bold text-blue-600">AT (AirtelTigo)</div>
                  <div className="font-mono text-[11px] mt-1">internet</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Architecture & Forwarding Bridge */}
      {activeTab === 'bridge-status' && (
        <Card className="border-[var(--pm-border)]">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--pm-text)] mb-1">
                How ProMove Connects to Traccar
              </h3>
              <p className="text-sm text-[var(--pm-text-secondary)]">
                Traccar operates as the high-throughput protocol decoder (Netty binary server), while ProMove provides business logic, pesewa accounting, and Leaflet corridor maps.
              </p>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-center">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
                <Radio className="mx-auto mb-2 text-blue-600" size={24} />
                <div className="font-bold text-sm mb-1">1. GPS Trackers</div>
                <div className="text-[11px] opacity-80">Concox / Teltonika hardware sending raw cellular binary packets</div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-200">
                <Cpu className="mx-auto mb-2 text-purple-600" size={24} />
                <div className="font-bold text-sm mb-1">2. Traccar Netty</div>
                <div className="text-[11px] opacity-80">Parses 200+ protocols on ports 5000-5300 &amp; normalizes telemetry</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                <Activity className="mx-auto mb-2 text-emerald-600" size={24} />
                <div className="font-bold text-sm mb-1">3. ProMove Webhook</div>
                <div className="text-[11px] opacity-80">Receives JSON payload at <code>/api/gps/traccar-webhook</code></div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
                <Navigation className="mx-auto mb-2 text-amber-600" size={24} />
                <div className="font-bold text-sm mb-1">4. Live Map &amp; DB</div>
                <div className="text-[11px] opacity-80">Saves to Neon Postgres <code>positions</code> &amp; updates real-time map</div>
              </div>
            </div>

            {/* XML Configuration Snippet */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--pm-text-muted)]">
                  Webhook Forwarding Rule (docker/traccar/traccar.xml)
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck size={14} /> Pre-configured &amp; active
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
{`<!-- Real-time Position Forwarding into ProMove -->
<entry key='forward.enable'>true</entry>
<entry key='forward.type'>json</entry>
<entry key='forward.url'>http://localhost:3000/api/gps/traccar-webhook</entry>
<entry key='forward.header'>Content-Type: application/json</entry>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
