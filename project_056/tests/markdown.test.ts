import { renderMarkdown, titleOf, wordCount } from "../src/markdown";
test("headings and emphasis", () => {
  expect(renderMarkdown("# Oi **mundo**")).toBe("<h1>Oi <strong>mundo</strong></h1>");
  expect(renderMarkdown("um *dois*")).toBe("<p>um <em>dois</em></p>");
});
test("escapes html", () => {
  expect(renderMarkdown("<script>x</script>")).toContain("&lt;script&gt;");
});
test("blocks safe links", () => {
  expect(renderMarkdown("[a](javascript:alert(1))")).toContain('href="#"');
  expect(renderMarkdown("[a](https://x.com)")).toContain('href="https://x.com"');
});
test("lists, code, quote", () => {
  expect(renderMarkdown("- a\n- b")).toBe("<ul><li>a</li><li>b</li></ul>");
  expect(renderMarkdown("1. a\n2. b")).toBe("<ol><li>a</li><li>b</li></ol>");
  expect(renderMarkdown("```\n<b>\n```")).toBe("<pre><code>&lt;b&gt;</code></pre>");
  expect(renderMarkdown("> hi")).toBe("<blockquote><p>hi</p></blockquote>");
});
test("title and words", () => {
  expect(titleOf("\n## Meu *plano*\nx")).toBe("Meu plano");
  expect(titleOf("")).toBe("Sem título");
  expect(wordCount(" a b  c ")).toBe(3);
});
