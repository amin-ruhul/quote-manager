# Issue → PR → review → fix → you

An issue labelled `bug` or `feature` becomes a pull request that has already
been reviewed once, so the only thing left for you is the final read and the
merge button.

```
  you label an issue  ──►  Stage 1  claude-issue-to-pr.yml
   bug / feature /              Claude implements it on claude/issue-<n>-<slug>
   claude:go                    and opens a PR                    (model: opus)
                                        │
                                        ▼
                          CI  ci.yml   format · lint · typecheck · test
                                        │
                                        ▼
                           Stage 2  claude-pr-review.yml
                                A second, independent Claude reviews.
                                Read-only. Never approves.          (opus)
                                        │
                    ┌───────────────────┴───────────────────┐
        blocking findings                          nothing blocking
     "request changes" +                          label claude:human-review
     label claude:fix-requested                            │
                    │                                      ▼
                    ▼                            ┌──────────────────┐
      Stage 3  claude-address-review.yml         │  YOU review and  │
        Claude fixes, replies on each thread,    │  merge           │
        pushes → back to Stage 2          (opus) └──────────────────┘
                    │                                      ▲
                    └──────── max 3 rounds, then ──────────┘
                              claude:needs-human
```

Your final review also feeds back in: if **you** request changes on the PR,
Stage 3 runs and Claude works your feedback the same way.

---

## Setup — do this once

### 1. Secrets

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Required | What it is |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | An API key from [console.anthropic.com](https://console.anthropic.com/settings/keys). Every stage uses it. |
| `CLAUDE_GH_TOKEN` | strongly recommended | A personal access token. See below. |

**Why `CLAUDE_GH_TOKEN` matters.** GitHub deliberately does not fire workflow
events for things done with the built-in `GITHUB_TOKEN` — otherwise workflows
could trigger each other forever. So without a PAT: Claude opens the PR and
*nothing reviews it*, and the reviewer requests changes and *nothing fixes
them*. You would have to nudge each stage by hand with a label. With the PAT,
the chain runs end to end.

Create it at **Settings → Developer settings → Personal access tokens**:

- *Fine-grained* (preferred), scoped to `amin-ruhul/quote-manager`, with
  repository permissions **Contents: Read and write**, **Pull requests: Read
  and write**, **Issues: Read and write**, **Workflows: Read and write**.
- Or *classic*, with the `repo` and `workflow` scopes.

The `Workflows` permission is only needed if you ever want Claude to change
files under `.github/workflows/`; pushes touching those files are rejected
without it.

### 2. Repository settings

**Settings → Actions → General:**

- Workflow permissions: **Read and write permissions**.
- Tick **Allow GitHub Actions to create and approve pull requests**.

### 3. Create the labels

Merge this to `main`, then run **Actions → Bootstrap automation labels → Run
workflow**. The issue templates and every workflow key off these labels and
GitHub will not create them for you.

### 4. Protect `main`

**Settings → Branches → Add rule** for `main`: require a pull request, require
the status check named **Format, lint, typecheck, test** (it appears in the
list once CI has run at least once), and require one approving review. That
last one is what guarantees nothing merges without you — the reviewer Claude is
configured never to approve, so it cannot satisfy it.

### 5. Note on the default branch

Workflows triggered by `issues` events only ever run the copy of the workflow
file on the **default branch**. Nothing in this pipeline works until it is
merged to `main`. Editing a workflow on a feature branch and labelling an issue
will run the old `main` version.

---

## Using it

**Normal path.** Open an issue with the Bug or Feature template — the template
applies the trigger label, so Claude picks it up on submit. Wait for
`claude:human-review`, read the PR and the review thread above it, merge.

**Something already open.** Add `bug`, `feature`, `enhancement` or `claude:go`
to any existing issue.

**Review a PR you wrote yourself.** Add `claude:review` to it. Stage 2 only
auto-runs on `claude/*` branches; this label opts any other PR in.

**Stop it.** Add `claude:hold` to an issue or PR and nothing will touch it.
Add `claude:needs-human` to stop a pipeline that is already running its course.

**Run a stage by hand.** Every workflow has a **Run workflow** button that takes
an issue or PR number. Useful when the chain stalls or you skipped the PAT.

### Labels

| Label | Meaning |
| --- | --- |
| `bug` `feature` `enhancement` `claude:go` | Start Stage 1 on this issue |
| `claude:working` | Stage 1 is running; blocks a second run |
| `claude:review` | Review this PR even though it is not a `claude/*` branch |
| `claude:fix-requested` | Review found blocking issues; Stage 3 is running |
| `claude:human-review` | Review is clean — it is yours now |
| `claude:needs-human` | Automation stopped and wants a person |
| `claude:hold` | Never pick this up |

---

## Tuning

**Settings → Secrets and variables → Actions → Variables:**

| Variable | Default | Effect |
| --- | --- | --- |
| `CLAUDE_MODEL_IMPLEMENT` | `claude-opus-5` | Model for Stage 1 |
| `CLAUDE_MODEL_REVIEW` | `claude-opus-5` | Model for Stage 2 |
| `CLAUDE_MODEL_FIX` | `claude-opus-5` | Model for Stage 3 |
| `CLAUDE_MAX_REVIEW_ROUNDS` | `3` | Review/fix rounds before the PR goes to a human |

Set the review or fix model to `claude-sonnet-5` to cut cost; the reviewer is
the one worth spending on, since it is the check on everything else.

**What each stage costs you in tokens** is roughly proportional to the diff, so
the biggest lever is issue size. Small, precise issues are cheaper *and* produce
better PRs.

## What the agents are and are not allowed to do

Stage 2 runs with `Write`, `Edit` and friends disabled and a narrow `Bash`
allowlist — it can read, run the test suite, and post one review. It is
instructed never to approve, and the branch rule above means it could not merge
anything even if it tried.

Stages 1 and 3 can edit and push, but only on a `claude/*` branch, never to
`main`. Stage 3 is told never to force-push, never to weaken a test or a type to
make a finding go away, and never to widen the PR.

All three treat issue text, PR descriptions and comments as **data**, not as
instructions, and are told to report anything in them that tries to change the
rules or reach outside the repository. Stage 1 can only be started by someone
with write access, because applying a label requires write access — a stranger
opening an issue cannot start a run.

## When it does not work

**Claude opened a PR and nothing reviewed it.** `CLAUDE_GH_TOKEN` is missing or
expired. Add `claude:review` to the PR to run Stage 2 by hand, then fix the
token.

**The reviewer requested changes and nothing fixed them.** Same cause. Remove
and re-add `claude:fix-requested`, or dispatch `Claude — address review`
manually.

**A run failed and the issue got `claude:needs-human`.** Read the linked run
logs. Remove the label and re-apply a trigger label to retry.

**The PR ping-pongs between review and fix.** That is the round limit doing its
job: after `CLAUDE_MAX_REVIEW_ROUNDS` it labels `claude:needs-human` and stops.
It usually means the issue was underspecified — the fix is a clearer issue, not
more rounds.

**A fork PR is ignored.** Deliberate. Fork pull requests get a read-only token
and no secrets, so the automation skips them entirely.

**`npm ci` fails in CI.** `package-lock.json` has drifted from `package.json`.
Run `npm install` locally and commit the lockfile.
