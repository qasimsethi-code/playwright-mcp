/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { test, expect } from './fixtures';

test('browser_type', async ({ client, server }) => {
  server.setContent('/', `
    <title>Type test</title>
    <input type="text" id="name" placeholder="Your name">
  `, 'text/html');

  await client.callTool({ name: 'browser_navigate', arguments: { url: server.PREFIX } });

  expect(await client.callTool({
    name: 'browser_type',
    arguments: {
      element: 'name input',
      ref: 'e2',
      text: 'Alice',
    },
  })).toHaveResponse({
    code: expect.stringContaining(`fill('Alice')`),
  });
});

test('browser_evaluate', async ({ client, server }) => {
  server.setContent('/', `<title>Eval page</title><p>Hello</p>`, 'text/html');

  await client.callTool({ name: 'browser_navigate', arguments: { url: server.PREFIX } });

  expect(await client.callTool({
    name: 'browser_evaluate',
    arguments: {
      function: '() => document.title',
    },
  })).toHaveResponse({
    result: expect.stringContaining('Eval page'),
  });
});

test('browser_select_option', async ({ client, server }) => {
  server.setContent('/', `
    <title>Select test</title>
    <select id="color">
      <option value="red">Red</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
    </select>
  `, 'text/html');

  await client.callTool({ name: 'browser_navigate', arguments: { url: server.PREFIX } });

  expect(await client.callTool({
    name: 'browser_select_option',
    arguments: {
      element: 'color dropdown',
      ref: 'e2',
      values: ['green'],
    },
  })).toHaveResponse({
    code: expect.stringContaining('selectOption'),
    snapshot: expect.stringContaining('Green'),
  });
});

test('browser_hover', async ({ client, server }) => {
  server.setContent('/', `
    <title>Hover test</title>
    <button id="btn">Hover me</button>
  `, 'text/html');

  await client.callTool({ name: 'browser_navigate', arguments: { url: server.PREFIX } });

  expect(await client.callTool({
    name: 'browser_hover',
    arguments: {
      element: 'hover button',
      ref: 'e2',
    },
  })).toHaveResponse({
    code: expect.stringContaining('hover()'),
  });
});

test('browser_press_key', async ({ client, server }) => {
  server.setContent('/', `
    <title>Key test</title>
    <input type="text" id="field">
    <div id="result"></div>
    <script>
      document.getElementById('field').addEventListener('keydown', e => {
        if (e.key === 'Enter')
          document.getElementById('result').textContent = 'submitted';
      });
    </script>
  `, 'text/html');

  await client.callTool({ name: 'browser_navigate', arguments: { url: server.PREFIX } });
  await client.callTool({ name: 'browser_click', arguments: { element: 'text field', ref: 'e2' } });

  expect(await client.callTool({
    name: 'browser_press_key',
    arguments: { key: 'Enter' },
  })).toHaveResponse({
    code: expect.stringContaining(`keyboard.press('Enter')`),
    // snapshot omitted: keydown result div not in accessibility tree
  });
});

test('browser_navigate_back', async ({ client, server }) => {
  server.setContent('/page1', `<title>Page One</title><p>First page</p>`, 'text/html');
  server.setContent('/page2', `<title>Page Two</title><p>Second page</p>`, 'text/html');

  await client.callTool({ name: 'browser_navigate', arguments: { url: `${server.PREFIX}page1` } });
  await client.callTool({ name: 'browser_navigate', arguments: { url: `${server.PREFIX}page2` } });

  expect(await client.callTool({
    name: 'browser_navigate_back',
    arguments: {},
  })).toHaveResponse({
    code: `await page.goBack();`,
    snapshot: expect.stringContaining('First page'),
  });
});

test('browser_console_messages', async ({ client, server }) => {
  server.setContent('/', `
    <title>Console test</title>
    <script>console.log('hello from page');</script>
  `, 'text/html');

  await client.callTool({ name: 'browser_navigate', arguments: { url: server.PREFIX } });

  expect(await client.callTool({
    name: 'browser_console_messages',
    arguments: {},
  })).toHaveResponse({
    result: expect.stringContaining('hello from page'),
  });
});

test('browser_snapshot', async ({ client, server }) => {
  server.setContent('/', `
    <title>Snapshot test</title>
    <h1>Hello Snapshot</h1>
  `, 'text/html');

  await client.callTool({ name: 'browser_navigate', arguments: { url: server.PREFIX } });

  expect(await client.callTool({
    name: 'browser_snapshot',
    arguments: {},
  })).toHaveResponse({
    snapshot: expect.stringContaining('Hello Snapshot'),
  });
});

test('browser_wait_for', async ({ client, server }) => {
  server.setContent('/', `
    <title>Wait test</title>
    <div id="content">Loading...</div>
    <script>
      setTimeout(() => {
        document.getElementById('content').textContent = 'Ready!';
      }, 100);
    </script>
  `, 'text/html');

  await client.callTool({ name: 'browser_navigate', arguments: { url: server.PREFIX } });

  expect(await client.callTool({
    name: 'browser_wait_for',
    arguments: { text: 'Ready!' },
  })).toHaveResponse({
    snapshot: expect.stringContaining('Ready!'),
  });
});

test('browser_tabs', async ({ client, server }) => {
  server.setContent('/', `<title>Tab test</title><p>Main tab</p>`, 'text/html');

  await client.callTool({ name: 'browser_navigate', arguments: { url: server.PREFIX } });

  expect(await client.callTool({
    name: 'browser_tabs',
    arguments: { action: 'list' },
  })).toHaveResponse({
    result: expect.stringContaining('Tab test'),
  });
});
