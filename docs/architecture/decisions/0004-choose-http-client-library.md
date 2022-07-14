# 1. Choose the best HTTP Client library on Node JS

Date: 2022-07-12

## Status

Accepted

## Context

We must choose a library to implements the external API call that we will develop.

### Option 1

Undici ( https://github.com/nodejs/undici ()

### Option 2

Fetch ( https://www.npmjs.com/package/node-fetch )

### Option 3

AXIOS ( https://axios-http.com/docs/intro )

## Decision

In the context of Firma Con IO, facing against the implements of call of http external API (backend IO, Tokenizer and QTSP) we decided for Undici because:

1. it is an official evolution of Fetch;
2. it follow the javascritp standards;
3. it will be included directly on Node.JS in v. 18
