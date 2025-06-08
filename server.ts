import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": async () => {
      try {
        const demosDir = "demos";
        const demos = await readdir(demosDir, { withFileTypes: true });
        const demoList = demos
          .filter(dirent => dirent.isDirectory())
          .map(async dirent => {
            const demoPath = join(demosDir, dirent.name);
            const descPath = join(demoPath, "DESC.md");
            let description = "";

            try {
              description = await readFile(descPath, 'utf-8');
            } catch (e) {
              console.log(e);
            }

            return `
              <div class="demo-item">
                <h2><a href="/demos/${dirent.name}/">${dirent.name}</a></h2>
                ${description ? `<div class="description">${description}</div>` : ''}
              </div>
            `;
          });

        const demoItems = await Promise.all(demoList);

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Demos</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .demo-item { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                .demo-item h2 { margin-top: 0; }
                .demo-item a { color: #0066cc; text-decoration: none; }
                .demo-item a:hover { text-decoration: underline; }
                .description { margin-top: 10px; color: #666; }
              </style>
            </head>
            <body>
              <h1>Demos disponibles</h1>
              ${demoItems.join('')}
            </body>
          </html>
        `;

        return new Response(html, {
          headers: { "Content-Type": "text/html" }
        });
      } catch (error: any) {
        return new Response("Erreur lors de la lecture des démos: " + error.message, { status: 500 });
      }
    },
    "/demos/:name/": async (req: any) => {
      const name = req.params.name;
      const indexPath = join("demos", name, "index.ts");

      if (await Bun.file(indexPath).exists()) {
        const html = `
          <!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
    <style>
      body {
        margin: 0;
        height: 100dvh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #000;
        overflow: hidden;
      }
      canvas {
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        width: 100vmin;
        max-width: calc(192px * 2);
        height: auto;
      
        display: block;
      }
    </style>
  </head>
  <body>
    <canvas id="canvas"></canvas>
    <script type="module" src="/demos/${name}/index.ts"></script>
  </body>
</html>

          `
        return new Response(html, {
          headers: { "Content-Type": "text/html" }
        });
      }
      return new Response("Not Found", { status: 404 });
    },
    "/demos/:name/textures/*": async (req: any) => {
      const texturePath = req.url.slice(req.url.indexOf("/demos/") + 6);
      const file = Bun.file('demos/' + texturePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not Found", { status: 404 });
    },
    "/demos/:name/*": async (req: any) => {
      const filePath = req.url.slice(req.url.indexOf("/demos/"));
      const result = await Bun.build({
        entrypoints: [filePath.slice(1)],
        target: "browser",
        minify: false,
        sourcemap: "inline",
      });

      const output = await result?.outputs[0]?.text();
      return new Response(output, {
        headers: { "Content-Type": "application/javascript" }
      });
    },
  }
});

console.log(`🚀 Server running at http://localhost:${server.port}`); 