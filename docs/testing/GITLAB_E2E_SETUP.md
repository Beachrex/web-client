# GitLab E2E Testing Setup Guide

Complete guide to set up automated Playwright E2E testing with GitLab CI/CD and DigitalOcean Spaces report upload.

---

## Prerequisites

- GitLab repository (GitLab.com or self-hosted)
- DigitalOcean Spaces bucket (or any S3-compatible storage)
- Next.js project with Playwright installed
- Access to GitLab repository settings

---

## Part 1: DigitalOcean Spaces Setup

### 1.1 Create Spaces Bucket

1. Log in to **DigitalOcean**
2. Go to **Spaces Object Storage**
3. Click **Create a Space**
4. Configure:
   - **Region**: Choose closest to your users (e.g., `fra1` for Frankfurt)
   - **Bucket name**: `your-project-tests` (e.g., `my-app-e2e-tests`)
   - **Enable CDN**: Optional (not required for test reports)
   - **File Listing**: Enable (allows public access to reports)
5. Click **Create Space**

### 1.2 Generate API Keys

1. Go to **API** → **Spaces Keys**
2. Click **Generate New Key**
3. Name it: `E2E Test Reports Upload`
4. **Copy and save**:
   - **Access Key** (e.g., `DO00AABBCCDDEE1122FF`)
   - **Secret Key** (e.g., `your-secret-key-here-keep-this-secure`)

   ⚠️ **Important**: Secret key is shown only once! Save it securely.

### 1.3 Configure Bucket Permissions (Optional)

If you want reports to be publicly accessible:

1. Go to your Space → **Settings**
2. Under **File Listing**, ensure it's enabled
3. Files uploaded with `public-read` ACL will be accessible via URL

---

## Part 2: Project Setup

### 2.1 Install Dependencies

```bash
npm install --save-dev @playwright/test @aws-sdk/client-s3 mime-types dotenv
# or
yarn add -D @playwright/test @aws-sdk/client-s3 mime-types dotenv
```

### 2.2 Create Upload Script

Create `scripts/upload-playwright-report.mjs`:

```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import { lookup } from 'mime-types';
import dotenv from 'dotenv';

// Load .env file (optional in CI)
dotenv.config();

const REPORT_DIR = 'playwright-report';
const BUCKET = process.env.DO_SPACES_BUCKET || 'your-project-tests';
const REGION = process.env.DO_SPACES_REGION || 'fra1';
const ENDPOINT = `https://${REGION}.digitaloceanspaces.com`;

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

const s3Client = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const destinationPrefix = `playwright-reports/${timestamp}`;

