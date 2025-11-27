#!/usr/bin/env node
// 基于 git log 的简易 Conventional Commits CHANGELOG 生成器
// 追加最新未发布的提交到 CHANGELOG.md 顶部

const { execSync } = require('child_process');
const { readFileSync, writeFileSync, existsSync } = require('fs');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function getTags() {
  const out = sh('git tag --list --sort=-creatordate');
  return out ? out.split(/\n/).filter(Boolean) : [];
}

function getCommits(sinceTag) {
  const range = sinceTag ? `${sinceTag}..HEAD` : 'HEAD';
  const format = '%H|%s';
  const out = sh(`git log ${range} --pretty=format:${format}`);
  return out ? out.split(/\n/).filter(Boolean).map(line => {
    const [hash, subject] = line.split('|');
    return { hash, subject };
  }) : [];
}

function classify(subject) {
  // Conventional Commits 前缀解析
  const m = subject.match(/^(feat|fix|docs|refactor|chore|test|perf|style)(\([^)]*\))?:/);
  return m ? m[1] : 'other';
}

function buildSections(commits) {
  const groups = {};
  for (const c of commits) {
    const type = classify(c.subject);
    if (!groups[type]) groups[type] = [];
    groups[type].push(c);
  }
  const order = ['feat','fix','perf','refactor','docs','test','style','chore','other'];
  return order.filter(k => groups[k]).map(k => ({ type: k, items: groups[k] }));
}

function formatSection(sec) {
  const titles = {
    feat: '### 新增',
    fix: '### 修复',
    perf: '### 性能',
    refactor: '### 重构',
    docs: '### 文档',
    test: '### 测试',
    style: '### 风格',
    chore: '### 杂项',
    other: '### 其他'
  };
  const header = titles[sec.type] || '### 其他';
  const lines = sec.items.map(i => `- ${i.subject}`);
  return [header, ...lines].join('\n');
}

function generate() {
  const tags = getTags();
  const latestTag = tags[0];
  const commits = getCommits(latestTag);
  if (!commits.length) {
    console.log('No new commits since last tag, skip changelog update.');
    return false;
  }
  const sections = buildSections(commits).map(formatSection).join('\n\n');
  const date = new Date().toISOString().slice(0,10);
  const versionHeader = `## Unreleased (${date})`;
  let existing = existsSync('CHANGELOG.md') ? readFileSync('CHANGELOG.md','utf8') : '# Changelog\n\n';
  // 若已有 Unreleased 块则替换
  if (/## Unreleased.*?(?=\n## v|$)/s.test(existing)) {
    existing = existing.replace(/## Unreleased.*?(?=\n## v|$)/s, `${versionHeader}\n\n${sections}\n\n`);
  } else {
    existing = existing.replace(/^# Changelog\n?/, `# Changelog\n\n${versionHeader}\n\n${sections}\n\n`);
  }
  writeFileSync('CHANGELOG.md', existing);
  console.log('CHANGELOG.md updated with Unreleased section.');
  return true;
}

if (require.main === module) {
  generate();
}
