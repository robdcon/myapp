import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './graphql/schema/index.ts',
  documents: ['/**/*.tsx', '/**/*.ts'],
  generates: {
    './graphql/generated/': {
      preset: 'client',
      plugins: ['typescript', 'typescript-operations'],
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        avoidOptionals: {
          // Use `null` for nullable fields instead of optionals
          field: true,
          // Allow nullable input fields to remain unspecified
          inputValue: false,
        },
        // Use `unknown` instead of `any` for unconfigured scalars
        defaultScalarType: 'unknown',
        // Apollo Client always includes `__typename` fields
        nonOptionalTypename: true,
        // Apollo Client doesn't add the `__typename` field to root types so
        // don't generate a type for the `__typename` for root operation types.
        skipTypeNameForRoot: true,
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
