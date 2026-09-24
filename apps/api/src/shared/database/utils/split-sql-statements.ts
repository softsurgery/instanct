/**
 * Splits a SQL script into individual executable statements,
 * correctly ignoring semicolons inside string literals ('...', "..."),
 * backtick identifiers (`...`), and comments (-- ..., # ..., /* ... *\/).
 */
export function splitSqlStatements(sqlText: string): string[] {
  const statements: string[] = [];
  let current: string[] = [];
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escape = false;

  const n = sqlText.length;
  let i = 0;

  while (i < n) {
    const ch = sqlText[i];
    const nextChar = i + 1 < n ? sqlText[i + 1] : '';

    if (inLineComment) {
      current.push(ch);
      if (ch === '\n') {
        inLineComment = false;
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      current.push(ch);
      if (ch === '*' && nextChar === '/') {
        current.push('/');
        i += 2;
        inBlockComment = false;
        continue;
      }
      i++;
      continue;
    }

    if (escape) {
      current.push(ch);
      escape = false;
      i++;
      continue;
    }

    if (ch === '\\') {
      current.push(ch);
      escape = true;
      i++;
      continue;
    }

    if (inSingleQuote) {
      current.push(ch);
      if (ch === "'") {
        if (nextChar === "'") {
          current.push(nextChar);
          i += 2;
          continue;
        } else {
          inSingleQuote = false;
        }
      }
      i++;
      continue;
    }

    if (inDoubleQuote) {
      current.push(ch);
      if (ch === '"') {
        if (nextChar === '"') {
          current.push(nextChar);
          i += 2;
          continue;
        } else {
          inDoubleQuote = false;
        }
      }
      i++;
      continue;
    }

    if (inBacktick) {
      current.push(ch);
      if (ch === '`') {
        inBacktick = false;
      }
      i++;
      continue;
    }

    // Check for comment starts
    if (ch === '-' && nextChar === '-') {
      current.push(ch);
      inLineComment = true;
      i++;
      continue;
    }

    if (ch === '#') {
      current.push(ch);
      inLineComment = true;
      i++;
      continue;
    }

    if (ch === '/' && nextChar === '*') {
      current.push(ch);
      inBlockComment = true;
      i++;
      continue;
    }

    if (ch === "'") {
      inSingleQuote = true;
      current.push(ch);
      i++;
      continue;
    }

    if (ch === '"') {
      inDoubleQuote = true;
      current.push(ch);
      i++;
      continue;
    }

    if (ch === '`') {
      inBacktick = true;
      current.push(ch);
      i++;
      continue;
    }

    if (ch === ';') {
      const stmt = current.join('').trim();
      if (stmt) {
        statements.push(stmt);
      }
      current = [];
      i++;
      continue;
    }

    current.push(ch);
    i++;
  }

  const lastStmt = current.join('').trim();
  if (lastStmt) {
    statements.push(lastStmt);
  }

  return statements;
}
