export default {
  client: '@hey-api/client-fetch',
  input: 'https://dev-api.beachrex.com/docs?api-docs.json',
  output: {
    path: './src/lib/api-client',
    format: 'prettier',
    lint: 'eslint',
  },
  plugins: [
    {
      name: '@hey-api/typescript',
      enums: 'javascript',
      tree: false,
      exportFromIndex: true,
    },
    {
      name: '@hey-api/sdk',
      asClass: false,
      operationId: true
    },
    {
      name: '@tanstack/react-query',
      infiniteQueryOptions: true,
      queryOptions: true,
      mutationOptions: false,
      queryKeyBuilder: 'infer',
    } 
  ]
};

