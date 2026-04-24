import prompts from 'prompts';

// Ctrl+C produces res.value === undefined — treat as abort
function abortOnCancel(res) {
  if (res.value === undefined) process.exit(1);
  return res.value;
}

export async function confirm(message, initial = true) {
  return abortOnCancel(await prompts({ type: 'confirm', name: 'value', message, initial }));
}

export async function select(message, choices) {
  return abortOnCancel(await prompts({ type: 'select', name: 'value', message, choices }));
}

export async function text(message, initial = '') {
  return abortOnCancel(await prompts({ type: 'text', name: 'value', message, initial }));
}

export async function multiselect(message, choices) {
  return abortOnCancel(await prompts({ type: 'multiselect', name: 'value', message, choices }));
}