async function getAllFiles(dir, fileList = []) {
  const files = await readdir(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      await getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function uploadFile(filePath) {
  const fileContent = await readFile(filePath);
  const relativePath = relative(REPORT_DIR, filePath);
  const key = `${destinationPrefix}/${relativePath}`;
  const contentType = lookup(filePath) || 'application/octet-stream';

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );
}

async function main() {
  console.log('📊 Uploading Playwright Report to DigitalOcean Spaces');
  console.log(`📁 Source: ${REPORT_DIR}`);
  console.log(`🪣 Bucket: ${BUCKET}`);
  console.log(`📍 Region: ${REGION}`);
  console.log(`📂 Destination: ${destinationPrefix}`);

  const files = await getAllFiles(REPORT_DIR);
  console.log(`📦 Found ${files.length} files to upload`);

  for (let i = 0; i < files.length; i++) {
    await uploadFile(files[i]);
    if ((i + 1) % 10 === 0 || i === files.length - 1) {
      console.log(`⬆️  Uploading: ${i + 1}/${files.length}`);
    }
  }

  const reportUrl = `${ENDPOINT}/${BUCKET}/${destinationPrefix}/index.html`;
  console.log('✅ Upload complete!');
  console.log('📊 View your report at:');
  console.log(`   ${reportUrl}`);
  console.log(`REPORT_URL=${reportUrl}`);
}

main().catch((error) => {
  console.error('❌ Upload failed:', error.message);
  process.exit(1);
});
```

### 2.3 Update package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:upload": "node scripts/upload-playwright-report.mjs",
    "test:e2e:ci": "playwright test; yarn test:e2e:upload"
  }
}
```

### 2.4 Configure Playwright

Update `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Only start dev server if BASE_URL is not provided
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 2.5 Create .env File (Local Development)

Create `.env` in project root:

```bash
# DigitalOcean Spaces credentials
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Optional: customize bucket and region
DO_SPACES_BUCKET=your-bucket-name
DO_SPACES_REGION=fra1
```

⚠️ **Add `.env` to `.gitignore`** - Never commit credentials!

---

## Part 3: GitLab CI/CD Configuration

### 3.1 Create .gitlab-ci.yml

Create `.gitlab-ci.yml` in project root:

```yaml
stages:
  - test

# E2E Tests - API trigger only
e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.56.1-jammy

  # Only run when triggered via API, not on push/merge
  rules:
    - if: $CI_PIPELINE_SOURCE == "trigger"
      when: on_success
    - when: never

  variables:
    CI: "true"
    # Base URL for testing - override when triggering pipeline if needed
    BASE_URL: "https://dev.yoursite.com"
    # DigitalOcean Spaces configuration
    DO_SPACES_BUCKET: "your-project-tests"
    DO_SPACES_REGION: "fra1"
    # AWS credentials will be inherited from GitLab CI/CD variables

  before_script:
    - corepack enable
    - yarn install --frozen-lockfile

  script:
    - |
      if [ "$BROWSER" = "all" ] || [ -z "$BROWSER" ]; then
        yarn playwright test
      else
        yarn playwright test --project=$BROWSER
      fi

  after_script:
    # Debug: Check if credentials are available
    - echo "Checking AWS credentials..."
    - |
      if [ -z "$AWS_ACCESS_KEY_ID" ]; then
        echo "❌ AWS_ACCESS_KEY_ID is not set!"
      else
        echo "✅ AWS_ACCESS_KEY_ID is set (length: ${#AWS_ACCESS_KEY_ID})"
      fi
    - |
      if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        echo "❌ AWS_SECRET_ACCESS_KEY is not set!"
      else
        echo "✅ AWS_SECRET_ACCESS_KEY is set (length: ${#AWS_SECRET_ACCESS_KEY})"
      fi
    # Always upload report, even if tests fail
    - yarn test:e2e:upload || true

  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 30 days
    reports:
      junit: test-results/junit.xml

  timeout: 30 minutes
```

**Important**: Update Docker image version to match your `@playwright/test` version in `package.json`.

---

## Part 4: GitLab Repository Configuration

### 4.1 Set CI/CD Variables

1. Go to your GitLab repository
2. Navigate to **Settings → CI/CD**
3. Expand **Variables** section
4. Add the following variables:

#### Variable 1: AWS_ACCESS_KEY_ID
- Click **Add variable**
- **Key**: `AWS_ACCESS_KEY_ID`
- **Value**: Your DigitalOcean Spaces access key (e.g., `DO00AABBCCDDEE1122FF`)
- **Type**: Variable
- **Environment scope**: All (default)
- **Protect variable**: ❌ **UNCHECK** (important!)
- **Mask variable**: ❌ Uncheck
- **Expand variable reference**: ❌ Uncheck
- Click **Add variable**

#### Variable 2: AWS_SECRET_ACCESS_KEY
- Click **Add variable**
- **Key**: `AWS_SECRET_ACCESS_KEY`
- **Value**: Your DigitalOcean Spaces secret key (from step 1.2)
- **Type**: Variable
- **Environment scope**: All (default)
- **Protect variable**: ❌ **UNCHECK** (important!)
- **Mask variable**: ✅ **CHECK** (recommended for security)
- **Expand variable reference**: ❌ Uncheck
- Click **Add variable**

#### Variable 3: DO_SPACES_BUCKET (Optional)
- Click **Add variable**
- **Key**: `DO_SPACES_BUCKET`
- **Value**: `your-bucket-name` (e.g., `my-project-tests`)
- **Protect variable**: ❌ Uncheck
- **Mask variable**: ❌ Uncheck
- Click **Add variable**

#### Variable 4: DO_SPACES_REGION (Optional)
- Click **Add variable**
- **Key**: `DO_SPACES_REGION`
- **Value**: `fra1` (or your chosen region: `nyc3`, `sgp1`, etc.)
- **Protect variable**: ❌ Uncheck
- **Mask variable**: ❌ Uncheck
- Click **Add variable**

**Why uncheck "Protect variable"?**
- Protected variables only work on protected branches (like `main`, `master`)
- If you want to run tests on feature branches, you must uncheck this
- If you only run tests on `main` branch, you can keep it checked

### 4.2 Create Pipeline Trigger Token

1. In the same **Settings → CI/CD** page
2. Expand **Pipeline triggers** section
3. Click **Add trigger**
4. **Description**: `E2E Test Trigger` (or any descriptive name)
5. Click **Add trigger**
6. **Copy the token** (e.g., `glptt-xxxxxxxxxxxxxxxxxxxx`)
7. **Save it securely** - you'll need this to trigger pipelines via API

### 4.3 Get Your Project ID

**Option A**: From GitLab UI
1. Go to your project homepage
2. Look under the project name
3. You'll see **Project ID: 12345678** (copy this number)

**Option B**: From URL
1. Go to **Settings → General**
2. The URL will be like: `https://gitlab.com/username/project/-/settings/general`
3. Or use API: `curl "https://gitlab.com/api/v4/projects/username%2Fproject"`

---

## Part 5: Testing the Setup

### 5.1 Test Locally

```bash
# Run tests locally
yarn test:e2e

# Upload report manually
yarn test:e2e:upload

# Run tests and upload (CI mode)
yarn test:e2e:ci
```

Check the console output for the report URL.

### 5.2 Test GitLab CI Trigger

#### Basic trigger (uses default BASE_URL):
```bash
curl -X POST \
  --fail \
  --form token=YOUR_TRIGGER_TOKEN \
  --form ref=main \
  "https://gitlab.com/api/v4/projects/YOUR_PROJECT_ID/trigger/pipeline"
```

#### Example with actual values:
```bash
curl -X POST \
  --fail \
  --form token=glptt-xxxxxxxxxxxxxxxxxxxx \
  --form ref=main \
  "https://gitlab.com/api/v4/projects/12345678/trigger/pipeline"
```

#### Trigger with custom environment:
```bash
curl -X POST \
  --fail \
  --form token=glptt-xxxxxxxxxxxxxxxxxxxx \
  --form ref=main \
  --form "variables[BASE_URL]=https://staging.yoursite.com" \
  "https://gitlab.com/api/v4/projects/12345678/trigger/pipeline"
```

#### Trigger with specific browser:
```bash
curl -X POST \
  --fail \
  --form token=glptt-xxxxxxxxxxxxxxxxxxxx \
  --form ref=main \
  --form "variables[BROWSER]=chromium" \
  "https://gitlab.com/api/v4/projects/12345678/trigger/pipeline"
```

#### Trigger specific test file:
```bash
curl -X POST \
  --fail \
  --form token=glptt-xxxxxxxxxxxxxxxxxxxx \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/home.spec.ts" \
  "https://gitlab.com/api/v4/projects/12345678/trigger/pipeline"
```

#### Trigger tests in specific folder:
```bash
curl -X POST \
  --fail \
  --form token=glptt-xxxxxxxxxxxxxxxxxxxx \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/auth/" \
  "https://gitlab.com/api/v4/projects/12345678/trigger/pipeline"
```

#### Trigger tests matching a pattern (grep):
```bash
curl -X POST \
  --fail \
  --form token=glptt-xxxxxxxxxxxxxxxxxxxx \
  --form ref=main \
  --form "variables[TEST_FILTER]=-g 'login'" \
  "https://gitlab.com/api/v4/projects/12345678/trigger/pipeline"
```

#### Combine multiple filters:
```bash
# Run only "hero" tests in home.spec.ts on Firefox
curl -X POST \
  --fail \
  --form token=glptt-xxxxxxxxxxxxxxxxxxxx \
  --form ref=main \
  --form "variables[BROWSER]=firefox" \
  --form "variables[TEST_FILTER]=tests/home.spec.ts -g 'hero'" \
  "https://gitlab.com/api/v4/projects/12345678/trigger/pipeline"
```

### 5.3 Verify Pipeline Execution

1. Go to **CI/CD → Pipelines** in GitLab
2. You should see a new pipeline running
3. Click on the pipeline to see job details
4. Check the `e2e-tests` job logs
5. Look for:
   - ✅ Credentials check (both should show ✅)
   - Test execution output
   - Upload progress
   - Report URL at the end

### 5.4 Access Test Report

From the job logs, copy the report URL:
```
https://your-bucket.fra1.digitaloceanspaces.com/playwright-reports/2025-11-27T20-10-10/index.html
```

Open it in your browser to view the interactive HTML report.

---

## Part 6: Integration Examples

### 6.1 Trigger from Laravel/PHP

```php
use Illuminate\Support\Facades\Http;

class GitLabPipelineService
{
    public function triggerE2ETests(
        string $branch = 'main',
        ?string $baseUrl = null,
        ?string $browser = null
    ): array {
        $variables = [];

        if ($baseUrl) {
            $variables['BASE_URL'] = $baseUrl;
        }

        if ($browser) {
            $variables['BROWSER'] = $browser;
        }

        $response = Http::asForm()->post(
            'https://gitlab.com/api/v4/projects/' . config('services.gitlab.project_id') . '/trigger/pipeline',
            [
                'token' => config('services.gitlab.trigger_token'),
                'ref' => $branch,
                'variables' => $variables,
            ]
        );

        if ($response->successful()) {
            return [
                'success' => true,
                'pipeline_id' => $response->json('id'),
                'web_url' => $response->json('web_url'),
            ];
        }

        return [
            'success' => false,
            'error' => $response->json('message') ?? 'Unknown error',
        ];
    }
}

// Usage: Trigger after deployment
app(GitLabPipelineService::class)->triggerE2ETests(
    branch: 'main',
    baseUrl: 'https://production.yoursite.com'
);
```

### 6.2 Trigger from Node.js/JavaScript

```javascript
async function triggerE2ETests(branch = 'main', baseUrl = null, browser = null) {
  const formData = new URLSearchParams();
  formData.append('token', process.env.GITLAB_TRIGGER_TOKEN);
  formData.append('ref', branch);

  if (baseUrl) {
    formData.append('variables[BASE_URL]', baseUrl);
  }

  if (browser) {
    formData.append('variables[BROWSER]', browser);
  }

  const response = await fetch(
    `https://gitlab.com/api/v4/projects/${process.env.GITLAB_PROJECT_ID}/trigger/pipeline`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  if (response.ok) {
    console.log('✅ Pipeline triggered:', data.web_url);
    return data;
  } else {
    console.error('❌ Failed to trigger pipeline:', data.message);
    throw new Error(data.message);
  }
}

