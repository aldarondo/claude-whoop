/**
 * claude-whoop MCP server factory.
 * Call createServer() to get a configured Server instance without a transport.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  getLatestRecovery,
  getRecoveries,
  getSleepCollection,
  getWorkouts,
  getCycles,
  getBodyMeasurement,
  formatRecovery,
  formatWeeklySummary,
} from './api.js';
import { storeMemory } from './memory.js';

function daysAgo(n) {
  return new Date(Date.now() - n * 86400_000).toISOString();
}

export function createServer() {
  const server = new Server(
    { name: 'claude-whoop', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'get_recovery',
        description: 'Get Whoop recovery score for today (or recent days) — includes HRV, resting heart rate, SpO₂, and skin temperature.',
        inputSchema: {
          type: 'object',
          properties: {
            days: { type: 'number', description: 'Number of recent days to return (default: 1 = today only)' },
          },
          required: [],
        },
      },
      {
        name: 'get_sleep',
        description: 'Get Whoop sleep records — performance score, time in each sleep stage, disturbances.',
        inputSchema: {
          type: 'object',
          properties: {
            days: { type: 'number', description: 'Number of recent nights to return (default: 7)' },
          },
          required: [],
        },
      },
      {
        name: 'get_workouts',
        description: 'Get recent Whoop workout records — sport, strain score, calories, heart rate zones.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Max number of workouts to return (default: 10)' },
          },
          required: [],
        },
      },
      {
        name: 'get_strain',
        description: 'Get daily strain (cycle) data — day strain score, kilojoules, average and max heart rate.',
        inputSchema: {
          type: 'object',
          properties: {
            days: { type: 'number', description: 'Number of recent days to return (default: 7)' },
          },
          required: [],
        },
      },
      {
        name: 'get_body_measurement',
        description: 'Get Whoop body measurements — height, weight, max heart rate, VO₂ max.',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'weekly_summary',
        description: 'Get a summary of the past 7 days: average recovery score, sleep performance, daily strain, and top workout by strain.',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      switch (name) {
        case 'get_recovery': {
          const days = args?.days ?? 1;
          if (days === 1) {
            const rec = await getLatestRecovery();
            const text = formatRecovery(rec);
            storeMemory(`Whoop recovery: ${text}`, 'recovery').catch(() => {});
            return { content: [{ type: 'text', text }] };
          }
          const data = await getRecoveries({ start: daysAgo(days), limit: days });
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }

        case 'get_sleep': {
          const days = args?.days ?? 7;
          const data = await getSleepCollection({ start: daysAgo(days), limit: days });
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }

        case 'get_workouts': {
          const data = await getWorkouts({ limit: args?.limit ?? 10 });
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }

        case 'get_strain': {
          const days = args?.days ?? 7;
          const data = await getCycles({ start: daysAgo(days), limit: days });
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }

        case 'get_body_measurement': {
          const data = await getBodyMeasurement();
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }

        case 'weekly_summary': {
          const [recoveries, sleeps, cycles, workouts] = await Promise.all([
            getRecoveries({ start: daysAgo(7), limit: 7 }),
            getSleepCollection({ start: daysAgo(7), limit: 7 }),
            getCycles({ start: daysAgo(7), limit: 7 }),
            getWorkouts({ start: daysAgo(7), limit: 20 }),
          ]);
          const text = formatWeeklySummary(
            recoveries.records ?? [],
            sleeps.records ?? [],
            cycles.records ?? [],
            workouts.records ?? []
          );
          return { content: [{ type: 'text', text }] };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `❌ Error: ${err.message}` }],
        isError: true,
      };
    }
  });

  return server;
}
