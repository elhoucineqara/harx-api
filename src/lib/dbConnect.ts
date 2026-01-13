import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/harx';

  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env'
    );
  }

  console.log(`🔌 Attempting to connect to MongoDB: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  // Check if we have a valid cached connection
  if (cached.conn) {
    // Verify the connection is still alive
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    } else {
      // Connection is stale, clear it
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // 30 seconds - increased for remote servers
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 30000, // Give up initial connection after 30 seconds - increased for remote servers
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true,
      retryReads: true,
      // For remote MongoDB servers
      family: 4, // Use IPv4, skip trying IPv6
      heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connected successfully');
  } catch (e: any) {
    cached.promise = null;
    // Clear the cached connection on error
    cached.conn = null;
    console.error('❌ MongoDB connection error:', e.message);
    
    // Provide more helpful error messages
    let errorMessage = `Database connection failed: ${e.message}`;
    let suggestions = [];
    
    if (e.message.includes('timeout') || e.message.includes('connect')) {
      errorMessage += '\n\nPossible solutions:';
      const mongoUri = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
        suggestions.push('1. Check if MongoDB is running locally: `mongod` or check your MongoDB service');
        suggestions.push('2. Verify MongoDB is installed and the service is started');
        suggestions.push('3. Try: `mongosh` to test local MongoDB connection');
      } else {
        suggestions.push(`1. The MongoDB server (${mongoUri.split('@')[1]?.split('/')[0] || 'remote'}) may be unreachable`);
        suggestions.push('2. Check if the server IP is whitelisted in your MongoDB configuration');
        suggestions.push('3. Verify your network/firewall allows connections to the MongoDB port');
        suggestions.push('4. For MongoDB Atlas, ensure your current IP is whitelisted in Network Access');
        suggestions.push('5. Check if the MongoDB server is running and accessible');
        suggestions.push('6. Consider using a local MongoDB instance for development: MONGODB_URI=mongodb://localhost:27017/harx');
      }
      suggestions.push('7. Verify the MongoDB URI in your .env file is correct');
    } else if (e.message.includes('ENOTFOUND') || e.message.includes('getaddrinfo')) {
      errorMessage += '\n\nDNS resolution failed - check your MongoDB host address.';
      suggestions.push('1. Verify the hostname in your MongoDB URI');
      suggestions.push('2. Check your network connection');
    } else if (e.message.includes('authentication')) {
      errorMessage += '\n\nAuthentication failed.';
      suggestions.push('1. Check your MongoDB username and password');
      suggestions.push('2. Verify your MongoDB credentials in the connection string');
    }
    
    if (suggestions.length > 0) {
      errorMessage += '\n' + suggestions.join('\n');
    }
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return cached.conn;
}

export default dbConnect;

