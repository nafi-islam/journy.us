import { statesGraph } from "./statesGraph";

/**
 * Function to choose a valid start and target state for prompt
 */
export function getRandomStatePair() {
  const states = Object.keys(statesGraph);
  let start, target, shortestPath;

  do {
    start = states[Math.floor(Math.random() * states.length)];
    target = states[Math.floor(Math.random() * states.length)];
    shortestPath = findShortestPath(start, target);
  } while (!shortestPath || shortestPath.length > 7 || shortestPath.length < 4);

  return { start, target, length: shortestPath.length - 2 };
}

/**
 * Function to find the shortest path using BFS
 */
export function findShortestPath(
  start: string,
  target: string
): string[] | null {
  if (!start || !target) return null;
  if (start === target) return [start];

  const queue: [string, string[]][] = [[start, [start]]];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const [currentState, path] = queue.shift()!;
    for (const neighbor of statesGraph[currentState] || []) {
      if (!visited.has(neighbor)) {
        const newPath = [...path, neighbor];
        if (neighbor === target) return newPath;
        queue.push([neighbor, newPath]);
        visited.add(neighbor);
      }
    }
  }
  return null;
}
