import { queryDB } from '../db/client';

interface HourRecord {
  date: string;
  hour: string;
  usage: number;
  pv: number;
}

const OFF_PEAK = 0.25;
const PEAK = 0.35;

function rateForHour(h: number): number {
  return h >= 16 && h < 21 ? PEAK : OFF_PEAK;
}

function dateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export async function handleNemAnalysis(request: Request, env: Env): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const startStr = searchParams.get('start');
  const endStr = searchParams.get('end');
  if (!startStr || !endStr) {
    return new Response('missing start or end', { status: 400 });
  }
  const start = new Date(startStr);
  const end = new Date(endStr);
  const dates = dateRange(start, end);
const sql = `
  SELECT
    u.date,
    u.hour,
    u.usage,
    COALESCE(p.ac_wh, 0) as pv
  FROM pge_usage u
  LEFT JOIN pvwatts_hourly p ON u.date = p.date AND u.hour = p.hour
  WHERE u.date BETWEEN ? AND ?
  ORDER BY u.date, u.hour
`;
const hours = await queryDB<HourRecord>(env.DB, sql, [startStr, endStr]);
  let costNEM2 = 0;
  let costNEM3 = 0;
  for (const h of hours) {
    const rate = rateForHour(parseInt(h.hour));
    const net = h.usage - h.pv;
    if (net >= 0) {
      costNEM2 += net * rate;
      costNEM3 += net * rate;
    } else {
      costNEM2 += net * rate; // negative credit
      costNEM3 += net * rate * 0.75;
    }
  }
  const diff = costNEM3 - costNEM2;
  return new Response(JSON.stringify({ costNEM2, costNEM3, diff, hours }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
