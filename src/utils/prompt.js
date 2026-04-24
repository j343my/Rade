import prompts from 'prompts';

/**
 * Ask a yes/no confirmation.
 * @param {string} message
 * @param {boolean} [initial=true]
 * @returns {Promise<boolean>}
 */
export async function confirm(message, initial = true) {
  const res = await prompts({
    type: 'confirm',
    name: 'value',
    message,
    initial,
  });
  // If user cancels (Ctrl+C), res.value is undefined
  if (res.value === undefined) {
    process.exit(1);
  }
  return res.value;
}

/**
 * Ask a select (single choice) question.
 * @param {string} message
 * @param {Array<{title: string, value: any, description?: string}>} choices
 * @returns {Promise<any>} - the selected value
 */
export async function select(message, choices) {
  const res = await prompts({
    type: 'select',
    name: 'value',
    message,
    choices,
  });
  if (res.value === undefined) {
    process.exit(1);
  }
  return res.value;
}

/**
 * Ask for text input.
 * @param {string} message
 * @param {string} [initial='']
 * @returns {Promise<string>}
 */
export async function text(message, initial = '') {
  const res = await prompts({
    type: 'text',
    name: 'value',
    message,
    initial,
  });
  if (res.value === undefined) {
    process.exit(1);
  }
  return res.value;
}

/**
 * Ask a multi-select (checkbox) question.
 * @param {string} message
 * @param {Array<{title: string, value: any, selected?: boolean}>} choices
 * @returns {Promise<any[]>}
 */
export async function multiselect(message, choices) {
  const res = await prompts({
    type: 'multiselect',
    name: 'value',
    message,
    choices,
  });
  if (res.value === undefined) {
    process.exit(1);
  }
  return res.value;
}
