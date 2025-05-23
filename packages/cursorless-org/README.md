This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!


## LLMs Training Data

During the build process, an `llms.txt` file is automatically generated in the output directory. This file contains a concatenation of all markdown files from the documentation directory (`packages/cursorless-org-docs/src/docs/`) and is used for LLM training and reference.

You can find this file at `out/llms.txt` after running the build process.

To generate this file manually without running a full build, you can run:

```sh
pnpm generate-llms
```
