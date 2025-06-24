CREATE TABLE IF NOT EXISTS pge_usage (
  date TEXT,
  hour TEXT,
  usage REAL,
  units TEXT,
  PRIMARY KEY(date, hour)
);

CREATE TABLE IF NOT EXISTS solar_test (
  date TEXT PRIMARY KEY,
  value REAL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS pvwatts (
  date TEXT PRIMARY KEY,
  ac_wh REAL,
  dc_kw REAL,
  ghi REAL,
  dni REAL,
  dhi REAL
);

CREATE TABLE IF NOT EXISTS sunrise_sunset (
  date TEXT PRIMARY KEY,
  sunrise TEXT,
  sunset TEXT,
  sun_hours REAL
);
