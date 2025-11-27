# Quick Setup: Jira Button to Trigger GitLab Tests

**Goal**: Add a "Run E2E Tests" button to Jira issues that triggers GitLab pipeline.

---

## Step-by-Step Setup (5 minutes)

### Step 1: Go to Jira Automation

1. Click **⚙️ Settings** (top right)
2. Click **System**
3. Click **Automation** (left sidebar)
4. Click **Create rule** (top right)

---

### Step 2: Choose Trigger

1. Select **Manual trigger**
2. Click **New component**
3. Configure:
   - **Button label**: `🧪 Run E2E Tests`
   - **Show button on**: `Issue view`
4. Click **Save**

---

### Step 3: Add Condition (Optional but Recommended)

1. Click **Add condition**
2. Select **Issue fields condition**
3. Configure:
   - **Field**: `Issue Type`
   - **Condition**: `equals`
   - **Value**: Select `Bug`, `Story`, `Task` (or your types)
4. Click **Save**

---

### Step 4: Add Webhook Action

1. Click **Add action**
2. Select **Send web request**
3. Configure:

**Web request URL**:
```
https://gitlab.com/api/v4/projects/61956481/trigger/pipeline
```

**HTTP method**: Select `POST`

**Web request body**: Select `Custom data`

**Custom data**:
```
token=glptt-KNqkrPWTWFjheXxTyKpV
ref=main
variables[JIRA_ISSUE]={{issue.key}}
```

**Headers**: Leave empty (or add if needed):
```
Content-Type: application/x-www-form-urlencoded
```

4. Click **Save**

---

### Step 5: Add Success Comment (Optional)

1. Click **Add action**
2. Select **Add comment**
3. **Comment**:
```
✅ E2E tests triggered for {{issue.key}}

Pipeline: https://gitlab.com/your-username/your-project/-/pipelines

The test results will be available shortly.
```

4. Click **Save**

---

### Step 6: Name and Activate

1. **Rule name**: `Run E2E Tests from Jira`
2. Click **Turn it on**
3. Click **Publish**

---

## Testing Your Setup

1. Go to any Jira issue (Bug, Story, or Task)
2. You should see a button: **🧪 Run E2E Tests**
3. Click the button
4. Check:
   - ✅ Comment appears on the issue
   - ✅ GitLab pipeline starts (check GitLab → CI/CD → Pipelines)
   - ✅ Tests run successfully

---

## Advanced Configurations

### Run Specific Tests Based on Component

**Custom data**:
```
token=glptt-KNqkrPWTWFjheXxTyKpV
ref=main
variables[TEST_FILTER]=e2e/{{issue.components.first.name | lowercase}}.spec.ts
variables[JIRA_ISSUE]={{issue.key}}
```

**Example**:
- Component: "Beaches" → Runs `e2e/beaches.spec.ts`
- Component: "Search" → Runs `e2e/search.spec.ts`

---

### Run Tests on Specific Environment

**Custom data**:
```
token=glptt-KNqkrPWTWFjheXxTyKpV
ref=main
variables[BASE_URL]=https://staging.beachrex.com
variables[BROWSER]=chromium
variables[JIRA_ISSUE]={{issue.key}}
```

---

### Run Tests Only for Specific Labels

**Add condition**:
1. Click **Add condition**
2. Select **Issue fields condition**
3. Configure:
   - **Field**: `Labels`
   - **Condition**: `contains any of`
   - **Value**: `needs-e2e-testing`

Now the button only appears on issues with the `needs-e2e-testing` label.

---

### Multiple Buttons for Different Test Suites

Create separate automation rules:

**Rule 1: Smoke Tests**
- Button: `🔥 Run Smoke Tests`
- Custom data:
  ```
  token=glptt-KNqkrPWTWFjheXxTyKpV
  ref=main
  variables[TEST_FILTER]=-g 'smoke'
  variables[BROWSER]=chromium
  ```

**Rule 2: Full Regression**
- Button: `🧪 Run Full Regression`
- Custom data:
  ```
  token=glptt-KNqkrPWTWFjheXxTyKpV
  ref=main
  variables[JIRA_ISSUE]={{issue.key}}
  ```

**Rule 3: Component-Specific**
- Button: `🎯 Run Component Tests`
- Custom data:
  ```
  token=glptt-KNqkrPWTWFjheXxTyKpV
  ref=main
  variables[TEST_FILTER]=e2e/{{issue.components.first.name | lowercase}}/
  ```

---

## Automatic Triggers (No Button)

### Trigger on Status Change

**Trigger**: Issue transitioned
- **From status**: `In Progress`
- **To status**: `Ready for Testing`

**Action**: Send web request (same as above)

Now tests run automatically when you move an issue to "Ready for Testing"!

---

### Trigger on Comment

**Trigger**: Issue commented
- **Comment contains**: `/run-tests`

**Action**: Send web request (same as above)

Now you can trigger tests by commenting `/run-tests` on any issue!

---

## Troubleshooting

### Button doesn't appear
- Check the condition (Issue Type, Labels, etc.)
- Verify rule is turned on
- Refresh the Jira issue page

### Button appears but nothing happens
- Check Jira Automation audit log: **Settings → System → Automation → Audit log**
- Look for errors in the webhook execution
- Verify GitLab trigger token is correct

### Pipeline doesn't start in GitLab
- Check GitLab project ID is correct
- Verify trigger token hasn't expired
- Check `.gitlab-ci.yml` has correct rules:
  ```yaml
  rules:
    - if: $CI_PIPELINE_SOURCE == "trigger"
      when: on_success
  ```

### Tests run but wrong tests execute
- Check `TEST_FILTER` variable in custom data
- Verify test file paths are correct
- Check GitLab job logs to see what command was executed

---

## What You Get

✅ **Manual button** in Jira to trigger tests
✅ **Automatic comment** with pipeline link
✅ **Jira issue key** passed to GitLab (for linking results back)
✅ **Flexible filtering** (specific tests, browsers, environments)
✅ **Audit trail** in Jira automation logs

---

## Next Steps

1. **Link results back to Jira**: See `JIRA_GITLAB_INTEGRATION.md` for how to post test results back to Jira
2. **Zephyr integration**: Link test executions to Zephyr test cases
3. **Custom fields**: Add "Test Path" field to Jira for dynamic test selection
4. **Notifications**: Add Slack/email notifications when tests complete

---

## Your Configuration

Replace these values with your actual data:

| Variable | Your Value | Where to Find |
|----------|------------|---------------|
| GitLab Project ID | `61956481` | GitLab project page (under project name) |
| GitLab Trigger Token | `glptt-KNqkrPWTWFjheXxTyKpV` | GitLab → Settings → CI/CD → Pipeline triggers |
| GitLab Username | `your-username` | Your GitLab username |
| GitLab Project Name | `your-project` | Your GitLab project name |
| Jira Domain | `your-domain.atlassian.net` | Your Jira URL |

---

**Setup complete!** 🎉

You can now trigger GitLab E2E tests directly from Jira issues with a single click!

