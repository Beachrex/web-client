#!/usr/bin/env node

/**
 * Upload Playwright HTML report to DigitalOcean Spaces
 *
 * This script uploads the playwright-report directory to DigitalOcean Spaces
 * using the AWS SDK (S3-compatible API).
 *
 * Required environment variables:
 * - AWS_ACCESS_KEY_ID: DigitalOcean Spaces access key
 * - AWS_SECRET_ACCESS_KEY: DigitalOcean Spaces secret key
 * - DO_SPACES_BUCKET: Bucket name (default: beachrex-tests)
 * - DO_SPACES_REGION: Region (default: fra1)
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { existsSync } from 'fs';
import { lookup } from 'mime-types';
import * as dotenv from 'dotenv';

// Load environment variables from .env file (if it exists)
// In CI environments, variables are already set, so this is optional
dotenv.config();

// Configuration
const BUCKET = process.env.DO_SPACES_BUCKET || 'beachrex-tests';
const REGION = process.env.DO_SPACES_REGION || 'fra1';
const ENDPOINT = `https://${REGION}.digitaloceanspaces.com`;
const REPORT_DIR = 'playwright-report';

// Generate timestamp-based folder name
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const UPLOAD_PREFIX = `playwright-reports/${timestamp}`;

// Initialize S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

/**
 * Get all files in a directory recursively
 */
async function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath, baseDir));
    } else {
      files.push({
        path: fullPath,
        key: relative(baseDir, fullPath),
      });
    }
  }
  
  return files;
}

/**
 * Upload a single file to S3
 */
async function uploadFile(filePath, key) {
  const content = await readFile(filePath);
  const contentType = lookup(filePath) || 'application/octet-stream';
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: `${UPLOAD_PREFIX}/${key}`,
    Body: content,
    ContentType: contentType,
    ACL: 'public-read',
  });
  
  await s3Client.send(command);
}

/**
 * Main function
 */
async function main() {
  console.log('📊 Uploading Playwright Report to DigitalOcean Spaces');
  console.log('');
  
  // Check if report directory exists
  if (!existsSync(REPORT_DIR)) {
    console.error(`❌ Report directory not found: ${REPORT_DIR}`);
    console.error('   Run "yarn test:e2e" first to generate the report.');
    process.exit(1);
  }
  
  // Check credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ Missing credentials!');
    console.error('');
    console.error('   AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
    console.error('   AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set');
    console.error('');
    console.error('   For local development: Add to .env file');
    console.error('   For GitLab CI: Set in Settings > CI/CD > Variables');
    console.error('');
    process.exit(1);
  }
  
  console.log(`📁 Source: ${REPORT_DIR}`);
  console.log(`🪣 Bucket: ${BUCKET}`);
  console.log(`📍 Region: ${REGION}`);
  console.log(`📂 Destination: ${UPLOAD_PREFIX}`);
  console.log('');
  
  try {
    // Get all files
    const files = await getAllFiles(REPORT_DIR);
    console.log(`📦 Found ${files.length} files to upload`);
    console.log('');
    
    // Upload files with progress
    let uploaded = 0;
    for (const file of files) {
      await uploadFile(file.path, file.key);
      uploaded++;
      process.stdout.write(`\r⬆️  Uploading: ${uploaded}/${files.length}`);
    }
    console.log('');
    console.log('');
    
    // Generate report URL
    const reportUrl = `https://${BUCKET}.${REGION}.digitaloceanspaces.com/${UPLOAD_PREFIX}/index.html`;
    
    console.log('✅ Upload complete!');
    console.log('');
    console.log('📊 View your report at:');
    console.log(`   ${reportUrl}`);
    console.log('');
    
    // Also output just the URL for CI systems
    console.log(`REPORT_URL=${reportUrl}`);
    
  } catch (error) {
    console.error('');
    console.error('❌ Upload failed:', error.message);
    if (error.Code === 'AccessDenied') {
      console.error('   Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    }
    process.exit(1);
  }
}

main();

