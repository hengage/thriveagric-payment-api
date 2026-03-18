/**
 * Scaffolds a new domain under `src/domain/<domainName>` with the full
 * repository → service → controller → routes → validation → model → index.ts structure.
 *
 * Usage:
 *   npx ts-node scripts/scaffold-domain.ts <domainName>
 * Example:
 *   npx ts-node scripts/scaffold-domain.ts invoices
 *
 * Add to package.json scripts for convenience:
 *   "scaffold": "ts-node scripts/scaffold-domain.ts"
 * Then run:
 *   npm run scaffold invoices
 *
 * What gets created:
 *   src/domain/<domainName>/
 *     ├── <singular>.model.ts            ← Sequelize model stub
 *     ├── <domainName>.repository.ts
 *     ├── <domainName>.service.ts
 *     ├── <domainName>.controller.ts
 *     ├── <domainName>.routes.ts
 *     ├── <domainName>.validation.ts
 *     └── index.ts                       ← barrel export
 *
 * After scaffolding:
 *   1. Fill in the model columns
 *   2. Register the model in src/config/db.ts
 *   3. Register the router in src/routes/index.ts
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const domainName = process.argv[2];

if (!domainName) {
  console.error('❌  Please provide a domain name.');
  console.error('   Usage: npm run scaffold <domainName>');
  process.exit(1);
}

// Derive naming variants
const pascal   = domainName.charAt(0).toUpperCase() + domainName.slice(1);
const camel    = domainName.charAt(0).toLowerCase() + domainName.slice(1);
const singular = pascal.endsWith('s') ? pascal.slice(0, -1) : pascal;
const singularLower = singular.charAt(0).toLowerCase() + singular.slice(1);

const domainPath = join(__dirname, '..', 'src', 'domain', domainName);

if (existsSync(domainPath)) {
  console.error(`❌  Domain "${domainName}" already exists at ${domainPath}`);
  process.exit(1);
}

mkdirSync(domainPath, { recursive: true });

const files: Record<string, string> = {

  [`${singularLower}.model.ts`]:
`import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: '${domainName}', timestamps: true })
export class ${singular} extends Model {
  // TODO: define columns
  // @Column(DataType.STRING) name!: string;
}
`,

  [`${domainName}.repository.ts`]:
`import { ${singular} } from './${singularLower}.model';
import { HandleException } from '../../utils/handleException.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';

export const ${camel}Repository = {
  // TODO: implement repository methods
};
`,

  [`${domainName}.service.ts`]:
`import { ${camel}Repository } from './${domainName}.repository';
import { HandleException } from '../../utils/handleException.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';

export const ${camel}Service = {
  // TODO: implement service methods
};
`,

  [`${domainName}.controller.ts`]:
`import { Request, Response } from 'express';
import { ${camel}Service } from './${domainName}.service';
import { createSuccessResponse, createErrorResponse } from '../../utils/response.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';
import { HandleException } from '../../utils/handleException.utils';

export const ${camel}Controller = {
  async getAll(req: Request, res: Response) {
    try {
      // const result = await ${camel}Service.getAll();
      // return res.status(HTTP_STATUS.OK.code).json(createSuccessResponse('Fetched successfully', result));
    } catch (err) {
      const error = err as HandleException;
      return res.status(error.status || HTTP_STATUS.SERVER_ERROR.code).json(createErrorResponse(error));
    }
  },
};
`,

  [`${domainName}.routes.ts`]:
`import { Router } from 'express';
import { generalLimiter } from '../../middleware/rateLimit.middleware';
import { getProfile } from '../../middleware/auth.middleware';
import { ${camel}Controller } from './${domainName}.controller';

const router = Router();

// TODO: define routes
// router.get('/', generalLimiter, getProfile, ${camel}Controller.getAll);

export { router as ${camel}Router };
`,

  [`${domainName}.validation.ts`]:
`import Joi from 'joi';
import { JOI_VALIDATION_CODES } from '../../constants/joiCodes';
import { MESSAGES } from '../../utils/messages';

// TODO: define Joi schemas
// export const create${singular}Schema = Joi.object({ ... });
`,

  [`index.ts`]:
`export { ${singular} } from './${singularLower}.model';
export { ${camel}Repository } from './${domainName}.repository';
export { ${camel}Service } from './${domainName}.service';
export { ${camel}Router } from './${domainName}.routes';
`,
};

for (const [filename, content] of Object.entries(files)) {
  writeFileSync(join(domainPath, filename), content, 'utf8');
}

console.log(`\n✅  Domain "${domainName}" scaffolded at src/domain/${domainName}/\n`);
console.log('   Files created:');
Object.keys(files).forEach((f) => console.log(`     - src/domain/${domainName}/${f}`));
console.log('\n   Next steps:');
console.log(`     1. Fill in the model columns in ${singularLower}.model.ts`);
console.log(`     2. Register the model in src/config/db.ts`);
console.log(`        → import { ${singular} } from '../domain/${domainName}';`);
console.log(`        → models: [..., ${singular}]`);
console.log(`     3. Register the router in src/routes/index.ts`);
console.log(`        → import { ${camel}Router } from '../domain/${domainName}';`);
console.log(`        → this.router.use('/${domainName}', ${camel}Router);`);
