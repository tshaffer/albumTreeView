import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser'; // Parse cookies
import dotenv from 'dotenv';
import { createRoutes } from './routes';
import path from 'path';
import { Server } from 'http';
import cors from 'cors';
const bodyParser = require('body-parser');

import albumTreeRoutes from './routes/albumTree';

import { connectDB } from './config/db';  // ✅ Import first

dotenv.config();

const startServer = async () => {
  await connectDB();  // ✅ Ensure DB is connected before anything else

  // Initialize Express app
  const app = express();
  const PORT = process.env.PORT || 8080;

  app.use(cookieParser());
  app.use(express.json()); // Parse JSON requests

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // add routes
  // createRoutes(app);

  // Serve static files from the /public directory
  app.use(express.static(path.join(__dirname, '../public')));

  // Serve the SPA on the root route (index.html)
  app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });

  app.use('/api/album-tree', albumTreeRoutes);

  // Start the server
  const server: Server<any> = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });

  process.on('unhandledRejection', (err: any, promise: any) => {
    console.log(`Error: ${err.message}`);
    // Close server and exit process
    server.close(() => process.exit(1));
  });

};

startServer();