// Usage
await triggerE2ETests('main', 'https://staging.yoursite.com', 'chromium');
```

### 6.3 Trigger from Bash Script (Deployment Hook)

```bash
#!/bin/bash
# deploy.sh - Run after deployment

GITLAB_PROJECT_ID="12345678"
GITLAB_TRIGGER_TOKEN="glptt-xxxxxxxxxxxxxxxxxxxx"
ENVIRONMENT="${1:-production}"

echo "🚀 Deployment to $ENVIRONMENT complete"
echo "🧪 Triggering E2E tests..."

RESPONSE=$(curl -s -X POST \
  --form token=$GITLAB_TRIGGER_TOKEN \
  --form ref=main \
  --form "variables[BASE_URL]=https://$ENVIRONMENT.yoursite.com" \
  "https://gitlab.com/api/v4/projects/$GITLAB_PROJECT_ID/trigger/pipeline")

PIPELINE_URL=$(echo $RESPONSE | jq -r '.web_url')

if [ "$PIPELINE_URL" != "null" ]; then
  echo "✅ E2E tests triggered successfully"
  echo "📊 View pipeline: $PIPELINE_URL"
else
  echo "❌ Failed to trigger E2E tests"
  echo "$RESPONSE"
  exit 1
fi
```

Usage:
```bash
./deploy.sh staging
./deploy.sh production
```

---

## Part 7: Troubleshooting

### 7.1 "Missing credentials" Error

**Symptom**: Upload script fails with "AWS_ACCESS_KEY_ID is not set"

**Solutions**:
1. Verify variables are set in **Settings → CI/CD → Variables**
2. Check variable names are exact: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
3. Ensure "Protect variable" is **unchecked** if testing on non-protected branches
4. Check variable scope is set to "All" (not specific environments)

### 7.2 "Playwright version mismatch" Error

**Symptom**: `Executable doesn't exist at /ms-playwright/chromium...`

