#!/usr/bin/env node

/**
 * Rade CLI entry point.
 * Delegates to src/index.js for command registration and execution.
 */

import { run } from '../src/index.js';

run(process.argv);
