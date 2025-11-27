# Jira to GitLab E2E Test Integration

Guide to trigger GitLab E2E tests from Jira using Jira Automation and Zephyr Scale.

---

## Overview

This integration allows you to:
- Trigger GitLab E2E tests directly from Jira issues
- Run tests when issue status changes (e.g., "Ready for Testing")
- Run specific tests based on Jira issue labels or custom fields
- Link test results back to Jira issues

---

## Prerequisites

- Jira Cloud or Data Center with Automation enabled
- Zephyr Scale plugin installed (optional, for test management)
- GitLab project with E2E tests configured
- GitLab trigger token (from Part 4.2 of GITLAB_E2E_SETUP.md)

---

## Method 1: Jira Automation with Webhook (Recommended)

### Step 1: Create Jira Automation Rule

1. Go to **Jira Settings → System → Automation**
2. Click **Create rule**
3. Choose a trigger (see options below)

#### Trigger Options:

**Option A: Manual Button**
- **Trigger**: Manual trigger
- **Name**: "Run E2E Tests"
- **Description**: "Trigger GitLab E2E tests for this issue"

**Option B: Status Change**
- **Trigger**: Issue transitioned
- **From status**: Any status
- **To status**: "Ready for Testing" (or your status)

**Option C: Label Added**
- **Trigger**: Field value changed
- **Field**: Labels
- **Change type**: Value added to field
- **Value**: "run-e2e-tests"

**Option D: Comment Trigger**
- **Trigger**: Issue commented
- **Comment contains**: "/run-tests"

### Step 2: Add Condition (Optional)

Add a condition to filter when tests should run:

1. Click **Add condition**
2. Choose **Issue fields condition**
3. Configure:
   - **Field**: Issue Type
   - **Condition**: equals
   - **Value**: Bug, Story, Task (select relevant types)

### Step 3: Add Webhook Action

1. Click **Add action**
2. Choose **Send web request**
3. Configure:

**Web request URL**:
```
https://gitlab.com/api/v4/projects/61956481/trigger/pipeline
```

**HTTP method**: `POST`

**Web request body**: `Custom data`

**Custom data** (Form data):
```
token=glptt-KNqkrPWTWFjheXxTyKpV
ref=main
```

**Headers**:
```
Content-Type: application/x-www-form-urlencoded
```

### Step 4: Add Variables (Optional)

To pass dynamic data from Jira to GitLab:

**Custom data** (with variables):
```
token=glptt-KNqkrPWTWFjheXxTyKpV
ref=main
variables[BASE_URL]=https://staging.beachrex.com
variables[BROWSER]=chromium
variables[JIRA_ISSUE]={{issue.key}}
```

### Step 5: Add Comment with Result (Optional)

1. Click **Add action**
2. Choose **Add comment**
3. **Comment**:
```
E2E tests triggered in GitLab.
View pipeline: [GitLab Pipeline|https://gitlab.com/your-username/your-project/-/pipelines]
Issue: {{issue.key}}
```

### Step 6: Save and Test

1. Click **Turn on rule**
2. Test by:
   - Clicking the manual button (if using manual trigger)
   - Changing issue status (if using status trigger)
   - Adding label (if using label trigger)
   - Adding comment `/run-tests` (if using comment trigger)

---

## Method 2: Advanced - Run Specific Tests Based on Jira Data

### Use Case: Run different tests based on issue type or labels

**Custom data with conditional logic**:

```
token=glptt-KNqkrPWTWFjheXxTyKpV
ref=main
variables[TEST_FILTER]={{#if(equals(issue.issueType.name, "Bug"))}}e2e/regression/{{else}}e2e/{{/if}}
variables[JIRA_ISSUE]={{issue.key}}
```

### Use Case: Run tests based on component

If your Jira issue has a component field:

```
token=glptt-KNqkrPWTWFjheXxTyKpV
ref=main
variables[TEST_FILTER]=e2e/{{issue.components.first.name}}/
variables[JIRA_ISSUE]={{issue.key}}
```

Examples:
- Component: "Authentication" → Runs `e2e/Authentication/` tests
- Component: "Search" → Runs `e2e/Search/` tests

### Use Case: Run tests based on custom field

If you have a custom field "Test Path":

```
token=glptt-KNqkrPWTWFjheXxTyKpV
ref=main
variables[TEST_FILTER]={{issue.customfield_10050}}
variables[JIRA_ISSUE]={{issue.key}}
```

---

## Method 3: Zephyr Scale Integration

### Option A: Manual Test Execution Trigger

1. In Zephyr Scale, create a **Test Cycle**
2. Add tests to the cycle
3. Create Jira Automation rule:
   - **Trigger**: Test execution status changed
   - **Condition**: Status = "Ready to Execute"
   - **Action**: Send webhook to GitLab

### Option B: Link Test Cases to Test Files

1. Create custom field in Jira: "E2E Test Path"
2. In each Zephyr test case, add the test file path:
   - Example: `e2e/beaches.spec.ts`
3. Create automation rule:
   - **Trigger**: Manual or status change
   - **Action**: Send webhook with `variables[TEST_FILTER]={{issue.customfield_xxxxx}}`