**Solution**: Update Docker image in `.gitlab-ci.yml` to match `@playwright/test` version:
```yaml
image: mcr.microsoft.com/playwright:v1.56.1-jammy
```

Check your version:
```bash
grep "@playwright/test" package.json
```

### 7.3 Pipeline Doesn't Start

**Symptom**: API trigger returns success but no pipeline appears

**Solutions**:
1. Check the `rules` section in `.gitlab-ci.yml`
2. Verify `$CI_PIPELINE_SOURCE == "trigger"` is correct
3. Try triggering on a different branch
4. Check GitLab CI/CD settings are enabled for the project

### 7.4 Tests Run on Push (Unwanted)

**Symptom**: Tests run automatically when pushing code

**Solution**: Ensure `.gitlab-ci.yml` has correct rules:
```yaml
rules:
  - if: $CI_PIPELINE_SOURCE == "trigger"
    when: on_success
  - when: never
```

This ensures tests **only** run on API triggers, not on push/merge.

### 7.5 "Job failed: exit code 1" (But Upload Succeeded)

**Symptom**: Job shows as failed but report uploaded successfully

**Explanation**: This is **normal** when tests fail. The exit code 1 comes from Playwright (test failures), not from the upload script. The `|| true` in `after_script` ensures upload runs even when tests fail.

