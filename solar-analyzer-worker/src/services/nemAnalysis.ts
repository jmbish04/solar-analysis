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


export async function handleNemAnalysis(request: Request, env: Env): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const startStr = searchParams.get('start');
  const endStr = searchParams.get('end');
  if (!startStr || !endStr) {
    return new Response('missing start or end', { status: 400 });
  }


  const hours = await queryDB<HourRecord>(
    env.DB,
    `SELECT u.date, u.hour, u.usage, coalesce(p.ac_wh, 0) as pv
     FROM pge_usage u
     LEFT JOIN pvwatts_hourly p ON u.date = p.date AND u.hour = p.hour
     WHERE u.date BETWEEN ? AND ?
     ORDER BY u.date, u.hour`,
    [startStr, endStr]
  );
    let costNEM2 = 0;
  let costNEM3 = 0;
  const detailedHours = [];
  for (const h of hours) {
    const rate = rateForHour(parseInt(h.hour));
    const net = h.usage - h.pv;
    let hourlyDiff = 0;
    if (net >= 0) {
      costNEM2 += net * rate;
      costNEM3 += net * rate;
    } else {
      const nem2Credit = net * rate; // negative credit
      const nem3Credit = net * rate * 0.75;
      costNEM2 += nem2Credit;
      costNEM3 += nem3Credit;
      hourlyDiff = nem3Credit - nem2Credit;
    }
    detailedHours.push({ ...h, hourlyDiff });
  }
  const diff = costNEM3 - costNEM2;
  return new Response(JSON.stringify({ costNEM2, costNEM3, diff, hours: detailedHours }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
