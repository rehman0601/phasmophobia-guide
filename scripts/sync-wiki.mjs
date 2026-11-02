import { writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';

const GHOSTS = [
  'Aswang', 'Banshee', 'Dayan', 'Deildegast', 'Demon', 'Deogen',
  'Gallu', 'Goryo', 'Hantu', 'Jinn', 'Kormos', 'Mare', 'Moroi',
  'Myling', 'Obake', 'Obambo', 'Oni', 'Onryo', 'Phantom', 'Poltergeist',
  'Raiju', 'Revenant', 'Shade', 'Spirit', 'Thaye', 'The Mimic',
  'The Twins', 'Wraith', 'Yokai', 'Yurei'
];

const EVIDENCE = ['emf-5', 'spirit-box', 'ultraviolet', 'ghost-orbs', 'ghost-writing', 'freezing-temperatures', 'dots-projector'];

async function main() {
  console.log('sync-wiki starting...');
  console.log('This script is a skeleton; see spec §9.2 for full algorithm.');
  console.log(`Processing ${GHOSTS.length} ghosts and ${EVIDENCE.length} evidence types`);
  console.log('See you in the guide!');
}

main().catch(e => { console.error(e); process.exit(1); });