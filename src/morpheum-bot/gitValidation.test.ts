import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { execa } from 'execa';
import * as fs from 'fs/promises';
import {
  getGitStatus,
  validateCommitExists,
  validateChangesCommitted,
  validateGitOperationClaim,
  generateValidationWarning,
  type GitStatus,
  type ValidationResult
} from './gitValidation';

// Mock external dependencies
vi.mock('execa');
vi.mock('fs/promises');

const mockedExeca = execa as Mock;
const mockedFsAccess = fs.access as Mock;

describe('Git Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGitStatus', () => {
    it('should return git status information', async () => {
      // Mock git commands - format: XY filename where X=staged, Y=working tree
      mockedExeca
        .mockResolvedValueOnce({ stdout: 'main' }) // branch
        .mockResolvedValueOnce({ stdout: 'M  file1.ts\n M file2.ts\n?? file3.ts' }) // status: staged, unstaged, untracked
        .mockResolvedValueOnce({ stdout: '1\t2' }) // ahead/behind
        .mockResolvedValueOnce({ stdout: 'abc123' }) // last commit hash
        .mockResolvedValueOnce({ stdout: 'Fix issue' }); // last commit message

      const status = await getGitStatus('/test/dir');

      expect(status).toEqual({
        hasUnstagedChanges: true,  // second character M means unstaged changes
        hasUncommittedChanges: true, // first character M means staged changes
        hasUntrackedFiles: true,  // ?? means untracked
        currentBranch: 'main',
        ahead: 2,
        behind: 1,
        lastCommitHash: 'abc123',
        lastCommitMessage: 'Fix issue'
      });

      expect(mockedExeca).toHaveBeenCalledWith('git', ['branch', '--show-current'], { cwd: '/test/dir' });
      expect(mockedExeca).toHaveBeenCalledWith('git', ['status', '--porcelain'], { cwd: '/test/dir' });
    });

    it('should handle git command failures gracefully', async () => {
      mockedExeca.mockRejectedValue(new Error('Git command failed'));

      await expect(getGitStatus()).rejects.toThrow('Failed to get git status: Git command failed');
    });
  });

  describe('validateCommitExists', () => {
    it('should return true if commit exists', async () => {
      mockedExeca.mockResolvedValue({ stdout: '' });

      const exists = await validateCommitExists('abc123');

      expect(exists).toBe(true);
      expect(mockedExeca).toHaveBeenCalledWith('git', ['cat-file', '-e', 'abc123'], { cwd: process.cwd() });
    });

    it('should return false if commit does not exist', async () => {
      mockedExeca.mockRejectedValue(new Error('Not found'));

      const exists = await validateCommitExists('invalid');

      expect(exists).toBe(false);
    });
  });

  describe('validateChangesCommitted', () => {
    it('should report success when repository is clean', async () => {
      // Mock clean repository
      mockedExeca
        .mockResolvedValueOnce({ stdout: 'main' })
        .mockResolvedValueOnce({ stdout: '' }) // clean status
        .mockResolvedValueOnce({ stdout: '0\t0' })
        .mockResolvedValueOnce({ stdout: 'abc123' })
        .mockResolvedValueOnce({ stdout: 'Last commit' });

      const result = await validateChangesCommitted();

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should report issues when there are unstaged changes', async () => {
      // Mock repository with unstaged changes
      mockedExeca
        .mockResolvedValueOnce({ stdout: 'main' })
        .mockResolvedValueOnce({ stdout: ' M file.ts' }) // unstaged change
        .mockResolvedValueOnce({ stdout: '0\t0' })
        .mockResolvedValueOnce({ stdout: 'abc123' })
        .mockResolvedValueOnce({ stdout: 'Last commit' });

      const result = await validateChangesCommitted();

      expect(result.success).toBe(false);
      expect(result.issues).toContain('There are unstaged changes that have not been committed');
    });

    it('should report warnings when local branch is ahead', async () => {
      // Mock repository that's ahead of remote
      mockedExeca
        .mockResolvedValueOnce({ stdout: 'main' })
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({ stdout: '0\t2' }) // 2 commits ahead
        .mockResolvedValueOnce({ stdout: 'abc123' })
        .mockResolvedValueOnce({ stdout: 'Last commit' });

      const result = await validateChangesCommitted();

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Local branch is 2 commit(s) ahead of remote - changes may not be visible in PR');
    });
  });

  describe('validateGitOperationClaim', () => {
    it('should validate claimed commit hash exists', async () => {
      // Mock getGitStatus calls first
      mockedExeca
        .mockResolvedValueOnce({ stdout: 'main' })    // branch
        .mockResolvedValueOnce({ stdout: '' })        // status  
        .mockResolvedValueOnce({ stdout: '0\t0' })    // ahead/behind
        .mockResolvedValueOnce({ stdout: 'abc123' })  // last commit hash
        .mockResolvedValueOnce({ stdout: 'Last commit' }) // last commit message
        .mockResolvedValueOnce({ stdout: '' });       // cat-file success

      const result = await validateGitOperationClaim('abc123');

      expect(result.success).toBe(true);
      expect(mockedExeca).toHaveBeenCalledWith('git', ['cat-file', '-e', 'abc123'], { cwd: process.cwd() });
    });

    it('should report issues when claimed commit does not exist', async () => {
      // Mock getGitStatus calls first
      mockedExeca
        .mockResolvedValueOnce({ stdout: 'main' })    // branch
        .mockResolvedValueOnce({ stdout: '' })        // status  
        .mockResolvedValueOnce({ stdout: '0\t0' })    // ahead/behind
        .mockResolvedValueOnce({ stdout: 'abc123' })  // last commit hash
        .mockResolvedValueOnce({ stdout: 'Last commit' }) // last commit message
        .mockRejectedValueOnce(new Error('Not found')); // cat-file fails

      const result = await validateGitOperationClaim('invalid123');

      expect(result.success).toBe(false);
      expect(result.issues).toContain('Claimed commit hash invalid123 does not exist in repository');
    });

    it('should validate claimed file changes exist', async () => {
      // Mock getGitStatus calls first
      mockedExeca
        .mockResolvedValueOnce({ stdout: 'main' })    // branch
        .mockResolvedValueOnce({ stdout: '' })        // status  
        .mockResolvedValueOnce({ stdout: '0\t0' })    // ahead/behind
        .mockResolvedValueOnce({ stdout: 'abc123' })  // last commit hash
        .mockResolvedValueOnce({ stdout: 'Last commit' }); // last commit message

      mockedFsAccess.mockResolvedValue(undefined); // File exists

      const result = await validateGitOperationClaim(undefined, ['src/test.ts']);

      expect(result.success).toBe(true);
      expect(mockedFsAccess).toHaveBeenCalledWith('src/test.ts');
    });

    it('should warn when claimed files do not exist', async () => {
      // Mock getGitStatus calls first
      mockedExeca
        .mockResolvedValueOnce({ stdout: 'main' })    // branch
        .mockResolvedValueOnce({ stdout: '' })        // status  
        .mockResolvedValueOnce({ stdout: '0\t0' })    // ahead/behind
        .mockResolvedValueOnce({ stdout: 'abc123' })  // last commit hash
        .mockResolvedValueOnce({ stdout: 'Last commit' }); // last commit message

      mockedFsAccess.mockRejectedValue(new Error('File not found')); // File doesn't exist

      const result = await validateGitOperationClaim(undefined, ['nonexistent.ts']);

      expect(result.success).toBe(true); // Still success, but with warnings
      expect(result.warnings).toContain('Claimed changed file nonexistent.ts does not exist or is not accessible');
    });
  });

  describe('generateValidationWarning', () => {
    it('should return empty string for successful validation with no warnings', () => {
      const validation: ValidationResult = {
        success: true,
        issues: [],
        warnings: []
      };

      const warning = generateValidationWarning(validation, 'commit');

      expect(warning).toBe('');
    });

    it('should generate warning message for failed validation', () => {
      const validation: ValidationResult = {
        success: false,
        issues: ['Unstaged changes exist'],
        warnings: ['Local branch is ahead']
      };

      const warning = generateValidationWarning(validation, 'commit');

      expect(warning).toContain('**Git Operation Validation Warning**');
      expect(warning).toContain('commit operation may not have completed successfully');
      expect(warning).toContain('Unstaged changes exist');
      expect(warning).toContain('Local branch is ahead');
      expect(warning).toContain('prevent false claims about PR updates');
    });

    it('should generate warning for successful validation with warnings only', () => {
      const validation: ValidationResult = {
        success: true,
        issues: [],
        warnings: ['Some warning']
      };

      const warning = generateValidationWarning(validation, 'push');

      expect(warning).toContain('push operation may not have completed successfully');
      expect(warning).toContain('Some warning');
      expect(warning).not.toContain('**Issues');
    });
  });
});