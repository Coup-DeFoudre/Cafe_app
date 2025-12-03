# GitHub CI/CD Setup Guide

This guide will help you set up GitHub branch protection rules and configure the CI/CD pipeline for the Cafe Ordering System.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Branch Protection Setup](#branch-protection-setup)
3. [GitHub Actions Workflows](#github-actions-workflows)
4. [Testing the Setup](#testing-the-setup)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before setting up branch protection, ensure:

- ✅ You have **Admin** access to the GitHub repository
- ✅ Repository has at least one commit on the `master` branch
- ✅ Team member `@Coup-DeFoudre` has access to the repository
- ✅ All team members have been added as collaborators

---

## 🛡️ Branch Protection Setup

### Step 1: Navigate to Branch Protection Settings

1. Go to your GitHub repository
2. Click on **Settings** (top menu bar)
3. In the left sidebar, click **Branches** (under "Code and automation")
4. Click **Add branch protection rule** button

### Step 2: Configure Branch Protection Rule

#### A. Branch Name Pattern
```
master
```
Enter `master` in the "Branch name pattern" field.

#### B. Protect Matching Branches - Enable These Settings:

**✅ Require a pull request before merging**
- Check this box
- Then enable: **Require approvals**
  - Set "Required number of approvals before merging" to: **1**
- Enable: **Dismiss stale pull request approvals when new commits are pushed**
- Enable: **Require review from Code Owners** (This uses the CODEOWNERS file we created)

**✅ Require status checks to pass before merging**
- Check this box
- Enable: **Require branches to be up to date before merging**
- In the search box, add these status checks (they will appear after first PR):
  - `Validate Pull Request` (from pr-validation.yml)
  - `Auto Label PR` (from pr-labeler.yml)

**✅ Require conversation resolution before merging**
- Check this box (ensures all review comments are addressed)

**✅ Do not allow bypassing the above settings**
- Check this box (even admins must follow the rules)

#### C. Additional Settings (Optional but Recommended)

**✅ Require linear history**
- Prevents merge commits, keeps history clean

**✅ Include administrators**
- Applies these rules to repository administrators too

### Step 3: Save the Rule

Click **Create** or **Save changes** at the bottom of the page.

---

## 🚀 GitHub Actions Workflows

### Workflows Included

We've created the following GitHub Actions workflows:

#### 1. **PR Validation Workflow** (`.github/workflows/pr-validation.yml`)

**Triggers on:**
- New pull requests to `master`
- Updates to existing pull requests

**Checks performed:**
- ✅ ESLint code quality check
- ✅ TypeScript type checking
- ✅ Prisma schema validation
- ✅ Prisma client generation
- ✅ Next.js build verification

**Result:** If any check fails, the PR is blocked from merging.

#### 2. **PR Auto Labeler** (`.github/workflows/pr-labeler.yml`)

**What it does:**
- Automatically adds labels based on changed files
- Labels include:
  - `🎨 frontend` - UI/component changes
  - `⚙️ backend` - API/server changes
  - `🗄️ database` - Prisma schema changes
  - `📝 docs` - Documentation
  - `🛒 orders` - Order system changes
  - `🍽️ menu` - Menu management
  - And more...
- Adds size labels: `size/xs`, `size/s`, `size/m`, `size/l`, `size/xl`

### CODEOWNERS File

The `.github/CODEOWNERS` file ensures:
- All PRs require approval from **@Coup-DeFoudre**
- Special attention for critical files (database, API, config)

### PR Template

New pull requests will automatically use the template from `.github/pull_request_template.md`, which includes:
- Description section
- Type of change checklist
- Testing checklist
- Screenshots section
- Database changes section
- Reviewer checklist

---

## 🧪 Testing the Setup

### Test 1: Create a Test PR

1. **Create a new branch:**
   ```bash
   git checkout master
   git pull origin master
   git checkout -b test/ci-cd-setup
   ```

2. **Make a small change:**
   ```bash
   # For example, add a comment to README.md
   echo "# Test CI/CD" >> README.md
   git add README.md
   git commit -m "test: CI/CD pipeline setup"
   git push origin test/ci-cd-setup
   ```

3. **Create Pull Request on GitHub:**
   - Go to your repository on GitHub
   - Click "Compare & pull request"
   - Fill out the PR template
   - Click "Create pull request"

4. **Observe the Checks:**
   - You should see workflows running
   - Wait for all checks to complete
   - Labels should be automatically added

5. **Test Approval Process:**
   - Try to merge without approval (should be blocked)
   - Request review from @Coup-DeFoudre
   - After approval, merge should be allowed

### Test 2: Verify Failed Checks Block Merge

1. **Create a branch with intentional errors:**
   ```bash
   git checkout -b test/failing-checks
   ```

2. **Add TypeScript error:**
   Create a file with a type error:
   ```typescript
   // src/test-error.ts
   const test: string = 123; // Type error
   ```

3. **Push and create PR:**
   ```bash
   git add .
   git commit -m "test: intentional type error"
   git push origin test/failing-checks
   ```

4. **Verify:**
   - GitHub Actions should fail
   - PR should be blocked from merging
   - Red X should appear on the PR

5. **Clean up:**
   - Delete the test file
   - Push the fix
   - Verify checks pass

---

## 🎯 Workflow for Team Members

### Creating a Pull Request

1. **Create feature branch:**
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   git push origin feature/your-feature-name
   ```

3. **Before creating PR, run local checks:**
   ```bash
   npm run validate  # Runs lint + type-check
   npm run build     # Verifies build works
   ```

4. **Create Pull Request on GitHub:**
   - Go to repository → Pull requests → New pull request
   - Select your branch
   - Fill out the PR template completely
   - Create pull request

5. **Wait for Automated Checks:**
   - All GitHub Actions workflows will run automatically
   - Fix any issues if checks fail

6. **Request Review:**
   - GitHub will automatically request review from @Coup-DeFoudre
   - Wait for approval

7. **Merge:**
   - Once approved and all checks pass, click "Merge pull request"
   - Choose "Squash and merge" or "Merge" as appropriate
   - Delete the branch after merging

---

## 🔍 Troubleshooting

### Issue: GitHub Actions not running

**Solution:**
- Ensure workflows are in `.github/workflows/` directory
- Check workflow syntax using GitHub's workflow validator
- Verify repository has Actions enabled (Settings → Actions)

### Issue: CODEOWNERS not working

**Possible causes:**
- File must be in `.github/CODEOWNERS` (exact path)
- User @Coup-DeFoudre must have write access to repository
- "Require review from Code Owners" must be enabled in branch protection

**Solution:**
1. Verify file path: `.github/CODEOWNERS`
2. Check user has correct permissions
3. Re-save branch protection rules

### Issue: Status checks not showing up

**Solution:**
- Status checks appear only after workflows run at least once
- Create a test PR to trigger workflows
- Then add the status check names to branch protection

### Issue: Can't merge even with approval

**Check:**
- All required status checks must pass (green checkmarks)
- All conversations must be resolved
- Branch must be up to date with master
- At least 1 approval from code owner

### Issue: Build fails in CI but works locally

**Common causes:**
- Missing environment variables (already handled with dummy values)
- Different Node.js version
- Cache issues

**Solution:**
```bash
# Clear local cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Available Scripts

After setup, use these npm scripts:

```bash
# Development
npm run dev              # Start development server

# Type checking
npm run type-check       # Check TypeScript types without building
npm run lint             # Run ESLint
npm run validate         # Run both lint and type-check

# Building
npm run build            # Build for production

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
```

---

## ✅ Verification Checklist

After completing setup, verify:

- [ ] Branch protection rule created for `master` branch
- [ ] Require 1 approval before merging is enabled
- [ ] Require review from Code Owners is enabled
- [ ] Require status checks is enabled
- [ ] Status check "Validate Pull Request" is added
- [ ] @Coup-DeFoudre is added as repository collaborator
- [ ] Test PR created and workflows run successfully
- [ ] Test PR shows auto-applied labels
- [ ] Test PR requires approval before merge
- [ ] Failed checks block merge
- [ ] All team members understand the workflow

---

## 🎉 Success!

Your GitHub CI/CD pipeline is now set up! Your team can now:

✅ Work on separate branches safely
✅ All code changes are automatically validated
✅ Team leader reviews all changes before merge
✅ Master branch is protected from bad code
✅ PRs are automatically labeled and organized

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs for detailed error messages
3. Ensure all prerequisites are met
4. Verify branch protection settings match this guide

---

**Next Steps (Future Phases):**
- Phase 2: Add unit tests and test automation
- Phase 3: Set up continuous deployment
- Phase 4: Configure Docker and DevOps infrastructure
