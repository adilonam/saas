export type StackTraceNormalizeOptions = {
  foldDuplicates: boolean;
  stripAbsolutePaths: boolean;
  stripLineNumbers: boolean;
};

const PATH_LINE =
  /\(?(\/[\w./-]+\/)((?:[\w.-]+\.(?:java|kt|kts|ts|tsx|js|jsx|mjs|cjs|py|go|rs|rb|php|cs|cpp|cc|cxx|h|hpp|swift|scala|clj|ex|exs|erl|beam)))(:\d+)?(?::\d+)?\)?/gi;

export function normalizeStackTrace(
  input: string,
  opts: StackTraceNormalizeOptions,
): string {
  let text = input.replace(/\r\n/g, "\n");
  let lines = text.split("\n");

  if (opts.stripAbsolutePaths) {
    lines = lines.map((line) =>
      line.replace(PATH_LINE, (_full, _dir, file, col) =>
        col ? `${file}${col}` : file,
      ),
    );
  }

  if (opts.stripLineNumbers) {
    lines = lines.map((line) =>
      line
        .replace(/:\d+:\d+/g, "")
        .replace(/:\d+\)/g, ")")
        .replace(/:\d+$/g, ""),
    );
  }

  if (opts.foldDuplicates) {
    const out: string[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      let count = 1;
      while (i + count < lines.length && lines[i + count] === line) {
        count += 1;
      }
      out.push(line);
      if (count > 1) {
        out.push(`    ↳ (repeated ${count}×)`);
      }
      i += count;
    }
    lines = out;
  }

  return lines.join("\n");
}
