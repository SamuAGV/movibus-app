// src/hooks/useIncidents.ts
import { useEffect, useState } from 'react';
import { getIncidents } from '../services/incidentService';
import { IncidentReport } from '../types';

export function useIncidents(busId: string | null) {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!busId) {
      setReports([]);
      setLoading(false);
      return;
    }

    const refresh = () => {
      setReports(getIncidents(busId));
      setLoading(false);
    };

    refresh();
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, [busId]);

  return { reports, loading };
}
