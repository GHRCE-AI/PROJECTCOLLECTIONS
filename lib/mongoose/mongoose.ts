import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * A single pooled mongoose connection is cached on the Node.js global object so
 * it survives Next.js hot reloads in dev and is reused across every serverless
 * invocation in prod. Without this, each API call / RSC render would open a new
 * connection and the database would quickly run out of connection slots
 * ("too many connections"), causing the app to hang or crash under load.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

// Attach lifecycle listeners only once per process.
let listenersBound = false;
function bindConnectionListeners() {
  if (listenersBound) return;
  listenersBound = true;

  mongoose.connection.on('error', (err) => {
    console.error('[mongoose] connection error:', err?.message || err);
  });

  // If the connection drops, clear the cache so the next request reconnects
  // instead of reusing a dead handle (which would throw on every query).
  mongoose.connection.on('disconnected', () => {
    console.warn('[mongoose] disconnected — connection cache cleared');
    cached.conn = null;
    cached.promise = null;
  });
}

async function dbConnect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable in .env');
  }

  // Reuse a live connection.
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Stale handle: reset so we rebuild the promise below.
  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    bindConnectionListeners();

    const opts: mongoose.ConnectOptions = {
      // Fail fast instead of buffering queries forever when DB is unreachable.
      bufferCommands: false,
      // Connection pool — cap concurrent sockets so the DB is never flooded,
      // keep a couple warm so cold requests stay fast.
      maxPoolSize: 10,
      minPoolSize: 1,
      // Reap idle sockets so the pool doesn't grow and hold resources forever.
      maxIdleTimeMS: 30_000,
      // Give up server selection / sockets promptly rather than hanging.
      serverSelectionTimeoutMS: 8_000,
      socketTimeoutMS: 45_000,
      // Prefer IPv4 — avoids slow DNS fallbacks on some hosts.
      family: 4,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        console.info('[mongoose] connected');
        return m;
      })
      .catch((err) => {
        // Reset so a later request can retry the connection.
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
