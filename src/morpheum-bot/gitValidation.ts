/**
 * Git operation validation utilities
 * 
 * This module provides validation and verification functions to ensure that
 * claimed git operations (commits, pushes, PR updates) actually occur.
 * 
 * Addresses the issue where agents claim to update PRs and provide commit hashes
 * but the changes aren't actually reflected in the repository.
 */

import { execa } from 'execa';
import * as fs from 'fs/promises';

export interface GitStatus {
  hasUnstagedChanges: boolean;
  hasUncommittedChanges: boolean;
  hasUntrackedFiles: boolean;
  currentBranch: string;
  ahead: number;
  behind: number;
  lastCommitHash: string;
  lastCommitMessage: string;
}

export interface ValidationResult {
  success: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * Get current git status of the repository
 */
export async function getGitStatus(workingDir: string = process.cwd()): Promise<GitStatus> {
  try {
    // Get current branch
    const { stdout: branch } = await execa('git', ['branch', '--show-current'], { cwd: workingDir });
    
    // Get status info
    const { stdout: statusOutput } = await execa('git', ['status', '--porcelain'], { cwd: workingDir });
    
    // Check for ahead/behind
    const { stdout: aheadBehind } = await execa('git', ['rev-list', '--left-right', '--count', `origin/${branch}...HEAD`], { cwd: workingDir }).catch(() => ({ stdout: '0\t0' }));
    const [behind, ahead] = aheadBehind.split('\t').map(n => parseInt(n, 10));
    
    // Get last commit info
    const { stdout: lastCommit } = await execa('git', ['log', '-1', '--format=%H'], { cwd: workingDir });
    const { stdout: lastMessage } = await execa('git', ['log', '-1', '--format=%s'], { cwd: workingDir });
    
    // Parse status
    const lines = statusOutput.split('\n').filter(line => line.trim());
    const hasUnstagedChanges = lines.some(line => line[1] !== ' ');
    const hasUncommittedChanges = lines.some(line => line[0] !== '?');
    const hasUntrackedFiles = lines.some(line => line.startsWith('??'));
    
    return {
      hasUnstagedChanges,
      hasUncommittedChanges,
      hasUntrackedFiles,
      currentBranch: branch.trim(),
      ahead,
      behind,
      lastCommitHash: lastCommit.trim(),
      lastCommitMessage: lastMessage.trim()
    };
  } catch (error) {
    throw new Error(`Failed to get git status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate that a commit with the given hash exists
 */
export async function validateCommitExists(commitHash: string, workingDir: string = process.cwd()): Promise<boolean> {
  try {
    await execa('git', ['cat-file', '-e', commitHash], { cwd: workingDir });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that changes have been properly committed and pushed
 */
export async function validateChangesCommitted(workingDir: string = process.cwd()): Promise<ValidationResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  try {
    const status = await getGitStatus(workingDir);
    
    // Check for uncommitted changes
    if (status.hasUnstagedChanges) {
      issues.push('There are unstaged changes that have not been committed');
    }
    
    if (status.hasUncommittedChanges) {
      warnings.push('There are staged changes that may need to be committed');
    }
    
    if (status.hasUntrackedFiles) {
      warnings.push('There are untracked files that may need to be added');
    }
    
    // Check if local branch is ahead of remote (unpushed commits)
    if (status.ahead > 0) {
      warnings.push(`Local branch is ${status.ahead} commit(s) ahead of remote - changes may not be visible in PR`);
    }
    
    return {
      success: issues.length === 0,
      issues,
      warnings
    };
  } catch (error) {
    issues.push(`Failed to validate git state: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      issues,
      warnings
    };
  }
}

/**
 * Validate that a claim about git operations is accurate
 */
export async function validateGitOperationClaim(
  claimedCommitHash?: string,
  claimedChanges?: string[],
  workingDir: string = process.cwd()
): Promise<ValidationResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  try {
    const status = await getGitStatus(workingDir);
    
    // If a commit hash is claimed, verify it exists
    if (claimedCommitHash) {
      const commitExists = await validateCommitExists(claimedCommitHash, workingDir);
      if (!commitExists) {
        issues.push(`Claimed commit hash ${claimedCommitHash} does not exist in repository`);
      } else {
        // Check if this is actually the latest commit
        if (status.lastCommitHash !== claimedCommitHash) {
          warnings.push(`Claimed commit ${claimedCommitHash} exists but is not the latest commit (latest: ${status.lastCommitHash})`);
        }
      }
    }
    
    // If file changes are claimed, verify they exist
    if (claimedChanges && claimedChanges.length > 0) {
      for (const file of claimedChanges) {
        try {
          await fs.access(file);
        } catch {
          warnings.push(`Claimed changed file ${file} does not exist or is not accessible`);
        }
      }
    }
    
    // Basic git state validation (inline instead of calling validateChangesCommitted to avoid double getGitStatus)
    if (status.hasUnstagedChanges) {
      issues.push('There are unstaged changes that have not been committed');
    }
    
    if (status.hasUncommittedChanges) {
      warnings.push('There are staged changes that may need to be committed');
    }
    
    if (status.hasUntrackedFiles) {
      warnings.push('There are untracked files that may need to be added');
    }
    
    // Check if local branch is ahead of remote (unpushed commits)
    if (status.ahead > 0) {
      warnings.push(`Local branch is ${status.ahead} commit(s) ahead of remote - changes may not be visible in PR`);
    }
    
    return {
      success: issues.length === 0,
      issues,
      warnings
    };
  } catch (error) {
    issues.push(`Failed to validate git operation claim: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      issues,
      warnings
    };
  }
}

/**
 * Generate a warning message for agents making false claims
 */
export function generateValidationWarning(validation: ValidationResult, operation: string): string {
  if (validation.success && validation.warnings.length === 0) {
    return '';
  }
  
  let warning = `⚠️  **Git Operation Validation Warning**\n\n`;
  warning += `The claimed ${operation} operation may not have completed successfully:\n\n`;
  
  if (validation.issues.length > 0) {
    warning += `**Issues (operation likely failed):**\n`;
    validation.issues.forEach(issue => {
      warning += `- ${issue}\n`;
    });
    warning += '\n';
  }
  
  if (validation.warnings.length > 0) {
    warning += `**Warnings (operation may be incomplete):**\n`;
    validation.warnings.forEach(warn => {
      warning += `- ${warn}\n`;
    });
    warning += '\n';
  }
  
  warning += `This validation check was added to prevent false claims about PR updates. `;
  warning += `Please verify that the intended changes are actually reflected in the repository.`;
  
  return warning;
}