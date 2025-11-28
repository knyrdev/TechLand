import { readdirSync } from "node:fs";
import { Router } from "express";
import { fileURLToPath } from "url";
import path from "path";


const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PATH_ROUTES = __dirname;

function removeExtension(fileName) {
    const cleanFileName = fileName.split(".").shift();
    return cleanFileName;
}

/**
 * @param file tracks.ts
 */
function loadRouter(file) {
    const name = removeExtension(file);
    if (name !== "index") {
        import(`./${file}`).then((routerModule) => {
            router.use(`/${name}`, routerModule.router);
            console.log(`Loaded route: /${name}`);
        });
    }
}

readdirSync(PATH_ROUTES).filter((file) => loadRouter(file));

export default router;