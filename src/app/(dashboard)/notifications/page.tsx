'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell, FileText, Wrench, AlertTriangle, CheckCheck,
  CheckCircle2
} from 'lucide-react';
import { NotifType, Notification } from '@/lib/types';
import { useFleet } from '@/lib/fleet-context';

export default function NotificationsPage() {
  const { notifications: fleetNotifs } = useFleet();
  const [notifications, setNotifications] = useState<Notification[]>(fleetNotifs);

  React.useEffect(() => {
    setNotifications(fleetNotifs);
  }, [fleetNotifs]);
  const [filterType, setFilterType] = useState<'all' | 'unread' | NotifType>('all');

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, status: 'read' as const }))
    );
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, status: 'read' as const } : n))
    );
  };

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return n.status !== 'read';
    return n.notif_type === filterType;
  });

  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  const getNotifDetails = (n: Notification) => {
    switch (n.notif_type) {
      case 'doc_expiry': {
        const vehicle = (n.payload.vehicle as string) || 'Vehicle';
        const docType = (n.payload.doc_type as string) || 'Document';
        const days = n.payload.days as number;
        const expiresOn = n.payload.expires_on as string;
        return {
          icon: FileText,
          iconColor: 'var(--pm-warning)',
          iconBg: 'var(--pm-warning-light)',
          title: `${docType.toUpperCase()} Expiring Soon`,
          description: `${docType.charAt(0).toUpperCase() + docType.slice(1)} certificate for ${vehicle} expires in ${days} days (${expiresOn}).`,
          link: '/documents',
          linkText: 'Renew Document',
        };
      }
      case 'maintenance_due': {
        const vehicle = (n.payload.vehicle as string) || 'Vehicle';
        const kind = (n.payload.kind as string) || 'Service';
        const overdue = n.payload.overdue as boolean;
        const dueOn = n.payload.next_due_on as string;
        return {
          icon: Wrench,
          iconColor: overdue ? 'var(--pm-error)' : 'var(--pm-blue-600)',
          iconBg: overdue ? 'var(--pm-error-light)' : 'var(--pm-blue-100)',
          title: overdue ? `Maintenance OVERDUE: ${vehicle}` : `Maintenance Scheduled: ${vehicle}`,
          description: `${kind.charAt(0).toUpperCase() + kind.slice(1)} scheduled for ${vehicle} ${overdue ? 'was due on ' + dueOn : 'is due on ' + dueOn}.`,
          link: '/maintenance',
          linkText: 'View Schedule',
        };
      }
      case 'incident': {
        const vehicle = (n.payload.vehicle as string) || 'Vehicle';
        const type = (n.payload.type as string) || 'Incident';
        const severity = (n.payload.severity as string) || 'medium';
        return {
          icon: AlertTriangle,
          iconColor: 'var(--pm-error)',
          iconBg: 'var(--pm-error-light)',
          title: `Reported Incident: ${type.toUpperCase()}`,
          description: `A ${severity} severity ${type} was reported for vehicle ${vehicle}.`,
          link: '/incidents',
          linkText: 'Review Incident',
        };
      }
      default:
        return {
          icon: Bell,
          iconColor: 'var(--pm-blue-600)',
          iconBg: 'var(--pm-blue-100)',
          title: 'System Notification',
          description: JSON.stringify(n.payload),
          link: '/dashboard',
          linkText: 'View Details',
        };
    }
  };

  return (
    <div className="pm-container" style={{ paddingBottom: 'var(--pm-space-12)' }}>
      {/* Page Header */}
      <div className="pm-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1>Notification Center</h1>
            {unreadCount > 0 && (
              <span className="pm-badge pm-badge-warning">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p style={{ color: 'var(--pm-text-secondary)', marginTop: 4 }}>
            Real-time alerts for document renewal dates, scheduled vehicle servicing, and fault logs
          </p>
        </div>

        {unreadCount > 0 && (
          <button className="pm-btn pm-btn-secondary" onClick={markAllAsRead}>
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="pm-notifications-layout">
        {/* Filters */}
        <div className="pm-tabs" style={{ marginBottom: 'var(--pm-space-4)' }}>
            <button
              className={`pm-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Alerts
            </button>
            <button
              className={`pm-tab ${filterType === 'unread' ? 'active' : ''}`}
              onClick={() => setFilterType('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`pm-tab ${filterType === 'doc_expiry' ? 'active' : ''}`}
              onClick={() => setFilterType('doc_expiry')}
            >
              Documents
            </button>
            <button
              className={`pm-tab ${filterType === 'maintenance_due' ? 'active' : ''}`}
              onClick={() => setFilterType('maintenance_due')}
            >
              Maintenance
            </button>
            <button
              className={`pm-tab ${filterType === 'incident' ? 'active' : ''}`}
              onClick={() => setFilterType('incident')}
            >
              Incidents
            </button>
          </div>

          {filteredNotifs.length === 0 ? (
            <div className="pm-card" style={{ padding: 'var(--pm-space-12)', textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--pm-radius-full)',
                background: 'var(--pm-bg-subtle)', color: 'var(--pm-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--pm-space-4)'
              }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>No notifications found</h3>
              <p style={{ color: 'var(--pm-text-secondary)', fontSize: '0.875rem' }}>
                All clear! There are no alerts matching this filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-3)' }}>
              {filteredNotifs.map(n => {
                const details = getNotifDetails(n);
                const isUnread = n.status !== 'read';
                const Icon = details.icon;

                return (
                  <div
                    key={n.id}
                    className="pm-card pm-notif-card"
                    style={{
                      padding: 'var(--pm-space-4) var(--pm-space-5)',
                      display: 'flex',
                      gap: 'var(--pm-space-4)',
                      background: isUnread ? 'var(--pm-surface)' : 'var(--pm-bg-subtle)',
                      borderColor: isUnread ? 'var(--pm-border)' : 'var(--pm-border-subtle)',
                      position: 'relative',
                    }}
                  >
                    {isUnread && (
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: 4, background: 'var(--pm-blue-500)',
                        borderTopLeftRadius: 'var(--pm-radius-lg)',
                        borderBottomLeftRadius: 'var(--pm-radius-lg)',
                      }} />
                    )}

                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--pm-radius-md)',
                      background: details.iconBg, color: details.iconColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={20} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="pm-notif-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: isUnread ? 600 : 500, fontSize: '0.9375rem', color: 'var(--pm-text)' }}>
                          {details.title}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(n.scheduled_for).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginTop: 4, lineHeight: 1.4, wordBreak: 'break-word' }}>
                        {details.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                        <Link
                          href={details.link}
                          className="pm-btn pm-btn-secondary pm-btn-sm"
                          onClick={() => markAsRead(n.id)}
                        >
                          {details.linkText}
                        </Link>
                        {isUnread && (
                          <button
                            type="button"
                            className="pm-btn pm-btn-ghost pm-btn-sm"
                            onClick={() => markAsRead(n.id)}
                            style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
