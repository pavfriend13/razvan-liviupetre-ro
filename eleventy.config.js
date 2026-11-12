import markdownIt from "markdown-it";

const md = markdownIt({ html: false, linkify: true, typographer: true });

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Textele de forma [ ... ] sunt câmpuri care necesită confirmare: le evidențiem vizual.
const markTodos = (html) =>
  html
    .split(/(<[^>]+>)/g)
    .map((part) =>
      part.startsWith("<")
        ? part
        : part.replace(/\[([^\]]+)\]/g, '<mark class="todo" title="Necesită completare sau confirmare">[$1]</mark>')
    )
    .join("");

const luni = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

export default function (eleventyConfig) {
  // ---------- Fișiere statice ----------
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css", "src/main.js": "main.js" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2": "assets/fonts/archivo-latin.woff2",
    "node_modules/@fontsource-variable/archivo/files/archivo-latin-ext-wdth-normal.woff2": "assets/fonts/archivo-latin-ext.woff2",
  });
  eleventyConfig.addWatchTarget("src/styles.css");
  eleventyConfig.addWatchTarget("src/main.js");

  // ---------- Filtre ----------
  eleventyConfig.addFilter("todo", (s) => markTodos(escapeHtml(s ?? "")));
  eleventyConfig.addFilter("md", (s) => markTodos(md.render(s ?? "")));
  eleventyConfig.addFilter("mdInline", (s) => markTodos(md.renderInline(s ?? "")));
  eleventyConfig.addFilter("isTodo", (s) => /\[[^\]]+\]/.test(s ?? ""));
  eleventyConfig.addFilter("plain", (s) => String(s ?? "").replace(/\[|\]/g, ""));

  eleventyConfig.addFilter("dataRo", (d) => {
    if (!d) return "";
    const x = d instanceof Date ? d : new Date(d);
    if (isNaN(x)) return String(d);
    return `${x.getUTCDate()} ${luni[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("iso", (d) => {
    const x = d instanceof Date ? d : new Date(d);
    return isNaN(x) ? "" : x.toISOString().slice(0, 10);
  });
  // 0723.248.285 → +40723248285 (pentru linkuri tel:)
  eleventyConfig.addFilter("telHref", (s) => {
    const d = String(s ?? "").replace(/[^\d+]/g, "");
    return d.startsWith("0") ? "+40" + d.slice(1) : d;
  });
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("absUrl", (path, base) => new URL(path || "/", base).href);
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("findBy", (arr, key, val) => (arr || []).find((x) => x && x[key] === val));
  // Articole similare: întâi cele din aceeași categorie, apoi cele mai recente.
  eleventyConfig.addFilter("related", (all, url, categorie, n = 3) => {
    const others = (all || []).filter((a) => a.url !== url);
    return others
      .filter((a) => a.data.categorie === categorie)
      .concat(others.filter((a) => a.data.categorie !== categorie))
      .slice(0, n);
  });
  eleventyConfig.addFilter("upcoming", (events, now = new Date()) =>
    (events || []).filter((e) => new Date(e.data.date_end || e.date) >= now).sort((a, b) => a.date - b.date)
  );
  eleventyConfig.addFilter("past", (events, now = new Date()) =>
    (events || []).filter((e) => new Date(e.data.date_end || e.date) < now).sort((a, b) => b.date - a.date)
  );

  // ---------- Colecții ----------
  eleventyConfig.addCollection("articole", (api) =>
    api.getFilteredByGlob("src/articole/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("evenimente", (api) =>
    api.getFilteredByGlob("src/evenimente/*.md").sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
