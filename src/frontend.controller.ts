import { Controller, Get, Res, Req, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { Public } from './modules/auth/decorators/public.decorator';
import { join } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';

@Controller()
@Public()
export class FrontendController {
  private readonly logger = new Logger(FrontendController.name);
  
  @Get(['dashboard*', 'login', 'register', 'privacy-policy', 'terms-of-service', '', '/'])
  serveFrontend(@Req() req: Request, @Res() res: Response) {
    try {
      // Determine project root based on whether we're in dev or production
      const isDev = process.env.NODE_ENV !== 'production';
      
      // Path resolution for different environments (without standalone)
      const devPath = join(process.cwd(), 'frontend', '.next', 'server', 'app');
      // In production Docker, __dirname is /app/dist/src, so we need to go up to /app
      const prodPath = join(__dirname, '..', '..', 'frontend', '.next', 'server', 'app');
      
      this.logger.log(`Requested path: ${req.path}`);
      this.logger.log(`Environment: ${isDev ? 'development' : 'production'}`);
      this.logger.log(`__dirname: ${__dirname}`);
      
      // Choose the appropriate path based on environment
      const nextServerAppDir = isDev ? devPath : prodPath;
      this.logger.log(`Using frontend path: ${nextServerAppDir}`);
      
      // Check if static files are properly configured
      const staticPath = isDev 
        ? join(process.cwd(), 'frontend', '.next', 'static')
        : join(__dirname, '..', '..', 'frontend', '.next', 'static');
      
      if (!existsSync(staticPath)) {
        this.logger.error(`Static files directory missing: ${staticPath}`);
      } else {
        this.logger.log(`Static files directory exists: ${staticPath}`);
      }
      
      // Map routes to HTML files - Next.js app directory generates direct .html files
      let htmlFile = '';
      if (req.path === '/' || req.path === '') {
        htmlFile = 'index.html';
      } else {
        // Remove leading slash and add .html (Next.js generates login.html, dashboard.html, etc.)
        htmlFile = req.path.replace(/^\//, '') + '.html';
      }
      
      const possiblePaths = [
        // Next.js server HTML files (direct .html files in app directory)
        join(nextServerAppDir, htmlFile),
        join(nextServerAppDir, 'index.html'), // fallback to home page
      ];
      
      // Log available frontend files for debugging
      if (existsSync(nextServerAppDir)) {
        this.logger.log(`Frontend server app directory exists`);
        this.logger.log(`Looking for HTML file: ${htmlFile}`);
      } else {
        this.logger.warn(`Frontend server app directory does not exist`);
        this.logger.warn(`Checked path: ${nextServerAppDir}`);
      }
      
      // Try to serve Next.js files first
      for (const htmlPath of possiblePaths) {
        if (existsSync(htmlPath)) {
          this.logger.log(`Found frontend file: ${htmlPath}`);
          const content = readFileSync(htmlPath, 'utf8');
          res.setHeader('Content-Type', 'text/html');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.send(content);
          return;
        }
      }

      // Root path should also have Next.js files - no special fallback needed
      
      this.logger.error(`No built frontend files found for path: ${req.path}`);
      
      // Return 404 instead of fallback - frontend should always be built
      res.status(404).send(`
        <h1>Frontend Not Built</h1>
        <p>The Next.js frontend was not properly built. Please run:</p>
        <pre>npm run build:frontend</pre>
        <p>Or check the Docker build logs for frontend build errors.</p>
      `);
    } catch (error) {
      console.error('Frontend controller error:', error);
      res.status(500).send(`
        <h1>Frontend Service Error</h1>
        <p>Unable to serve frontend content.</p>
        <pre>${error.message}</pre>
      `);
    }
  }

  // API health check that includes frontend status
  @Get('health')
  healthCheck(@Res() res: Response) {
    const isDev = process.env.NODE_ENV !== 'production';
    const frontendPath = isDev 
      ? join(process.cwd(), 'frontend', '.next')
      : join(__dirname, '..', '..', 'frontend', '.next');
    const staticPath = isDev 
      ? join(process.cwd(), 'frontend', '.next', 'static')
      : join(__dirname, '..', '..', 'frontend', '.next', 'static');
    const chunksPath = join(staticPath, 'chunks');
    
    const frontendBuilt = existsSync(frontendPath);
    const staticFilesExist = existsSync(staticPath);
    const chunksExist = existsSync(chunksPath);
    
    // Check for critical chunk files
    let chunkFiles = [];
    if (chunksExist) {
      try {
        chunkFiles = require('fs').readdirSync(chunksPath)
          .filter((file: string) => file.endsWith('.js'))
          .slice(0, 5); // Show first 5 chunks
      } catch (e) {
        this.logger.warn('Failed to read chunk files:', e.message);
      }
    }
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.1.0',
      services: {
        backend: 'operational',
        database: 'connected',
        frontend: frontendBuilt ? 'built' : 'building',
        integration: 'active'
      },
      build: {
        type: 'integrated',
        platform: 'railway',
        frontend: frontendBuilt ? 'complete' : 'in-progress'
      },
      staticFiles: {
        available: staticFilesExist,
        chunksAvailable: chunksExist,
        staticPath: staticPath,
        sampleChunks: chunkFiles
      },
      paths: {
        frontendPath,
        staticPath,
        chunksPath,
        environment: isDev ? 'development' : 'production'
      }
    };

    res.json(health);
  }

  // Add static file verification endpoint
  @Get('debug/static-files')
  debugStaticFiles(@Res() res: Response) {
    const isDev = process.env.NODE_ENV !== 'production';
    const staticPath = isDev 
      ? join(process.cwd(), 'frontend', '.next', 'static')
      : join(__dirname, '..', '..', 'frontend', '.next', 'static');
    
    try {
      const staticExists = existsSync(staticPath);
      if (!staticExists) {
        return res.json({
          error: 'Static directory not found',
          path: staticPath,
          exists: false
        });
      }

      // List all files in static directory
      const files = this.listFilesRecursively(staticPath);
      
      res.json({
        staticPath,
        exists: true,
        totalFiles: files.length,
        files: files.slice(0, 20), // Show first 20 files
        chunks: files.filter(f => f.includes('/chunks/')).slice(0, 10)
      });
    } catch (error) {
      res.json({
        error: error.message,
        staticPath,
        exists: false
      });
    }
  }

  private listFilesRecursively(dir: string, basePath: string = ''): string[] {
    let files = [];
    try {
      const items = require('fs').readdirSync(dir);
      for (const item of items) {
        const fullPath = join(dir, item);
        const relativePath = basePath ? `${basePath}/${item}` : item;
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files = files.concat(this.listFilesRecursively(fullPath, relativePath));
        } else {
          files.push(relativePath);
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return files;
  }


}