---

## Method 4: ScriptRunner (Jira Data Center)

If you have ScriptRunner installed:

### Create Custom Script

```groovy
import groovy.json.JsonBuilder
import com.atlassian.jira.component.ComponentAccessor
import org.apache.http.client.methods.HttpPost
import org.apache.http.impl.client.HttpClients
import org.apache.http.entity.StringEntity

def gitlabToken = "glptt-KNqkrPWTWFjheXxTyKpV"
def gitlabProjectId = "61956481"
def gitlabUrl = "https://gitlab.com/api/v4/projects/${gitlabProjectId}/trigger/pipeline"

def issueKey = issue.key
def testFilter = issue.getCustomFieldValue(customFieldManager.getCustomFieldObjectByName("E2E Test Path"))

def httpClient = HttpClients.createDefault()
def httpPost = new HttpPost(gitlabUrl)

def formData = "token=${gitlabToken}&ref=main"
if (testFilter) {
    formData += "&variables[TEST_FILTER]=${testFilter}"
}
formData += "&variables[JIRA_ISSUE]=${issueKey}"

httpPost.setEntity(new StringEntity(formData))
httpPost.setHeader("Content-Type", "application/x-www-form-urlencoded")

def response = httpClient.execute(httpPost)
def statusCode = response.getStatusLine().getStatusCode()

if (statusCode == 201) {
    return "E2E tests triggered successfully!"
} else {
    return "Failed to trigger tests. Status: ${statusCode}"
}
```

---

## Complete Example: Manual Button in Jira

### Automation Rule Configuration:

**Name**: Run E2E Tests

**Trigger**: Manual trigger
- Button label: "🧪 Run E2E Tests"
- Show button on: Issue view

**Condition**: Issue type is one of: Bug, Story, Task

**Action 1**: Send web request
- URL: `https://gitlab.com/api/v4/projects/61956481/trigger/pipeline`
- Method: POST
- Body: Custom data
- Data:
  ```
  token=glptt-KNqkrPWTWFjheXxTyKpV
  ref=main
  variables[JIRA_ISSUE]={{issue.key}}
  variables[BASE_URL]=https://staging.beachrex.com
  ```

**Action 2**: Add comment
- Comment:
  ```
  ✅ E2E tests triggered for {{issue.key}}
  
  View pipeline: https://gitlab.com/your-username/your-project/-/pipelines
  
  Tests will run against: https://staging.beachrex.com
  ```

**Action 3**: Transition issue (optional)
- Destination status: "Testing in Progress"

---

## Passing Test Results Back to Jira

### Option 1: Update via GitLab CI

Add to `.gitlab-ci.yml` after tests complete:

```yaml
after_script:
  - yarn test:e2e:upload || true
  # Update Jira issue
  - |
    if [ -n "$JIRA_ISSUE" ]; then
      JIRA_COMMENT="E2E tests completed. [View Report](${REPORT_URL})"
      curl -X POST \
        -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"body\": \"${JIRA_COMMENT}\"}" \
        "https://your-domain.atlassian.net/rest/api/3/issue/${JIRA_ISSUE}/comment"
    fi
```

### Option 2: Zephyr Scale API

Update test execution status in Zephyr:

```bash
curl -X POST \
  -H "Authorization: Bearer ${ZEPHYR_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectKey": "PROJ",
    "testCaseKey": "PROJ-T1",
    "statusName": "Pass",
    "executedById": "user-id",
    "comment": "Automated test passed in GitLab pipeline"
  }' \
  "https://api.zephyrscale.smartbear.com/v2/testexecutions"
```

---

## Troubleshooting

### Webhook fails with 401 Unauthorized
- Check GitLab trigger token is correct
- Verify token hasn't expired
- Ensure token has correct permissions

### Webhook fails with 404 Not Found
- Verify GitLab project ID is correct
- Check URL format: `https://gitlab.com/api/v4/projects/PROJECT_ID/trigger/pipeline`

### Tests don't run
- Check GitLab CI/CD pipeline logs
- Verify `.gitlab-ci.yml` rules allow trigger source
- Ensure `$CI_PIPELINE_SOURCE == "trigger"` is in rules

### Variables not passed correctly
- Use `variables[KEY]=value` format in form data
- Ensure proper URL encoding for special characters
- Check GitLab job logs to see received variables

---

## Security Best Practices

1. **Don't expose trigger token in comments**
   - Store token in Jira automation securely
   - Don't log token in comments or logs

2. **Use Jira secrets for sensitive data**
   - Store GitLab token as Jira secret
   - Reference as `{{secrets.GITLAB_TOKEN}}`

3. **Limit automation rule scope**
   - Only allow specific users/groups to trigger
   - Add conditions to prevent accidental triggers

4. **Audit trail**
   - Enable Jira audit logging
   - Monitor automation rule executions

---

## Summary

✅ **Jira Automation** - Best for simple triggers (status change, manual button)
✅ **Zephyr Scale** - Best for test management integration
✅ **ScriptRunner** - Best for complex logic (Jira Data Center only)
✅ **GitLab Webhooks** - Best for bidirectional integration

Choose the method that fits your workflow and Jira setup!

