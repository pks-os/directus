import { getDefaultIndexName } from '../../../../utils/get-default-index-name.js';
import { SchemaHelper } from '../types.js';

export class SchemaHelperSQLite extends SchemaHelper {
	override generateIndexName(
		type: 'unique' | 'foreign' | 'index',
		collection: string,
		fields: string | string[],
	): string {
		return getDefaultIndexName(type, collection, fields, { maxLength: Infinity });
	}

	override async preColumnChange(): Promise<boolean> {
		const foreignCheckStatus = (await this.knex.raw('PRAGMA foreign_keys'))[0].foreign_keys === 1;

		if (foreignCheckStatus) {
			await this.knex.raw('PRAGMA foreign_keys = OFF');
		}

		return foreignCheckStatus;
	}

	override async postColumnChange(): Promise<void> {
		await this.knex.raw('PRAGMA foreign_keys = ON');
	}

	override async getDatabaseSize(): Promise<number | null> {
		try {
			const result = await this.knex.raw(
				'SELECT page_count * page_size as "size" FROM pragma_page_count(), pragma_page_size();',
			);

			return result[0]?.['size'] ? Number(result[0]?.['size']) : null;
		} catch {
			return null;
		}
	}

	override addInnerSortFieldsToGroupBy() {
		// SQLite does not need any special handling for inner query sort columns
	}
}
