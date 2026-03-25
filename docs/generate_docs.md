# Documentation Generation Guide

## Tool

The project uses **JSDoc** to generate HTML documentation from JSDoc comments in the source code.

## Configuration

The generator is configured in:

- [jsdoc.config.json](../jsdoc.config.json)

## Generation command

To generate the documentation, run the following command in the project root:

```bash
npm run docs:generate
```

This command runs:

```bash
jsdoc -c jsdoc.config.json
```

## Output directory

Generated documentation is written to:

```bash
generated-docs/jsdoc
```

The main entry file is:

```bash
generated-docs/jsdoc/index.html
```

## Recommended workflow

1. Make sure the source code contains up-to-date JSDoc comments.
2. Run `npm run docs:generate`.
3. Open `generated-docs/jsdoc/index.html` in a browser and verify the result.
4. If required by the assignment, archive the generated folder before submission.

## Creating an archive

To create a `.tar.gz` archive:

```bash
tar -czf jsdoc-documentation.tar.gz generated-docs/jsdoc
```

To create a `.zip` archive:

```bash
zip -r jsdoc-documentation.zip generated-docs/jsdoc
```

## Notes

- Documentation is generated only when the command is run explicitly.
- If source comments were changed, regenerate the documentation before submission or commit.
- To validate documentation quality before generation, run `npm run docs:check`.
- To run executable documentation examples, run `npm run docs:test`.
