import { loadTestCaseFixture } from "../loadTestCaseFixture";
import { loadYamlFiles } from "./loadYamlFiles";

export interface LoadAndProcessFixturesOptions {
    fixturesDir: string;
    allowList?: string[];
    deps: {
        fs: any;
        path: any;
        yaml: any;
    };
}

/**
 * Loads YAML test case files from a directory, processes them into fixtures, and returns an array of processed test case data.
 * Optionally filters which files to load using an allow list.
 *
 * @param {Object} options - Options for loading and processing fixtures.
 * @param {string} options.fixturesDir - Directory containing YAML fixture files.
 * @param {string[]=} options.allowList - Optional list of filenames to include.
 * @returns {Promise<any[]>} Array of processed test case data, each with a `raw` property containing the original YAML object.
 */
export async function loadAndProcessFixtures({
    fixturesDir,
    allowList,
    deps,
}: LoadAndProcessFixturesOptions) {
    const fixtures = await loadYamlFiles({
        dir: fixturesDir,
        deps,
        allowList,
    });
    const data_errors: any[] = [];

    const data = (
        await Promise.all(
            fixtures.map(async (val: any) => {
                try {
                    const fixture = await loadTestCaseFixture(val);
                    return { ...fixture, raw: val };
                } catch (err) {
                    console.error(err);
                    data_errors.push(val);
                    return null;
                }
            })
        )
    ).filter((test: any) => test != null);

    if (data_errors.length > 0) {
        console.error("data errors:", data_errors);
    }

    return data;
}
