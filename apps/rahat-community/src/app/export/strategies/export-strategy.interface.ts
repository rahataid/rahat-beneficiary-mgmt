/**
 * ExportStrategy defines the contract for all export implementations.
 *
 * The ExportService orchestrates these steps in order:
 *   prepare() → generate() → store() → notify()
 *
 * To add a new export type:
 * 1. Create a new file: `export/strategies/<name>-export.strategy.ts`
 * 2. Implement this interface as an @Injectable() NestJS service
 * 3. Register it in `export/export.module.ts` providers
 * 4. Add the type key to `ExportType` in `export/export.service.ts`
 * 5. Map the new strategy in the ExportService constructor
 * 6. Add a new endpoint in `export/export.controller.ts`
 *
 * Example:
 * ```typescript
 * @Injectable()
 * export class ReportExportStrategy implements ExportStrategy {
 *   async prepare(params) { ... }
 *   generate(data) { ... }
 *   async store(buffer, metadata) { ... }
 *   async notify(storeResult, metadata) { ... }
 * }
 * ```
 */
export interface ExportStrategy {
  /**
   * Step 1: Fetch and prepare the data to be exported.
   * @param params - Input parameters (e.g. groupUUID, appURL, filters)
   * @returns data: the array of records to export
   * @returns metadata: contextual info passed to subsequent steps (group name, count, appURL, etc.)
   */
  prepare(params: any): Promise<{ data: any[]; metadata: Record<string, any> }>;

  /**
   * Step 2: Transform the data into a file buffer.
   * @param data - The array of records from prepare()
   * @returns Buffer containing the file content (CSV, Excel, JSON, etc.)
   */
  generate(data: any[]): Buffer;

  /**
   * Step 3: Upload the file buffer to storage (e.g. Cloudflare R2, S3).
   * @param buffer - The file buffer from generate()
   * @param metadata - Metadata from prepare() (used for file naming, paths)
   * @returns key: the storage key/path, url: the accessible file URL
   */
  store(buffer: Buffer, metadata: Record<string, any>): Promise<{ key: string; url: string }>;

  /**
   * Step 4: Send a notification/callback after the export is stored.
   * @param storeResult - The key and url from store()
   * @param metadata - Metadata from prepare() (used for callback payload)
   */
  notify(
    storeResult: { key: string; url: string },
    metadata: Record<string, any>,
  ): Promise<void>;
}
