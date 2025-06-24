import { execute, queryDB } from '../db/client';

const LAT = 0;
const LON = 0;

async function fetchSun(date: string): Promise<{sunrise: string; sunset: string; hours: number}> {
  const resp = await fetch(`https://api.sunrise-sunset.org/json?lat=${LAT}&lng=${LON}&date=${date}&formatted=0`);
  if (!resp.ok) throw new Error('sun api failed');
  const data = await resp.json<any>();
  const sunrise = data.results.sunrise;
  const sunset = data.results.sunset;
  const sunHours = (new Date(sunset).valueOf() - new Date(sunrise).valueOf())/3600000;
  return { sunrise, sunset, hours: sunHours };
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

export async function handleBackfillSunrise(request: Request, env: Env): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const startStr = searchParams.get('start');
  const endStr = searchParams.get('end');
  if (!startStr || !endStr) {
    return new Response('missing start or end', { status: 400 });
  }
  const start = new Date(startStr);
  const end = new Date(endStr);
  const dates = dateRange(start, end);
  let inserted = 0;

  for (const date of dates) {
    const exist = await queryDB(env.DB, 'SELECT 1 FROM sunrise_sunset WHERE date=? LIMIT 1', [date]);
    if (exist.length) continue;
    const result = await fetchSun(date);
    await execute(env.DB, 'INSERT INTO sunrise_sunset (date, sunrise, sunset, sun_hours) VALUES (?, ?, ?, ?)', [date, result.sunrise, result.sunset, result.hours]);
    inserted++;
  }

  return new Response(JSON.stringify({ inserted }), { headers: { 'Content-Type': 'application/json' } });
}
