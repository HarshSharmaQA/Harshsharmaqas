/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

declare module "next/dist/server/lib/find-page-file" {
    export function findPageFile(
      rootDir: string,
      normalizedPagePath: string,
      pageExtensions: string[],
      isAppDir: boolean
    ): Promise<string | null>;

    export function getPagePaths(
        normalizedPagePath: string,
        pageExtensions: string[],
        isAppDir: boolean,
    ): string[];
}
