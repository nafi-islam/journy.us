// v1 daily puzzles (static/validChallenges.json) and the graph they were generated with
// the json is used until SWITCH_DATE (see daily.ts), then deleted in a follow-up

import { statesGraph, type StatesGraph } from './statesGraph';

export interface LegacyChallenge {
	dailyStartState: string;
	dailyTargetState: string;
	dailyPathLength: number;
	shortestPath: string[];
}

export type LegacyChallenges = Record<string, LegacyChallenge>;

// Function to copy a graph and add one border in both directions
function withBorder(graph: StatesGraph, a: string, b: string): StatesGraph {
	const copy: StatesGraph = {};
	for (const state of Object.keys(graph)) copy[state] = [...graph[state]];
	copy[a].push(b);
	copy[b].push(a);
	return copy;
}

// the v1 graph had arizona-colorado as a border (four corners). the legacy daily puzzles were
// generated with it, so they keep using it and no in-progress day changes for players
export const legacyStatesGraph: StatesGraph = withBorder(statesGraph, 'Arizona', 'Colorado');
