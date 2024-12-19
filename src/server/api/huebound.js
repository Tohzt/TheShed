// Import necessary modules
import express from 'express';
import path from 'path';

// Create an Express app
const app = express();

// Serve the Godot game files from the correct directory
app.use(express.static(path.join(__dirname, '../../../public/arcade/huebound')));

// Add the necessary headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// Export the serverless function
module.exports = app;

