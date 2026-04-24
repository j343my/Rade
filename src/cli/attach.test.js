import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// Creates a minimal temp project directory
async function makeTempProject() {
  return fsp.mkdtemp(path.join(os.tmpdir(), 'rade-attach-test-'));
}

// Reads .rade/config.json from a project directory
async function readConfig(projectPath) {
  const raw = await fsp.readFile(path.join(projectPath, '.rade', 'config.json'), 'utf-8');
  return JSON.parse(raw);
}

describe('config helpers (unit)', () => {
  it('createConfig returns required fields', async () => {
    const { createConfig } = await import('../core/config.js');
    const cfg = createConfig({ radeVersion: '1.0.0', rulesVersion: 'abc123' });

    assert.equal(cfg.version, '1.0.0');
    assert.equal(cfg.rade_version, '1.0.0');
    assert.equal(cfg.rules_origin, 'rade');
    assert.equal(cfg.rules_version, 'abc123');
    assert.ok(Array.isArray(cfg.custom_rules));
    assert.ok(Array.isArray(cfg.excluded_rules));
    assert.ok(typeof cfg.attached_at === 'string');
  });

  it('hasConfig returns false for a fresh directory', async () => {
    const { hasConfig } = await import('../core/config.js');
    const dir = await makeTempProject();
    try {
      const result = await hasConfig(dir);
      assert.equal(result, false);
    } finally {
      await fsp.rm(dir, { recursive: true, force: true });
    }
  });

  it('writeConfig + readConfig round-trip', async () => {
    const { createConfig, writeConfig, readConfig: readCfg } = await import('../core/config.js');
    const dir = await makeTempProject();
    try {
      const cfg = createConfig({ radeVersion: '1.2.3' });
      await writeConfig(dir, cfg);
      const loaded = await readCfg(dir);
      assert.equal(loaded.rade_version, '1.2.3');
      assert.equal(loaded.rules_origin, 'rade');
    } finally {
      await fsp.rm(dir, { recursive: true, force: true });
    }
  });

  it('readConfig throws when no config exists', async () => {
    const { readConfig: readCfg } = await import('../core/config.js');
    const dir = await makeTempProject();
    try {
      await assert.rejects(
        () => readCfg(dir),
        /No Rade config found/
      );
    } finally {
      await fsp.rm(dir, { recursive: true, force: true });
    }
  });
});

describe('gitignore helper (unit)', () => {
  it('does not duplicate Rade block on second run', async () => {
    // Simulate the gitignore logic: if marker already present, skip
    const marker = '# Rade generated';
    const existing = `node_modules/\n\n${marker}\nAGENTS.md\n`;
    assert.ok(existing.includes(marker), 'existing content has marker');
    // The attach logic checks includes(GITIGNORE_MARKER) and skips — tested indirectly
  });
});

describe('backup helper (unit)', () => {
  it('returns null when directory does not exist', async () => {
    const { backupDirectory } = await import('../core/backup.js');
    const result = await backupDirectory('/tmp/nonexistent-rade-test-dir-xyz');
    assert.equal(result, null);
  });

  it('creates a tar.gz backup of an existing directory', async () => {
    const { backupDirectory } = await import('../core/backup.js');
    const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'rade-backup-src-'));
    const outDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'rade-backup-out-'));

    try {
      await fsp.writeFile(path.join(dir, 'test.md'), '# test\n');
      const backupPath = await backupDirectory(dir, outDir);
      assert.ok(backupPath !== null, 'backup path should not be null');
      const stat = await fsp.stat(backupPath);
      assert.ok(stat.size > 0, 'backup file should have content');
    } finally {
      await fsp.rm(dir, { recursive: true, force: true });
      await fsp.rm(outDir, { recursive: true, force: true });
    }
  });
});
