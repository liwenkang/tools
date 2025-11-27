#!/usr/bin/env node
const { execSync } = require('child_process');
const { writeFileSync, readFileSync, existsSync } = require('fs');

function sh(cmd) { return execSync(cmd, { encoding: 'utf8' }).trim(); }
function getTags() { const out = sh('git tag --list --sort=creatordate'); return out ? out.split(/\n/).filter(Boolean) : []; }
function parseSemver(v){ const m = v.match(/^v?(\d+)\.(\d+)\.(\d+)$/); if(!m) return {major:0,minor:0,patch:0}; return {major:+m[1],minor:+m[2],patch:+m[3]}; }
function fmtSemver(o){ return `v${o.major}.${o.minor}.${o.patch}`; }
function classify(subject, body){
  const m = subject.match(/^(feat|fix|perf|refactor|docs|test|chore|style|ci|build)(\([^)]*\))?(!)?:/);
  const breakingByBang = !!(m && m[3]);
  const breakingByBody = /BREAKING CHANGE[:]?/i.test(body || '');
  if(m){ return {type:m[1],breaking: breakingByBang || breakingByBody}; }
  return {type:'other',breaking: breakingByBody};
}
function collectCommits(from, to){
  const range = from ? `${from}..${to}` : to;
  // 使用记录分隔符与字段分隔符，保留正文
  const raw = sh(`git log ${range} --pretty="format:%H%x1f%s%x1f%b%x1e"`);
  return raw.split('\x1e').filter(Boolean).map(rec => {
    const parts = rec.split('\x1f');
    const hash = parts[0];
    const subject = parts[1] || '';
    const body = parts[2] || '';
    return { hash, subject, body };
  });
}
function suggestNextVersion(prevTag, commits){ const prev = parseSemver(prevTag||'v0.0.0'); let level='patch'; let breaking=false; for(const c of commits){ const info=classify(c.subject, c.body); if(info.breaking) { breaking=true; break; } if(info.type==='feat') level = level==='patch' ? 'minor' : level; }
 const next={...prev}; if(breaking){ next.major++; next.minor=0; next.patch=0; return {version:fmtSemver(next),level:'major'}; } if(level==='minor'){ next.minor++; next.patch=0; return {version:fmtSemver(next),level:'minor'}; } next.patch++; return {version:fmtSemver(next),level:'patch'}; }
function group(commits){ const buckets={feat:[],fix:[],perf:[],refactor:[],docs:[],test:[],chore:[],style:[],other:[],breaking:[]}; for(const c of commits){ const info=classify(c.subject, c.body); if(info.breaking) buckets.breaking.push(c); buckets[info.type?info.type:'other'].push(c); } return buckets; }
function renderNotes(version, commits){ const buckets=group(commits); const order=['breaking','feat','fix','perf','refactor','docs','test','style','chore','other']; let out=`# ${version}\n\n`; const titles={breaking:'重大变更',feat:'新增',fix:'修复',perf:'性能',refactor:'重构',docs:'文档',test:'测试',style:'风格',chore:'杂项',other:'其他'}; for(const k of order){ if(!buckets[k].length) continue; out+=`## ${titles[k]}\n`; for(const c of buckets[k]){ if(k==='breaking'){ // 展示第一行与可能的 BREAKING CHANGE 描述
        const bodyLine = (c.body||'').split(/\n/).find(l=>/BREAKING CHANGE[:]?/i.test(l));
        const extra = bodyLine ? ' — ' + bodyLine.replace(/BREAKING CHANGE[:]?/i,'').trim() : '';
        out+=`- ${c.subject}${extra}\n`; 
      } else {
        out+=`- ${c.subject}\n`; }
    } out+='\n'; }
  return out; }
function main(){ const tags=getTags(); const currentHead=sh('git rev-parse --short HEAD'); const latestTag=tags.slice(-1)[0]; const commits=collectCommits(latestTag, 'HEAD'); if(!commits.length){ console.log('No new commits since last tag.'); return; }
 const suggestion=suggestNextVersion(latestTag, commits); const notes=renderNotes(suggestion.version, commits);
 writeFileSync('RELEASE_NOTES.md', notes);
 console.log(`Suggested version: ${suggestion.version} (${suggestion.level})`);
 console.log('Notes written to RELEASE_NOTES.md');
 // Update CHANGELOG Unreleased section if exists
 if(existsSync('CHANGELOG.md')){
   let existing=readFileSync('CHANGELOG.md','utf8');
   const date=new Date().toISOString().slice(0,10);
   const unreleasedHeader=`## Unreleased (${date})`;
   const insert=notes.replace(/^# .*\n\n?/,'');
   if(/## Unreleased/.test(existing)){
     existing=existing.replace(/## Unreleased.*?(?=\n## v|$)/s, `${unreleasedHeader}\n\n${insert}\n`);
   } else {
     existing=existing.replace(/^# Changelog\n?/, `# Changelog\n\n${unreleasedHeader}\n\n${insert}\n`);
   }
   writeFileSync('CHANGELOG.md', existing);
   console.log('CHANGELOG.md updated (Unreleased section).');
 }
}
if(require.main===module){ main(); }