**Solution**: Check the test report to see which tests failed and fix them.

### 7.6 Report URL Returns 403/404

**Symptom**: Can't access report URL

**Solutions**:
1. Verify bucket name and region are correct
2. Check files are uploaded with `ACL: 'public-read'`
3. Verify DigitalOcean Spaces has "File Listing" enabled
4. Check the URL format: `https://{region}.digitaloceanspaces.com/{bucket}/{path}/index.html`

---

## Part 8: Maintenance

### 8.1 Update Playwright Version

When updating Playwright:

1. Update package.json:
   ```bash
   yarn add -D @playwright/test@latest
   ```

2. Update `.gitlab-ci.yml` Docker image:
   ```yaml
   image: mcr.microsoft.com/playwright:v1.XX.X-jammy
   ```

3. Commit and push changes

### 8.2 Rotate Credentials

To rotate DigitalOcean Spaces credentials:

1. Generate new API key in DigitalOcean
2. Update GitLab CI/CD variables
3. Update local `.env` file
4. Delete old API key from DigitalOcean

### 8.3 Clean Up Old Reports

Reports are stored indefinitely in DigitalOcean Spaces. To clean up:

**Option A**: Manual deletion via DigitalOcean UI

**Option B**: Lifecycle policy (if supported by your plan)

**Option C**: Script to delete old reports:
```bash
# Delete reports older than 30 days
aws s3 ls s3://your-project-tests/playwright-reports/ \
  --endpoint-url=https://fra1.digitaloceanspaces.com \
  | awk '{print $2}' \
  | while read folder; do
      # Add logic to check date and delete
    done
```

---

## Summary Checklist

### DigitalOcean Setup
- [ ] Create Spaces bucket
- [ ] Generate API keys (Access Key + Secret Key)
- [ ] Save credentials securely

### Project Setup
- [ ] Install dependencies (`@playwright/test`, `@aws-sdk/client-s3`, etc.)
- [ ] Create `scripts/upload-playwright-report.mjs`
- [ ] Update `package.json` scripts
- [ ] Configure `playwright.config.ts`
- [ ] Create `.env` file (add to `.gitignore`)

### GitLab Configuration
- [ ] Create `.gitlab-ci.yml`
- [ ] Set CI/CD variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- [ ] Uncheck "Protect variable" for non-protected branches
- [ ] Create pipeline trigger token
- [ ] Note your project ID

### Testing
- [ ] Test locally: `yarn test:e2e:ci`
- [ ] Test API trigger with curl
- [ ] Verify pipeline runs in GitLab
- [ ] Check report URL is accessible
- [ ] Verify tests don't run on push/merge

### Integration (Optional)
- [ ] Add trigger to deployment scripts
- [ ] Set up automated triggers after deployments
- [ ] Document trigger token and project ID for team

---

## Quick Reference

### Environment Variables

**Local (.env)**:
```bash
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
DO_SPACES_BUCKET=your-project-tests
DO_SPACES_REGION=fra1
```

**GitLab CI/CD Variables**:
- `AWS_ACCESS_KEY_ID` (unprotected, unmasked)
- `AWS_SECRET_ACCESS_KEY` (unprotected, masked)
- `DO_SPACES_BUCKET` (optional)
- `DO_SPACES_REGION` (optional)

### Commands

```bash
# Local testing
yarn test:e2e              # Run tests
yarn test:e2e:upload       # Upload report
yarn test:e2e:ci           # Run + upload

# API trigger
curl -X POST \
  --form token=YOUR_TOKEN \
  --form ref=main \
  "https://gitlab.com/api/v4/projects/YOUR_PROJECT_ID/trigger/pipeline"
```

### Available Trigger Variables

- `BASE_URL` - Test environment URL (default: from .gitlab-ci.yml)
- `BROWSER` - Browser to test: `chromium`, `firefox`, `webkit`, `all`
- `TEST_FILTER` - Filter which tests to run:
  - Specific file: `tests/home.spec.ts`
  - Folder: `tests/auth/`
  - Grep pattern: `-g 'login'`
  - Combined: `tests/home.spec.ts -g 'hero'`

---

**Setup complete!** 🎉

You now have a fully automated E2E testing pipeline that:
- ✅ Runs only when triggered via API
- ✅ Tests against any environment
- ✅ Uploads reports to DigitalOcean Spaces
- ✅ Provides public URLs for test results
- ✅ Integrates with GitLab CI/CD



