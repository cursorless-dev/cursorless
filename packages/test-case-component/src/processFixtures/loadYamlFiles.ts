export type LoadYamlFilesArgs = {
    dir: string;
    deps: {
        fs: any;
        path: any;
        yaml: any;
    };
    allowList?: string[];
};

/**
 * Loads YAML files from a directory, optionally filtering by an allow list.
 * @param args Object containing dir, deps, and optional allowList
 * @returns Array of parsed YAML objects, each with a filename property
 */
export async function loadYamlFiles(args: LoadYamlFilesArgs) {
    const { dir, deps, allowList } = args;
    const { fs, path, yaml } = deps;
    // Use dir as-is, since it is already absolute
    const directoryPath = dir;
    const files = fs.readdirSync(directoryPath);
    const data: any[] = [];

    files.forEach((file: string) => {
        if (
            path.extname(file) === ".yml" &&
            (!allowList || allowList.includes(file))
        ) {
            try {
                const filePath = path.join(directoryPath, file);
                const fileContents = fs.readFileSync(filePath, "utf8");
                const yamlData: any = yaml.load(fileContents);
                yamlData.filename = file;
                data.push(yamlData);
            } catch {
                console.error("File load failure", file);
            }
        }
    });

    return data;
}
