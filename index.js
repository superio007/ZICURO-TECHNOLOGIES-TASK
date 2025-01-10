// Ensure global is defined
if (typeof global === 'undefined') {
  global = typeof window !== 'undefined' ? window : this;
}

// run `node index.js` in the terminal
console.log(`Hello Node.js v${process.versions.node}!`);