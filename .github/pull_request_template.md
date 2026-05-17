## Summary

Describe what this PR changes.

## Challenge Checklist

### Server

- [ ] Create link
- [ ] Validate malformed short URL
- [ ] Reject duplicated short URL
- [ ] Delete link
- [ ] Resolve original URL from short URL
- [ ] List links
- [ ] Increment access count
- [ ] Export CSV
- [ ] Serve CSV through CDN/storage
- [ ] Generate unique CSV filename
- [ ] Performant listing

### Web

- [ ] Create link
- [ ] Validate malformed short URL
- [ ] Show duplicated short URL error
- [ ] Delete link
- [ ] Resolve short URL route
- [ ] List links
- [ ] Increment access count
- [ ] Download CSV
- [ ] Loading/empty/error/disabled states
- [ ] Responsive behavior

## Validation

- [ ] `pnpm run lint`
- [ ] `pnpm run test`
- [ ] `pnpm run build`
- [ ] Migrations tested
- [ ] Manual flow tested

## Screenshots or Recordings

Add screenshots/recordings for UI changes.

## Notes for Codex

Mention risky areas, contracts changed, migration impact or edge cases.
